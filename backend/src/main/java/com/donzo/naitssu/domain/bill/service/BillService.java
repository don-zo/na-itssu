package com.donzo.naitssu.domain.bill.service;

import com.donzo.naitssu.domain.bill.dto.AssemblyApiResponse;
import com.donzo.naitssu.domain.bill.entity.Bill;
import com.donzo.naitssu.domain.bill.repository.BillRepository;
import com.donzo.naitssu.domain.vote.entity.Vote;
import com.donzo.naitssu.domain.vote.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillService {

    private final BillRepository billRepository;
    private final VoteRepository voteRepository;
    private final AssemblyApiService assemblyApiService;
    private final UpstageService upstageService;
    
    @org.springframework.transaction.annotation.Transactional
    public com.donzo.naitssu.domain.vote.entity.Vote incrementAgree(Long billId) {
        java.util.Optional<com.donzo.naitssu.domain.vote.entity.Vote> existing = voteRepository.findById(billId);
        com.donzo.naitssu.domain.vote.entity.Vote vote = existing.orElseGet(() -> com.donzo.naitssu.domain.vote.entity.Vote.builder()
            .billId(billId)
            .agreeCount(0)
            .disagreeCount(0)
            .build());
        vote.incrementAgree();
        return voteRepository.save(vote);
    }

    @org.springframework.transaction.annotation.Transactional
    public com.donzo.naitssu.domain.vote.entity.Vote incrementDisagree(Long billId) {
        java.util.Optional<com.donzo.naitssu.domain.vote.entity.Vote> existing = voteRepository.findById(billId);
        com.donzo.naitssu.domain.vote.entity.Vote vote = existing.orElseGet(() -> com.donzo.naitssu.domain.vote.entity.Vote.builder()
            .billId(billId)
            .agreeCount(0)
            .disagreeCount(0)
            .build());
        vote.incrementDisagree();
        return voteRepository.save(vote);
    }

    @org.springframework.transaction.annotation.Transactional
    public com.donzo.naitssu.domain.vote.entity.Vote incrementAgree(Long billId, int n) {
        int add = Math.max(0, n);
        java.util.Optional<com.donzo.naitssu.domain.vote.entity.Vote> existing = voteRepository.findById(billId);
        com.donzo.naitssu.domain.vote.entity.Vote vote = existing.orElseGet(() -> com.donzo.naitssu.domain.vote.entity.Vote.builder()
            .billId(billId)
            .agreeCount(0)
            .disagreeCount(0)
            .build());
        vote.incrementAgreeBy(add);
        return voteRepository.save(vote);
    }

    @org.springframework.transaction.annotation.Transactional
    public com.donzo.naitssu.domain.vote.entity.Vote incrementDisagree(Long billId, int n) {
        int add = Math.max(0, n);
        java.util.Optional<com.donzo.naitssu.domain.vote.entity.Vote> existing = voteRepository.findById(billId);
        com.donzo.naitssu.domain.vote.entity.Vote vote = existing.orElseGet(() -> com.donzo.naitssu.domain.vote.entity.Vote.builder()
            .billId(billId)
            .agreeCount(0)
            .disagreeCount(0)
            .build());
        vote.incrementDisagreeBy(add);
        return voteRepository.save(vote);
    }

    @Transactional
    public void saveBillsFromAssemblyApi(int pageIndex, int pageSize, int age) {
        try {
            log.info("법안 데이터 동기화 시작: pageIndex={}, pageSize={}, age={}", pageIndex, pageSize, age);
            
            AssemblyApiResponse response = assemblyApiService.getBills(pageIndex, pageSize, age);
            log.info("국회 API 응답 받음: response={}", response);
            
            if (response == null) {
                throw new RuntimeException("국회 API 응답이 null입니다.");
            }
            
            if (response.getBills() == null) {
                throw new RuntimeException("국회 API 응답에서 bills 데이터가 null입니다. 응답: " + response);
            }
            
            if (response.getBills().isEmpty()) {
                throw new RuntimeException("국회 API 응답에서 bills 데이터가 비어있습니다. 응답: " + response);
            }
            
            log.info("법안 개수: {} 개", response.getBills().size());
            
            for (AssemblyApiResponse.BillItem billItem : response.getBills()) {
                try {
                    saveBillFromApiResponse(billItem);
                    log.info("법안 저장 성공: {}", billItem.getBillName());
                } catch (Exception e) {
                    log.error("개별 법안 저장 실패: billName={}, error={}", billItem.getBillName(), e.getMessage(), e);
                    throw new RuntimeException("법안 저장 실패: " + billItem.getBillName() + ", 원인: " + e.getMessage(), e);
                }
            }
            
            log.info("법안 데이터 저장 완료: {} 개", response.getBills().size());
        } catch (Exception e) {
            log.error("법안 데이터 저장 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("법안 데이터 저장 실패: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void saveBillFromApiResponse(AssemblyApiResponse.BillItem billItem) {
        try {
            log.info("법안 저장 시작: billName={}, billId={}", billItem.getBillName(), billItem.getBillId());
            
            // 법안 번호 파싱
            Integer billNo = null;
            try {
                billNo = Integer.parseInt(billItem.getBillNo());
                log.info("법안 번호 파싱 성공: {}", billNo);
            } catch (NumberFormatException e) {
                log.warn("법안 번호 파싱 실패: {}, 기본값 null 사용", billItem.getBillNo());
            }

            // 제안일 파싱
            LocalDate proposeDate = null;
            if (billItem.getProposeDate() != null && !billItem.getProposeDate().isEmpty()) {
                try {
                    proposeDate = LocalDate.parse(billItem.getProposeDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                    log.info("제안일 파싱 성공: {}", proposeDate);
                } catch (Exception e) {
                    log.warn("제안일 파싱 실패: {}, 기본값 null 사용", billItem.getProposeDate());
                }
            }

            // 법안 상세 내용 가져오기
            log.info("법안 상세 내용 가져오기 시작");
            String billContent = assemblyApiService.getBillContent(billItem.getBillNo());
            log.info("법안 상세 내용 가져오기 완료: length={}", billContent.length());
            
                   // Upstage API로 요약 생성
                   log.info("Upstage API 요약 생성 시작");
                   try {
                       // API 호출 제한을 피하기 위해 1초 대기
                       Thread.sleep(1000);
                   } catch (InterruptedException e) {
                       Thread.currentThread().interrupt();
                       log.warn("대기 중 인터럽트 발생");
                   }
                   String summary = upstageService.generateBillSummary(billItem.getBillName(), billContent);
                   log.info("Upstage API 요약 생성 완료");

                   // JSON 파싱하여 분리 저장 필드 세팅
                   String backgroundJson = null;
                   String contentJson = null;
                   String effectJson = null;
                   String summaryLine = null;
                   String summaryHighlight = null;
                   String tag = null;
                   try {
                       com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
                       com.fasterxml.jackson.databind.JsonNode root = om.readTree(summary);
                       // 배열 필드는 원본 배열을 문자열로 저장
                       if (root.has("background")) backgroundJson = om.writeValueAsString(root.get("background"));
                       if (root.has("content")) contentJson = om.writeValueAsString(root.get("content"));
                       if (root.has("effect")) effectJson = om.writeValueAsString(root.get("effect"));
                       if (root.has("summary")) summaryLine = root.get("summary").asText();
                       if (root.has("highlight")) summaryHighlight = root.get("highlight").asText();
                       if (root.has("tag")) tag = root.get("tag").asText();
                   } catch (Exception parseEx) {
                       log.warn("요약 JSON 파싱 실패, 원문 summary만 저장: {}", parseEx.getMessage());
                   }

                   // 태그 정규화: 허용 목록 이외는 "기타"로 강제
                   tag = normalizeTag(tag);

            // 법안 저장
            log.info("법안 엔티티 생성 시작");
            Bill bill = Bill.builder()
                .billNo(billNo)
                .billName(billItem.getBillName())
                .proposeDate(proposeDate)
                .proposer(billItem.getProposer())
                .proposerKind(billItem.getProposerKind())
                .summaryBackground(backgroundJson)
                .summaryContent(contentJson)
                .summaryEffect(effectJson)
                .summaryLine(summaryLine)
                    .summaryHighlight(summaryHighlight)
                    .tag(tag)
                .stage(billItem.getStage())
                .build();

            log.info("법안 DB 저장 시작");
            Bill savedBill = billRepository.save(bill);
            log.info("법안 DB 저장 완료: ID={}", savedBill.getId());

            // 투표 정보 초기화
            log.info("투표 정보 초기화 시작");
            Vote vote = Vote.builder()
                .billId(savedBill.getId())
                .agreeCount(0)
                .disagreeCount(0)
                .build();

            voteRepository.save(vote);
            log.info("투표 정보 초기화 완료");

            log.info("법안 저장 완료: ID={}, 제목={}", savedBill.getId(), savedBill.getBillName());
        } catch (Exception e) {
            log.error("법안 저장 중 오류 발생: billName={}, error={}", billItem.getBillName(), e.getMessage(), e);
            throw new RuntimeException("법안 저장 실패: " + billItem.getBillName() + ", 원인: " + e.getMessage(), e);
        }
    }

    private static final Set<String> ALLOWED_TAGS = Set.of("전체", "교통", "주거", "경제", "환경", "고용", "기타");

    private String normalizeTag(String raw) {
        if (raw == null) return "기타";
        String trimmed = raw.trim();
        // 일부 모델이 영문/소문자/공백 포함 반환하는 경우를 대비한 간단 매핑
        switch (trimmed.toLowerCase()) {
            case "전체":
            case "all":
                return "전체";
            case "교통":
            case "transport":
            case "교 통":
                return "교통";
            case "주거":
            case "housing":
                return "주거";
            case "경제":
            case "economy":
                return "경제";
            case "환경":
            case "environment":
                return "환경";
            case "고용":
            case "employment":
                return "고용";
            case "기타":
            case "etc":
            case "other":
                return "기타";
            default:
                // 허용 집합과 정확 일치 확인 (모델이 이미 한글 정확값을 줄 수도 있음)
                if (ALLOWED_TAGS.contains(trimmed)) return trimmed;
                return "기타";
        }
    }

    @Transactional(readOnly = true)
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Bill> getBillById(Long id) {
        return billRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Bill> getBillsPage(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return billRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Bill> searchBillsByTitle(String keyword, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return billRepository.findByBillNameContainingIgnoreCase(keyword, pageable);
    }

    @Transactional(readOnly = true)
    public List<Bill> getBillsByVotesDesc(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return billRepository.findAllOrderByVotesDesc(pageable).getContent();
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Bill> getBillsByVotesDescPage(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return billRepository.findAllOrderByVotesDesc(pageable);
    }

    @Transactional(readOnly = true)
    public java.util.Optional<Bill> getTopBillByVotes() {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 1);
        org.springframework.data.domain.Page<Bill> page = billRepository.findAllOrderByVotesDesc(pageable);
        if (page.hasContent()) {
            return java.util.Optional.of(page.getContent().get(0));
        }
        return java.util.Optional.empty();
    }

    @Transactional(readOnly = true)
    public java.util.List<Bill> getTopBillsByVotes(int limit) {
        int size = Math.max(1, limit);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, size);
        return billRepository.findAllOrderByVotesDesc(pageable).getContent();
    }
}
