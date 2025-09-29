package com.donzo.naitssu.domain.meeting.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfProcessingService {

    private final WebClient webClient;

    public Mono<byte[]> downloadPdf(String pdfUrl) {
        if (pdfUrl == null || pdfUrl.trim().isEmpty()) {
            log.warn("PDF URL이 비어있음");
            return Mono.empty();
        }

        log.info("PDF 다운로드 시작: {}", pdfUrl);

        return webClient.get()
                .uri(pdfUrl)
                .retrieve()
                .bodyToMono(byte[].class)
                .timeout(java.time.Duration.ofMinutes(5)) // 5분 타임아웃
                .doOnSuccess(data -> {
                    if (data != null) {
                        log.info("PDF 다운로드 완료: {} bytes ({} MB)", data.length, data.length / (1024.0 * 1024.0));
                    }
                })
                .doOnError(error -> log.error("PDF 다운로드 실패: {} - {}", pdfUrl, error.getMessage()))
                .onErrorReturn(new byte[0]); // 오류 시 빈 배열 반환
    }

    public String extractFilenameFromUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return "document.pdf";
        }
        
        try {
            String[] parts = url.split("/");
            String filename = parts[parts.length - 1];
            
            // 쿼리 파라미터 제거
            if (filename.contains("?")) {
                filename = filename.substring(0, filename.indexOf("?"));
            }
            
            // PDF 확장자가 없으면 추가
            if (!filename.toLowerCase().endsWith(".pdf")) {
                filename += ".pdf";
            }
            
            return filename;
        } catch (Exception e) {
            log.warn("파일명 추출 실패: {} - {}", url, e.getMessage());
            return "document.pdf";
        }
    }
}
