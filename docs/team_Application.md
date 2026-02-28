# Team Application - 작업 기록 & 고려사항

> Frontend(Next.js) + Backend(FastAPI) 구현 팀의 작업 기록 문서. 구현 전 고려사항 초안.

---

## 의사결정 확정 사항 (2026-02-28)

| 항목 | 결정 |
|------|------|
| ASR 방식 | Gemini API 배치 처리 (`/api/transcribe` Backend 호출) |
| 오디오 최대 시간 | **10분** - 타이머 만료 시 자동 `End Conversation` |
| 스트리밍 | MVP 미지원. 일반 fetch로 구현. 추후 `/api/chat`에서만 SSE 고려 |
| 상태 관리 | **Zustand** 사용 (Card View의 오디오/transcript 상태가 복잡하므로) |
| 데이터 저장소 | **localStorage** (MVP) |
| API 스키마 | 아래 확정 스키마 사용 |

---

## Frontend (Next.js)

### 앱 구조
- Next.js App Router 사용
- 라우팅: `/`, `/card/[cardId]`, `/history`, `/history/[id]`, `/chat`
- 컴포넌트는 `components/` 하위에 화면별 그룹핑 (`common/`, `home/`, `card/`, `history/`, `chat/`)

### 데이터 관리 (MVP - Local JSON)
- `public/data/cards.json` : Deck/Card 데이터 (읽기 전용)
- `public/data/conversations.json` : 대화 기록 저장
- 브라우저에서 JSON 파일을 직접 읽고 쓰는 것은 불가 → **localStorage 활용**
  - conversations는 localStorage에 저장하고, 앱 초기화 시 load
  - `public/data/conversations.json`은 초기 빈 배열 또는 샘플 데이터 seed용으로만 사용
- 추후 Supabase로 마이그레이션을 고려해 데이터 접근 레이어를 추상화할 것

### ASR (자동 음성 인식 + 화자 분리) - 확정

**방식: Gemini API 배치 처리** (결정 완료)

- **녹음**: Card View 진입 시 `MediaRecorder` API로 자동 녹음 시작
  - 포맷: `audio/webm;codecs=opus` (Chrome/Firefox 기본 지원)
  - 녹음 데이터는 `Blob` 청크로 누적
- **처리 시점**: `End Conversation` 버튼 클릭 또는 **타이머(10분) 만료** 시
  1. 누적된 오디오 `Blob`을 `FormData`로 Backend(`/api/transcribe`)에 전송
  2. Backend가 Gemini API로 화자 분리 + 전사 처리
  3. 반환된 `transcript` 배열을 `TranscriptPanel`에 표시 후 저장
- **타이머**: 10분 카운트다운. 만료 시 자동으로 End Conversation 플로우 실행

```typescript
// Card View 핵심 로직
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const audioChunksRef = useRef<Blob[]>([]);
const TIMER_DURATION = 10 * 60; // 10분 (초)

// 녹음 시작 (Card View 진입 시)
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
  recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
  recorder.start(1000); // 1초 단위 청크
  mediaRecorderRef.current = recorder;
};

// End Conversation (버튼 클릭 or 타이머 만료)
const handleEndConversation = async () => {
  mediaRecorderRef.current?.stop();
  const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

  const formData = new FormData();
  formData.append('audio', audioBlob, 'conversation.webm');
  formData.append('question', currentCard.question);

  const res = await fetch(`${API_BASE_URL}/api/transcribe`, {
    method: 'POST', body: formData
  });
  const { transcript } = await res.json();
  // → 이후 /api/summarize 호출 → localStorage 저장
};
```

### 상태 관리
- 전역 상태는 최소화, React Context 또는 Zustand 사용 검토
- Card View 내 현재 진행 중인 conversation (transcript 누적) 상태 관리 필요
- 페이지 이동 시 conversation 초기화 처리

### Backend API 연동
- `POST /api/transcribe` → End Conversation 시 오디오 전사 + 화자 분리 (신규 추가)
- `POST /api/summarize` → transcript 전달 후 요약 생성
- `POST /api/chat` → Chat View의 AI 대화
- fetch 사용, 환경변수로 API base URL 관리 (`NEXT_PUBLIC_API_URL`)
- 스트리밍 미지원 (일반 JSON 응답으로 구현)

