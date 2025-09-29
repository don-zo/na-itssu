package com.donzo.naitssu.domain.meeting.service;

import com.donzo.naitssu.domain.meeting.dto.DocumentParseResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentParserService {

    private final WebClient webClient;

    @Value("${upstage.api.key}")
    private String upstageApiKey;

    @Value("${upstage.api.document.parse.url}")
    private String documentParseUrl;

    private static final int MAX_PAGES_PER_REQUEST = 100;

    public Mono<String> parseDocumentToText(byte[] pdfData, String filename) {
        log.info("PDF 문서 파싱 시작: {}", filename);

        try {
            // PDF 페이지 수 확인
            int totalPages = getPdfPageCount(pdfData);
            log.info("PDF 총 페이지 수: {} (파일: {})", totalPages, filename);

            if (totalPages <= MAX_PAGES_PER_REQUEST) {
                // 100페이지 이하면 한 번에 처리
                return parseDocumentChunk(pdfData, filename, 1, totalPages);
            } else {
                // 100페이지 초과면 분할 처리
                return parseDocumentInChunks(pdfData, filename, totalPages);
            }
        } catch (Exception e) {
            log.error("PDF 페이지 수 확인 실패: {} - {}", filename, e.getMessage());
            // 페이지 수 확인 실패 시 원본 그대로 시도
            return parseDocumentChunk(pdfData, filename, 1, -1);
        }
    }

    private Mono<String> parseDocumentInChunks(byte[] pdfData, String filename, int totalPages) {
        log.info("PDF 분할 처리 시작: {} (총 {}페이지)", filename, totalPages);

        List<Mono<String>> chunkParsers = new ArrayList<>();
        int chunkIndex = 1;

        for (int startPage = 1; startPage <= totalPages; startPage += MAX_PAGES_PER_REQUEST) {
            int endPage = Math.min(startPage + MAX_PAGES_PER_REQUEST - 1, totalPages);
            
            try {
                byte[] chunkData = splitPdfPages(pdfData, startPage, endPage);
                String chunkFilename = String.format("%s_chunk_%d_pages_%d-%d.pdf", 
                        filename.replace(".pdf", ""), chunkIndex, startPage, endPage);
                
                chunkParsers.add(parseDocumentChunk(chunkData, chunkFilename, startPage, endPage)
                        .onErrorReturn(""));
                
                chunkIndex++;
            } catch (Exception e) {
                log.error("PDF 청크 생성 실패: {} (페이지 {}-{})", filename, startPage, endPage, e);
                // 실패한 청크는 빈 문자열로 처리
                chunkParsers.add(Mono.just(""));
            }
        }

        return Flux.fromIterable(chunkParsers)
                .flatMap(mono -> mono)
                .collectList()
                .map(results -> {
                    String combinedText = String.join("\n\n", results.stream()
                            .filter(text -> !text.trim().isEmpty())
                            .toList());
                    
                    log.info("PDF 분할 파싱 완료: {} - 총 {}개 청크, 최종 텍스트 길이: {}", 
                            filename, results.size(), combinedText.length());
                    
                    return combinedText;
                });
    }

    private Mono<String> parseDocumentChunk(byte[] pdfData, String filename, int startPage, int endPage) {
        String pageInfo = (startPage > 0 && endPage > 0) ? 
                String.format(" (페이지 %d-%d)", startPage, endPage) : "";
        log.info("PDF 청크 파싱 시작: {}{}", filename, pageInfo);

        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.add("output_formats", "[\"text\"]");
        parts.add("ocr", "auto");
        parts.add("coordinates", "false");
        parts.add("model", "document-parse");
        
        // PDF 파일을 ByteArrayResource로 변환
        ByteArrayResource pdfResource = new ByteArrayResource(pdfData) {
            @Override
            public String getFilename() {
                return filename;
            }
        };
        parts.add("document", pdfResource);

        return webClient.post()
                .uri(documentParseUrl)
                .header("Authorization", "Bearer " + upstageApiKey)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(parts))
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), 
                         response -> response.bodyToMono(String.class)
                                 .flatMap(errorBody -> {
                                     log.error("Document Parser API 오류 - 상태: {}, 응답: {}", 
                                             response.statusCode(), errorBody);
                                     return Mono.error(new RuntimeException("Document Parser API 호출 실패: " + 
                                             response.statusCode() + " - " + errorBody));
                                 }))
                .bodyToMono(DocumentParseResponse.class)
                .map(response -> {
                    if (response != null && response.getContent() != null && 
                        response.getContent().getText() != null && 
                        !response.getContent().getText().trim().isEmpty()) {
                        log.info("PDF 청크 파싱 성공: {}{} (페이지 수: {})", filename, pageInfo,
                                response.getUsage() != null ? response.getUsage().getPages() : "N/A");
                        return response.getContent().getText();
                    } else {
                        log.warn("PDF 청크 파싱 결과가 비어있음: {}{}", filename, pageInfo);
                        return "";
                    }
                })
                .doOnError(error -> log.error("PDF 청크 파싱 실패: {}{} - {}", filename, pageInfo, error.getMessage()));
    }

    private int getPdfPageCount(byte[] pdfData) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdfData)) {
            return document.getNumberOfPages();
        }
    }

    private byte[] splitPdfPages(byte[] pdfData, int startPage, int endPage) throws IOException {
        try (PDDocument originalDocument = Loader.loadPDF(pdfData);
             PDDocument newDocument = new PDDocument()) {
            
            // 페이지는 0부터 시작하므로 1을 빼기
            int startIndex = startPage - 1;
            int endIndex = Math.min(endPage - 1, originalDocument.getNumberOfPages() - 1);
            
            for (int i = startIndex; i <= endIndex; i++) {
                PDPage page = originalDocument.getPage(i);
                newDocument.addPage(page);
            }
            
            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                newDocument.save(outputStream);
                return outputStream.toByteArray();
            }
        }
    }
}
