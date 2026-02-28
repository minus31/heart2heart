## Project for Gemini 3 Hackathon

### Rules 
- Gemini hackathon에 참가하여 만드는 프로젝트 이므로, 모든 것은 google의 제품을 사용한다. 
- 

### Background

AI, Robot, biotech, and everything, 세상을 바꾼다고 하네요?
But, 전 확실하게 이야기합니다. 단 하나, 인류가 지구에 사는 동안 바뀌지 않는 중요한 가치는 "사랑" 입니다.
사람과 사람이 만나서 사랑을 나누는 것 만큼은 그 어떤 것도 대체할 수 없고 그러려고 하지도 않습니다.
저는 그 가치에 도움이 되고자 이 프로젝트를 생각했습니다.

저에게 있어 가장 행복한 순간은 제 여자친구와 대화할 때 입니다. 그저 존재할 뿐인 두 사람이 연결될 수 있는 유일한 방법이라고 생각이 들고, 특히 깊은 대화를 할 때면 서로가 연결된 느낌을 강하게 받기 때문입니다.

하지만, 제 과거와 주변을 보면 대화 경험이 항상 좋은 건 아닌 것 같습니다.
다양한 이유로 소통에 힘들어 하는 사람이 많은 것 같습니다.
말주변이 없다거나, 경험이 없다거나 ... 등등

사람들이 깊은 대화를 자연스럽게 나눌 수 있도록 도와드리려면 어떻게 해야하나 생각이 들었습니다.


### Product

**Overview**

웹 앱에서는 연인 간에 대화해보면 좋을 질문을 하나씩 카드 형태로 제공한다. 카드에 적힌 질문에 묻고 답하는 과정을 ASR을 통해 화자 별로 dictation 한다. 대화를 나눠본 질문은 리스트에서 조회 할 수 있고, 해당 리스트에서 질문에 대한 대화 이력을 확인할 수 있다. (각 사람의 의견과 생각 요약, 대화 요약, 대화 기록)

Chat UI도 있어, 이 대화 내역을 기반으로 상대방이나 자신의 답변을 상기하거나 정리/요약을 요청하거나, 페르소나를 부여해서 대화도 가능하게 한다.

> 이는 연인간의 관계에 대한 치료는 아니며, 그저 각자의 답변 기록을 토대로 중요하게 생각하는 것들을 다시 상기/정리하고 페르소나의 의견을 물어보는 기능임.


#### 사용 시나리오 (Use Case)

- **사용 방식**: 두 사람이 같은 기기(하나의 브라우저)를 함께 보며 사용한다. 화자 구분은 자동화자 분리 기술을 사용한다. 
- **세션**: 별도 로그인 없이 로컬 스토리지 기반의 세션으로 동작한다. (MVP)


#### 구성 요소

- **Card** - 질문 하나가 적혀있는 카드
- **Deck** - 질문 Card 8~12장으로 구성된 묶음. 각 Deck은 테마가 있으며 테마에 맞추어 Card가 그룹핑된다.
- **Conversation** - 하나의 Card에 대해 두 사람이 나눈 대화 세션. `End Conversation` 버튼을 누르면 저장된다.


#### 데이터 모델 (MVP - Local JSON)

**cards.json** (`public/data/cards.json`)
```json
{
  "decks": [
    {
      "id": "deck-001",
      "theme": "서로를 더 알아가기",
      "cards": [
        { "id": "card-001", "question": "당신이 가장 행복했던 순간은 언제인가요?" },
        ...
      ]
    }
  ]
}
```

**conversations.json** (`public/data/conversations.json`) - 대화 저장 시 append
```json
[
  {
    "id": "conv-001",
    "deckId": "deck-001",
    "cardId": "card-001",
    "question": "당신이 가장 행복했던 순간은 언제인가요?",
    "createdAt": "2026-02-28T12:00:00Z",
    "transcript": [
      { "speaker": "A", "text": "..." },
      { "speaker": "B", "text": "..." }
    ],
    "summaries": {
      "speakerA": "...",
      "speakerB": "...",
      "overall": "..."
    }
  }
]
```

