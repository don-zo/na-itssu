package com.donzo.naitssu.domain.bill.controller;

import com.donzo.naitssu.domain.bill.entity.Bill;
import com.donzo.naitssu.domain.bill.service.BillService;
import com.donzo.naitssu.domain.vote.entity.Vote;
import com.donzo.naitssu.domain.vote.repository.VoteRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@Slf4j
public class BillController {

    private final BillService billService;
    private final VoteRepository voteRepository;
    
    private static final String VOTED_BILLS_SESSION_KEY = "votedBills";

    @PostMapping("/sync")
    public ResponseEntity<String> syncBillsFromAssembly(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "22") int age) {
        try {
            billService.saveBillsFromAssemblyApi(pageIndex, pageSize, age);
            return ResponseEntity.ok("법안 데이터 동기화가 완료되었습니다.");
        } catch (Exception e) {
            log.error("법안 데이터 동기화 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("법안 데이터 동기화에 실패했습니다: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllBills(HttpSession session) {
        try {
            List<Bill> bills = billService.getAllBills();
            Set<Long> votedBills = getVotedBills(session);
            
            // N+1 문제 해결: 벌크로 Vote 정보 조회
            List<Long> billIds = bills.stream().map(Bill::getId).toList();
            Map<Long, Vote> voteMap = voteRepository.findAllById(billIds).stream()
                .collect(java.util.stream.Collectors.toMap(Vote::getBillId, v -> v));
            
            List<Map<String, Object>> content = bills.stream()
                .map(b -> toBillWithVotes(b, voteMap.get(b.getId()), votedBills.contains(b.getId())))
                .toList();
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            log.error("법안 목록 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBillById(@PathVariable Long id, HttpSession session) {
        try {
            Optional<Bill> billOpt = billService.getBillById(id);
            if (billOpt.isEmpty()) return ResponseEntity.notFound().build();
            Bill bill = billOpt.get();
            Vote vote = voteRepository.findById(id).orElse(null);
            Set<Long> votedBills = getVotedBills(session);
            return ResponseEntity.ok(toBillWithVotes(bill, vote, votedBills.contains(id)));
        } catch (Exception e) {
            log.error("법안 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/page")
    public ResponseEntity<java.util.Map<String, Object>> getBillsByPage(
            @RequestParam(defaultValue = "0") int page,
            HttpSession session) {
        try {
            int size = 9;
            org.springframework.data.domain.Page<Bill> result = billService.getBillsPage(page, size);
            java.util.Map<String, Object> body = new java.util.HashMap<>();
            Set<Long> votedBills = getVotedBills(session);
            
            // N+1 문제 해결: 벌크로 Vote 정보 조회
            List<Long> billIds = result.getContent().stream().map(Bill::getId).toList();
            Map<Long, Vote> voteMap = voteRepository.findAllById(billIds).stream()
                .collect(java.util.stream.Collectors.toMap(Vote::getBillId, v -> v));
            
            List<Map<String, Object>> content = result.getContent().stream()
                .map(b -> toBillWithVotes(b, voteMap.get(b.getId()), votedBills.contains(b.getId())))
                .toList();
            body.put("content", content);
            body.put("page", result.getNumber());
            body.put("size", result.getSize());
            body.put("totalElements", result.getTotalElements());
            body.put("totalPages", result.getTotalPages());
            body.put("hasNext", result.hasNext());
            body.put("hasPrevious", result.hasPrevious());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            log.error("법안 페이지 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<java.util.Map<String, Object>> searchBills(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            HttpSession session) {
        try {
            int size = 9;
            org.springframework.data.domain.Page<Bill> result = billService.searchBillsByTitle(keyword, page, size);
            java.util.Map<String, Object> body = new java.util.HashMap<>();
            Set<Long> votedBills = getVotedBills(session);
            
            // N+1 문제 해결: 벌크로 Vote 정보 조회
            List<Long> billIds = result.getContent().stream().map(Bill::getId).toList();
            Map<Long, Vote> voteMap = voteRepository.findAllById(billIds).stream()
                .collect(java.util.stream.Collectors.toMap(Vote::getBillId, v -> v));
            
            List<Map<String, Object>> content = result.getContent().stream()
                .map(b -> toBillWithVotes(b, voteMap.get(b.getId()), votedBills.contains(b.getId())))
                .toList();
            body.put("content", content);
            body.put("page", result.getNumber());
            body.put("size", result.getSize());
            body.put("totalElements", result.getTotalElements());
            body.put("totalPages", result.getTotalPages());
            body.put("hasNext", result.hasNext());
            body.put("hasPrevious", result.hasPrevious());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            log.error("법안 검색 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/page/by-votes")
    public ResponseEntity<java.util.Map<String, Object>> getBillsByVotesDesc(
            @RequestParam(defaultValue = "0") int page,
            HttpSession session) {
        try {
            int size = 9;
            org.springframework.data.domain.Page<Bill> result = billService.getBillsByVotesDescPage(page, size);
            java.util.Map<String, Object> body = new java.util.HashMap<>();
            Set<Long> votedBills = getVotedBills(session);
            
            // N+1 문제 해결: 벌크로 Vote 정보 조회
            List<Long> billIds = result.getContent().stream().map(Bill::getId).toList();
            Map<Long, Vote> voteMap = voteRepository.findAllById(billIds).stream()
                .collect(java.util.stream.Collectors.toMap(Vote::getBillId, v -> v));
            
            List<Map<String, Object>> content = result.getContent().stream()
                .map(b -> toBillWithVotes(b, voteMap.get(b.getId()), votedBills.contains(b.getId())))
                .toList();
            body.put("content", content);
            body.put("page", result.getNumber());
            body.put("size", result.getSize());
            body.put("totalElements", result.getTotalElements());
            body.put("totalPages", result.getTotalPages());
            body.put("hasNext", result.hasNext());
            body.put("hasPrevious", result.hasPrevious());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            log.error("법안 투표순 페이지 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/top/by-votes")
    public ResponseEntity<Map<String, Object>> getTopBillByVotes(HttpSession session) {
        try {
            java.util.Optional<Bill> topOpt = billService.getTopBillByVotes();
            if (topOpt.isEmpty()) return ResponseEntity.notFound().build();
            Bill bill = topOpt.get();
            Vote vote = voteRepository.findById(bill.getId()).orElse(null);
            Set<Long> votedBills = getVotedBills(session);
            return ResponseEntity.ok(toBillWithVotes(bill, vote, votedBills.contains(bill.getId())));
        } catch (Exception e) {
            log.error("최다 투표 법안 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/topN/by-votes")
    public ResponseEntity<java.util.List<Map<String, Object>>> getTopNBillsByVotes(
            @RequestParam(defaultValue = "3") int n,
            HttpSession session) {
        try {
            java.util.List<Bill> list = billService.getTopBillsByVotes(n);
            Set<Long> votedBills = getVotedBills(session);
            
            // N+1 문제 해결: 벌크로 Vote 정보 조회
            List<Long> billIds = list.stream().map(Bill::getId).toList();
            Map<Long, Vote> voteMap = voteRepository.findAllById(billIds).stream()
                .collect(java.util.stream.Collectors.toMap(Vote::getBillId, v -> v));
            
            java.util.List<Map<String, Object>> result = list.stream()
                .map(b -> toBillWithVotes(b, voteMap.get(b.getId()), votedBills.contains(b.getId())))
                .toList();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("상위 N개 법안 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // /{id}/votes 엔드포인트 제거됨 (단건/목록 응답에 포함)

    @PostMapping("/{id}/votes/agree")
    public ResponseEntity<Vote> incrementAgree(@PathVariable Long id, @RequestParam(defaultValue = "1") int n, HttpSession session) {
        try {
            Vote updated = billService.incrementAgree(id, n);
            addVotedBill(session, id);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("찬성 증가 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/votes/disagree")
    public ResponseEntity<Vote> incrementDisagree(@PathVariable Long id, @RequestParam(defaultValue = "1") int n, HttpSession session) {
        try {
            Vote updated = billService.incrementDisagree(id, n);
            addVotedBill(session, id);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("반대 증가 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
// 헬퍼 메서드들

    /**
     * 세션에서 투표한 법률안 ID 목록 가져오기
     */
    @SuppressWarnings("unchecked")
    private Set<Long> getVotedBills(HttpSession session) {
        Set<Long> votedBills = (Set<Long>) session.getAttribute(VOTED_BILLS_SESSION_KEY);
        if (votedBills == null) {
            votedBills = new HashSet<>();
            session.setAttribute(VOTED_BILLS_SESSION_KEY, votedBills);
        }
        return votedBills;
    }

    /**
     * 세션에 투표한 법률안 ID 추가
     */
    private void addVotedBill(HttpSession session, Long billId) {
        Set<Long> votedBills = getVotedBills(session);
        votedBills.add(billId);
        session.setAttribute(VOTED_BILLS_SESSION_KEY, votedBills);
    }

    private Map<String, Object> toBillWithVotes(Bill bill, Vote vote, boolean hasVoted) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", bill.getId());
        m.put("billNo", bill.getBillNo());
        m.put("billName", bill.getBillName());
        m.put("proposeDate", bill.getProposeDate());
        m.put("proposer", bill.getProposer());
        m.put("proposerKind", bill.getProposerKind());
        m.put("stage", bill.getStage());
        m.put("summaryBackground", bill.getSummaryBackground());
        m.put("summaryContent", bill.getSummaryContent());
        m.put("summaryEffect", bill.getSummaryEffect());
        m.put("summaryLine", bill.getSummaryLine());
        m.put("summaryHighlight", bill.getSummaryHighlight());
        m.put("tag", bill.getTag());
        m.put("hasVoted", hasVoted); // 투표 여부 추가
        if (vote != null) {
            m.put("agreeCount", vote.getAgreeCount());
            m.put("disagreeCount", vote.getDisagreeCount());
            // Vote 엔티티에 totalCount 필드가 있으므로 합산 대신 필드 사용
            try {
                java.lang.reflect.Field f = Vote.class.getDeclaredField("totalCount");
                f.setAccessible(true);
                Object v = f.get(vote);
                if (v instanceof Integer total) {
                    m.put("totalCount", total);
                } else {
                    m.put("totalCount", vote.getAgreeCount() + vote.getDisagreeCount());
                }
            } catch (Exception ignored) {
                m.put("totalCount", vote.getAgreeCount() + vote.getDisagreeCount());
            }
        } else {
            m.put("agreeCount", 0);
            m.put("disagreeCount", 0);
            m.put("totalCount", 0);
        }
        return m;
    }

}
