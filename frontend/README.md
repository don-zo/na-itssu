# 🏛️ 시민의 목소리가 만드는 더 나은 대한민국, 국회잇슈

시민들이 국회 법률안에 대해 쉽게 이해하고 의견을 표현할 수 있는 민주주의 참여 플랫폼입니다.

---

## 📌 서비스 소개

국회잇슈는 복잡한 법률안을 시민들이 쉽게 이해하고, 찬성/반대 의견을 표현하며, AI 챗봇을 통해 궁금한 점을 물어볼 수 있는 국회 법률안 참여 플랫폼입니다. 국회 회의록과 법률안 정보를 요약하여 실시간으로 제공하여 민주주의를 더욱 활성화합니다.

---

## ✨ 주요 기능

### 1. 📜 법률안 조회 및 투표
- 발의된 법률안 목록 조회 및 상세 정보 확인
- 법률안에 대한 찬성/반대 투표 참여
- 실시간 투표율 및 참여자 수 확인
- 카테고리별 법률안 필터링 (교통, 주거, 경제, 복지, 환경, 교육 등)
- 최신순, 투표순 정렬 기능

### 2. 🔥 인기 법률안 추천
- 투표율이 높은 HOT 법률안 하이라이트
- 실시간 인기 법률안 마키 슬라이더
- 시민 참여도가 높은 이슈 우선 노출

### 3. 🏛️ 국회 회의 요약
- AI가 분석한 국회 회의록 요약 제공
- 오늘자 국회 활동 실시간 업데이트
- 주요 논의 사항 및 안건 한눈에 파악

### 4. 🤖 AI 챗봇 도우미
- **법률안 챗봇**: 법률안에 대한 궁금한 점을 실시간으로 질문
- **회의 챗봇**: 국회 회의록 내용에 대한 상세 설명 제공
- **스트리밍 응답**: 대화형 인터페이스

### 5. 🔍 통합 검색
- 법률안 제목 및 내용 검색
- 실시간 검색 결과 업데이트

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: React 19.1.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router DOM 7.9.2
- **State Management**: React Query 5.90.2
- **Styling**: Tailwind CSS 4.1.13
- **HTTP Client**: Axios 1.12.2
- **Icons**: Lucide React 0.544.0

### Development Tools
- **Linter**: ESLint 9.36.0
- **Type Checking**: TypeScript ESLint 8.44.0
- **CSS Processing**: PostCSS 8.5.6, Autoprefixer 10.4.21

---

## 🚀 시작하기

### 사전 요구사항
- Node.js 18.x 이상
- npm 또는 yarn


## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── apis/              
│   │   ├── client/        # API 클라이언트 설정
│   │   ├── hooks/         # React Query 커스텀 훅
│   │   ├── services/      # API 서비스 함수
│   │   └── types/         # API 타입 정의
│   ├── components/        
│   │   ├── Header.tsx
│   │   ├── BillCard.tsx
│   │   ├── chatbot.tsx
│   │   ├── MeetingChatbot.tsx
│   │   └── Pagination.tsx
│   ├── pages/             
│   │   ├── Home/          # 홈 페이지
│   │   ├── BillPage/      # 법률안 목록 페이지
│   │   ├── BillDetailPage/# 법률안 상세 페이지
│   │   └── ConferencePage/# 국회 회의 페이지
│   ├── routes/           
│   ├── styles/            
│   ├── utils/             
│   └── lib/               
├── public/                
└── package.json
```

---

## 🎨 주요 페이지

### 1. 홈 (`/`)
- 법률안 하이라이트
- 오늘의 국회 회의 요약
- 실시간 인기 법률안 요약

### 2. 법률안 목록 (`/bills`)
- 전체 법률안 목록
- 카테고리별 필터링
- 검색 및 정렬 기능

### 3. 법률안 상세 (`/bills/:id`)
- 법률안 상세 정보
- 진행 상태 및 투표 현황
- AI 챗봇을 통한 법률안 질의응답

### 4. 국회 회의 (`/conferences`)
- 국회 회의록 목록
- AI 요약 정보
- 회의 내용 챗봇 질의응답


## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