#### 화면 구성

**URL 구조**
```
/                          → Home
/card/[cardId]             → Card View
/history                   → History 목록
/history/[conversationId]  → History 상세
/chat                      → Chat View
```

---

**Home**
- Deck이 Nx2 Grid로 나열된다.
- 첫번째 버전은 1개의 Deck만 있다.
- Deck 카드에는 테마명, 카드 수, 간단한 설명이 표시된다.
- 상단 네비게이션에 History, Chat 링크가 있다.

---

**Card View** (`/card/[cardId]`)
- 한 번에 하나의 Card 질문만 표시된다.
- Card 데이터는 `public/data/cards.json`에서 관리한다.
- **녹음**: Card View 진입 시 자동으로 녹음이 시작된다. 별도의 마이크 버튼이나 화자 전환 버튼은 없다.
- **ASR**: `End Conversation` 버튼 클릭 시 오디오 데이터가 서버로 전송되어 화자 분리 전사(Transcription) 및 요약이 진행된다. Card View에서는 전사 결과를 보여주지 않는다.
- **대화 시간 제한 (Timer)**: 카드 하나당 최대 대화 시간은 **10분**이다. Card View에 카운트다운 타이머가 표시되며, 타이머가 만료되면 자동으로 `End Conversation`이 실행된다.
- **하단 버튼**:
  - `Previous` - 이전 카드로 이동 (첫 번째 카드에서는 비활성화)
  - `End Conversation` - 현재까지의 대화를 저장하고 History에 기록. LLM이 요약 생성 후 저장.
  - `Next` - 다음 카드로 이동 (마지막 카드에서는 `Finish Deck`으로 변경되며, 클릭 시 `End Conversation`과 동일하게 동작)
- **뒤로가기 (Home)**: Card View 컨테이너 외부 좌상단에 뒤로가기 버튼이 있다. 클릭 시 "대화가 저장되지 않습니다. 정말 나가시겠습니까?" 확인 모달을 표시한다. 확인 시 conversation 초기화 후 Home으로 이동, 취소 시 Card View 유지.

---

**History View** (`/history`, `/history/[conversationId]`)
- **목록 화면** (`/history`): 저장된 Conversation을 카드 형태로 나열. 각 항목에 질문 텍스트, 날짜, Deck 테마명 표시.
- **상세 화면** (`/history/[conversationId]`): 하나의 Conversation에 대한 전체 기록.
  1. Speaker A 의견 요약 : Speaker A의 이름을 설정 할 수 있다. 
  2. Speaker B 의견 요약 : Speaker B의 이름을 설정 할 수 있다.
  3. 전체 대화 요약
  4. 전체 대화 transcript (화자 구분)
- 데이터는 `public/data/conversations.json`에서 관리 (MVP). 추후 Supabase DB로 이전.

---

**Chat View** (`/chat`)
- AI Agent와 1:1 채팅 UI. 1차 버전은 그냥 LLM이랑 대화할 수 있는 UI로만 구현하고 테스트를 거친 뒤에, Agent 능력과 Tool이나 컨텍스트 범위들을 자세하게 정의할 것 이다.
- **Agent 능력**:
  - 사용자의 모든 Conversation 기록(`conversations.json`) 전체를 자동으로 컨텍스트에 주입. (사용자가 직접 선택하지 않음)
  - 특정 질문에 대한 답변 상기: "내가 가장 행복했던 순간에 대해서 뭐라고 했지?"
  - 전체 대화 요약 및 패턴 분석: "우리가 주로 어떤 주제에 대해 이야기했어?"
  - 페르소나 부여: "SpeakerA가 이러한 설득방식에 안전함을 느낄까? " → Agent가 해당 페르소나로 답변.