### End Conversation 전체 플로우
```
1. mediaRecorder.stop()
2. POST /api/transcribe  { audio: Blob, question: string }
   → { transcript: [{speaker, text}, ...] }
3. POST /api/summarize   { question, transcript }
   → { speakerA, speakerB, overall }
4. localStorage에 conversation 저장
5. /history/[id] 로 이동 (요약 페이지)
```

---

## Backend (FastAPI)

### 엔드포인트

#### `POST /api/transcribe` (신규)
- **역할**: 오디오 파일 → 화자 분리 transcript 생성
- **Request**: `multipart/form-data`
  - `audio`: 오디오 파일 (WebM/Opus)
  - `question`: 현재 카드의 질문 텍스트 (컨텍스트용)
- **Response**:
  ```json
  {
    "transcript": [
      { "speaker": "A", "text": "string" },
      { "speaker": "B", "text": "string" }
    ]
  }
  ```

#### `POST /api/summarize`
- **역할**: 대화 종료 시 화자별 요약 및 전체 요약 생성
- **Request**:
  ```json
  {
    "question": "string",
    "transcript": [
      { "speaker": "A", "text": "string" }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "speakerA": "string",
    "speakerB": "string",
    "overall": "string"
  }
  ```

#### `POST /api/chat`
- **역할**: Chat View AI Agent 대화
- **Request**:
  ```json
  {
    "message": "string",
    "conversation_history": [ { "role": "user|assistant", "content": "string" } ],
    "context": [ /* localStorage의 conversations 전체 배열 (자동 주입, 사용자 선택 불필요) */ ]
  }
  ```
- **Response**:
  ```json
  {
    "reply": "string"
  }
  ```
- **중요**: Frontend는 Chat View 진입 시 Zustand에서 **모든 conversations**를 읽어 매 요청마다 `context`로 전송한다. 사용자가 conversation을 선택하는 UI는 없음.

### Gemini API 연동
- OpenAI-compatible endpoint 사용: `https://generativelanguage.googleapis.com/v1beta/openai/`
- `openai` Python SDK로 호출 (`base_url`, `api_key` 설정)
- 모델: `gemini-2.0-flash` (또는 최신 모델)

### CORS 설정
- `fastapi.middleware.cors.CORSMiddleware` 추가
- 개발 환경: `origins=["http://localhost:3000"]`
- 배포 시 도메인으로 변경

### 환경변수
- `.env` 파일로 관리 (`python-dotenv`)
- `GEMINI_API_KEY` 필수

---

## Frontend ↔ Backend 인터페이스 요약

| 기능 | 호출 주체 | 엔드포인트 | 시점 |
|------|----------|-----------|------|
| 오디오 전사 + 화자 분리 | Frontend | `POST /api/transcribe` | End Conversation or 타이머(10분) 만료 시 |
| 대화 요약 생성 | Frontend | `POST /api/summarize` | `/api/transcribe` 응답 수신 직후 |
| AI 채팅 | Frontend | `POST /api/chat` | Chat View에서 메시지 전송 시 |

---

## TODO / 미결 사항
- [x] ~~ASR 방식 확정~~ → Gemini API 배치 처리 확정
- [x] ~~상태 관리 라이브러리 선택~~ → Zustand 확정
- [x] ~~conversation 데이터 저장소 확정~~ → localStorage 확정
- [x] ~~스트리밍 응답 지원 여부 결정~~ → MVP 미지원, 추후 `/api/chat` SSE만 고려
- [ ] `MediaRecorder` 브라우저 권한 요청 및 에러 처리 구현
- [ ] 타이머 만료 시 End Conversation 자동 실행 로직 구현
- [ ] 오디오 Blob → FormData 전송 구현 (`/api/transcribe`)
- [ ] End Conversation 전체 플로우 (transcribe → summarize → 저장 → 이동) 구현
- [ ] API base URL 환경변수 구성 (`NEXT_PUBLIC_API_URL`)
- [ ] (추후) `/api/chat` SSE 스트리밍 지원
