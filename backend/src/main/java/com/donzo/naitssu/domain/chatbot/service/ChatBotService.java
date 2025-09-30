package com.donzo.naitssu.domain.chatbot.service;

import com.donzo.naitssu.domain.bill.entity.Bill;
import com.donzo.naitssu.domain.bill.repository.BillRepository;
import com.donzo.naitssu.domain.chatbot.dto.ChatRequest;
import com.donzo.naitssu.domain.chatbot.dto.UpstageRequest;
import com.donzo.naitssu.domain.meeting.entity.Meeting;
import com.donzo.naitssu.domain.meeting.repository.MeetingRepository;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatBotService {

    private final UpstageApiService upstageApiService;
    private final BillRepository billRepository;
    private final MeetingRepository meetingRepository;
    
    // 메모리에 세션별 대화 기록 저장 (해커톤용)
    private final Map<String, List<UpstageRequest.Message>> chatSessions = new ConcurrentHashMap<>();

    public Flux<String> chatStream(ChatRequest request) {
        // 세션 ID가 없으면 새로 생성
        String sessionId = request.getSessionId() != null ? request.getSessionId() : UUID.randomUUID().toString();
        
        return getContext(request.getBillId(), request.getMeetingId())
                .flatMapMany(context -> {
                    // 세션별 대화 기록 가져오기
                    List<UpstageRequest.Message> messages = chatSessions.computeIfAbsent(sessionId, k -> new ArrayList<>());
                    
                    // 첫 번째 메시지인 경우 시스템 프롬프트 추가
                    if (messages.isEmpty()) {
                        String systemPrompt = createSystemPrompt(context);
                        messages.add(new UpstageRequest.Message("system", systemPrompt));
                    }

                    if(Objects.equals(context, "BILL_NOT_FOUND") || Objects.equals(context, "MEETING_NOT_FOUND")){
                        throw new RuntimeException();
                    }
                    
                    // 사용자 메시지 추가
                    messages.add(new UpstageRequest.Message("user", request.getMessage()));
                    
                    // AI 스트리밍 응답 생성
                    StringBuilder fullResponse = new StringBuilder();
                    return upstageApiService.chatStream(messages)
                            .doOnNext(fullResponse::append)
                            .doOnComplete(() -> {
                                // 완성된 응답을 대화 기록에 추가
                                if (!fullResponse.isEmpty()) {
                                    messages.add(new UpstageRequest.Message("assistant", fullResponse.toString()));
                                }
                            });
                })
                .doOnError(error -> log.error("챗봇 스트리밍 서비스 오류", error))
                .onErrorReturn("죄송합니다. 서비스에 문제가 발생했습니다.");
    }

    private Mono<String> getContext(Long billId, Long meetingId) {
        // 회의 ID가 있는 경우 (회의 모드)
        if (meetingId != null) {
            return Mono.fromCallable(() -> meetingRepository.findById(meetingId))
                    .map(optionalMeeting -> {
                        if (optionalMeeting.isPresent()) {
                            Meeting meeting = optionalMeeting.get();
                            
                            // 회의 정보 구성
                            StringBuilder meetingInfo = new StringBuilder();
                            meetingInfo.append("회의명: ").append(meeting.getTitle()).append("\n");
                            meetingInfo.append("회의종류: ").append(meeting.getClassName() != null ? meeting.getClassName() : "정보 없음").append("\n");
                            meetingInfo.append("회의날짜: ").append(meeting.getConfDate() != null ? meeting.getConfDate() : "정보 없음").append("\n");
                            meetingInfo.append("대수: ").append(meeting.getDaeNum() != null ? meeting.getDaeNum() : "정보 없음").append("\n");
                            
                            if (meeting.getSubName() != null && !meeting.getSubName().trim().isEmpty()) {
                                meetingInfo.append("안건명: ").append(meeting.getSubName()).append("\n");
                            }
                            
                            if (meeting.getSummary() != null && !meeting.getSummary().trim().isEmpty()) {
                                meetingInfo.append("회의 요약: ").append(meeting.getSummary()).append("\n");
                            }
                            
                            // 일반 요약이 있다면 추가
                            if (meeting.getGeneralSummary() != null && !meeting.getGeneralSummary().trim().isEmpty()) {
                                meetingInfo.append("상세 내용: ").append(meeting.getGeneralSummary()).append("\n");
                            }
                            
                            return "SPECIFIC_MEETING|" + meetingInfo.toString();
                        }
                        return "MEETING_NOT_FOUND";
                    });
        }
        
        // 법률안 ID가 있는 경우 (법률안 모드)
        if (billId != null) {
            return Mono.fromCallable(() -> billRepository.findById(billId))
                    .map(optionalBill -> {
                        if (optionalBill.isPresent()) {
                            Bill bill = optionalBill.get();
                            return String.format("SPECIFIC_BILL|법률안 제목: %s\n법률안 요약: %s", bill.getTitle(), bill.getSummary());
                        }
                        return "BILL_NOT_FOUND";
                    });
        }
        
        // 둘 다 없는 경우 (일반 모드)
        return Mono.just("GENERAL_ASSEMBLY_QNA");
    }

    private String createSystemPrompt(String context) {
        if ("GENERAL_ASSEMBLY_QNA".equals(context)) {
            return """
                당신은 대한민국 국회에 대한 모든 것을 설명하는 전문 AI 어시스턴트입니다.
                단, 마크다운 문법을 사용하지 않으면서 대답해야 합니다.
                단순한 마크다운 문법 조차도 사용하지 마세요. (예: 강조, 번호 매기기, 굵은 글씨, 기울임꼴, 코드 블록 등)
                
                전문 분야:
                1. 국회의 구조와 운영 (본회의, 상임위원회, 특별위원회)
                2. 법률 제정 과정 (발의 → 위원회 심사 → 본회의 의결)
                3. 국정감사 및 국정조사
                4. 예산 심의 과정
                5. 국회의원의 역할과 권한
                6. 국회 용어 및 절차 설명
                7. 국회 역사와 제도
                
                역할:
                - 국회 관련 모든 질문에 친절하고 정확하게 답변
                - 복잡한 국회 절차를 쉽게 설명
                - 시민들이 이해하기 쉬운 용어로 설명
                - 객관적이고 중립적인 관점 유지
                - 한국어로 답변
                
                예시 질문들:
                "법률안은 어떻게 만들어지나요?",
                "국정감사란 무엇인가요?", "상임위원회는 뭔가요?" 등
                """;
        } else if (context.startsWith("SPECIFIC_BILL|")) {
            String billInfo = context.substring("SPECIFIC_BILL|".length());
            return String.format("""
                당신은 법률안(처리의안)에 대해 이해를 도와주는 전문 AI 어시스턴트입니다.
                단, 마크다운 문법을 사용하지 않으면서 대답해야 합니다.
                단순한 마크다운 문법 조차도 사용하지 마세요. (예: 강조, 번호 매기기, 굵은 글씨, 기울임꼴, 코드 블록 등)
                
                현재 법률안(처리의안) 정보:
                %s
                
                역할:
                1. 이 법률안의 내용을 쉽고 명확하게 설명해주세요
                2. 시민들이 이해하기 쉬운 용어로 답변해주세요
                3. 법률안 관련 궁금한 점에 친절하게 답변해주세요
                4. 한국어로 답변해주세요
                
                주의사항:
                - 정확하지 않은 정보는 제공하지 마세요
                - 특정 정치적 입장을 지지하거나 반대하지 마세요
                - 객관적이고 중립적인 관점을 유지해주세요
                - 마크다운 문법을 사용하지 않으면서 대답해야 합니다.
                - 단순한 마크다운 문법 조차도 사용하지 마세요. (예: 강조, 번호 매기기, 굵은 글씨, 기울임꼴, 코드 블록 등)
                """, billInfo);
        } else if (context.startsWith("SPECIFIC_MEETING|")) {
            String meetingInfo = context.substring("SPECIFIC_MEETING|".length());
            return String.format("""
                당신은 국회 본회의 회의록에 대해 이해를 도와주는 전문 AI 어시스턴트입니다.
                단, 마크다운 문법을 사용하지 않으면서 대답해야 합니다.
                단순한 마크다운 문법 조차도 사용하지 마세요. (예: 강조, 번호 매기기, 굵은 글씨, 기울임꼴, 코드 블록 등)
                
                현재 회의 정보:
                %s
                
                역할:
                1. 이 회의의 내용과 진행 과정을 쉽고 명확하게 설명해주세요
                2. 시민들이 이해하기 쉬운 용어로 답변해주세요
                3. 회의 관련 궁금한 점에 친절하게 답변해주세요
                4. 한국어로 답변해주세요
                
                주의사항:
                - 정확하지 않은 정보는 제공하지 마세요
                - 특정 정치적 입장을 지지하거나 반대하지 마세요
                - 객관적이고 중립적인 관점을 유지해주세요
                - 회의록에 없는 내용은 추측하지 마세요
                - 마크다운 문법을 사용하지 않으면서 대답해야 합니다.
                - 단순한 마크다운 문법 조차도 사용하지 마세요. (예: 강조, 번호 매기기, 굵은 글씨, 기울임꼴, 코드 블록 등)
                """, meetingInfo);
        } else {
            return "해당 법률안 또는 회의를 찾을 수 없습니다. 일반적인 국회 관련 질문을 해주세요.";
        }
    }

    // 새 세션 생성
    public String createSession() {
        String sessionId = UUID.randomUUID().toString();
        chatSessions.put(sessionId, new ArrayList<>());
        log.info("새 세션 생성: sessionId={}", sessionId);
        return sessionId;
    }
}