- **구현**: FastAPI backend에서 Gemini API (OpenAI-compatible endpoint)를 호출. Frontend가 모든 conversations를 Request의 `context`로 전송, System prompt에 주입하는 방식.
- **UI**:
  - 좌측 사이드바: 사용자가 바로 눌러볼 수 있는 **예시 질문 4개** 표시. 클릭 시 입력창에 자동 입력.
    1. "우리가 나눈 대화에서 서로 가장 다른 점이 뭐야?"
    2. "내가 어떤 주제에 가장 진심이었어?"
    3. "우리 대화 전체를 요약해줘."
    4. "상대방이 가장 중요하게 생각하는 게 뭐야?"
  - 우측 채팅창: 메시지 목록 + 하단 고정 입력창.


#### Project Structure

```
/
├── frontend/          # Next.js
│   ├── app/
│   │   ├── page.tsx                     # Home
│   │   ├── card/[cardId]/page.tsx       # Card View
│   │   ├── history/page.tsx             # History 목록
│   │   ├── history/[id]/page.tsx        # History 상세
│   │   └── chat/page.tsx                # Chat View
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.tsx               # 상단 네비게이션 (History, Chat 링크)
│   │   │   └── ConfirmModal.tsx         # 범용 확인 모달
│   │   ├── home/
│   │   │   ├── DeckGrid.tsx             # Nx2 Deck 그리드 레이아웃
│   │   │   └── DeckCard.tsx             # 개별 Deck 카드 (테마명, 카드 수, 설명)
│   │   ├── card/
│   │   │   ├── QuestionCard.tsx         # 질문 텍스트 표시 영역
│   │   │   └── CardNavigation.tsx       # Previous / End Conversation / Next 버튼
│   │   ├── history/
│   │   │   ├── ConversationList.tsx     # 저장된 대화 목록
│   │   │   ├── ConversationListItem.tsx # 목록 내 개별 항목 (질문, 날짜, 테마)
│   │   │   ├── SpeakerSummary.tsx       # 화자별 의견 요약 카드
│   │   │   ├── OverallSummary.tsx       # 전체 대화 요약
│   │   │   └── TranscriptViewer.tsx     # 전체 transcript (화자 구분)
│   │   └── chat/
│   │       ├── ChatWindow.tsx           # 채팅 메시지 목록 영역
│   │       ├── ChatMessage.tsx          # 개별 메시지 버블
│   │       ├── ChatInput.tsx            # 메시지 입력창 + 전송 버튼
│   │       └── ConversationSidebar.tsx  # 참조할 대화 기록 필터 사이드바
│   └── public/
│       └── data/
│           ├── cards.json
│           └── conversations.json
└── backend/           # FastAPI
    └── main.py        # /api/chat, /api/summarize 엔드포인트
```


#### API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | Chat View용 Agent 대화 |
| POST | `/api/summarize` | Conversation 종료 시 요약 생성 |
| POST | `/api/transcribe` | 오디오 파일 → 화자 분리 transcript 반환 |


### Tech Stack

| 분류 | 기술 |
|------|------|
| Frontend | Next.js (App Router), Tailwind CSS |
| Backend | FastAPI (Python) |
| LLM | Gemini (OpenAI-compatible API) |
| ASR | Gemini API 배치 처리 (파일 업로드 → 화자 분리 전사) |
| 데이터 저장 | Local JSON in `public/` (MVP) → Supabase (추후) |


### MVP 범위 vs 추후 기능

| 기능 | MVP | 추후 |
|------|-----|------|
| Deck/Card 탐색 | ✅ 1개 Deck | ✅ 다수 Deck |
| ASR | ✅ 자동 녹음 + 자동 화자 분리 | - |
| 대화 저장 | ✅ Local JSON | Supabase DB |
| 요약 생성 | ✅ Gemini API | - |
| Chat Agent | ✅ 기본 대화 + 기록 참조 | 페르소나 고도화 |
| 인증 | ❌ (로컬 스토리지) | 로그인 / 커플 계정 연동 |
