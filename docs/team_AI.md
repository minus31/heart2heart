# Team AI - 작업 기록 & 고려사항

> Chat 엔진 및 AI 기능 개발 팀의 작업 기록 문서. 구현 전 고려사항 초안.

---

## 의사결정 확정 사항 (2026-02-28)

| 항목 | 결정 |
|------|------|
| ASR 방식 | Gemini API 배치 처리 (`google-generativeai` SDK) |
| 대화 시간 제한 | 최대 10분 (타이머 만료 시 자동 End Conversation) |
| 스트리밍 응답 | MVP 미지원. 추후 `/api/chat`에서만 SSE 고려 |
| 응답 스키마 | 아래 확정 스키마 사용 |

---

## 사용 API

- **Gemini API** (OpenAI-compatible endpoint)
  - Base URL: `https://generativelanguage.googleapis.com/v1beta/openai/`
  - 인증: `GEMINI_API_KEY`
  - SDK: Python `openai` 라이브러리 (`base_url` + `api_key` 재설정)
  - 모델: `gemini-2.0-flash` (속도/비용 균형)

- **Gemini API** (네이티브 SDK - ASR 전용)
  - SDK: Python `google-generativeai` 라이브러리
  - 오디오 업로드: `genai.upload_file()` → Files API
  - 최대 오디오 길이: 9.5시간 (제한 없음에 가까움)
  - 인라인 전송 제한: 20MB → 안전하게 Files API 사용
  - 오디오 토큰 비율: 1초 = 32 토큰 (10분 = 19,200 토큰)

---

## 기능 0: 오디오 전사 + 화자 분리 (`/api/transcribe`)

### 역할
- Card View에서 녹음된 오디오 파일을 받아 화자별로 분리된 transcript 반환
- `End Conversation` 또는 타이머 만료(10분) 시 자동 호출됨

### API 스키마 (확정)
```json
// Request: multipart/form-data
{
  "audio": "<binary audio file>",   // WebM/Opus (MediaRecorder 기본 출력)
  "question": "string"              // 현재 카드의 질문 (컨텍스트 제공용)
}

// Response
{
  "transcript": [
    { "speaker": "A", "text": "발화 내용" },
    { "speaker": "B", "text": "발화 내용" }
  ]
}
```

### 구현 방식
```python
import google.generativeai as genai
import tempfile, os

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# 오디오 파일 업로드 (Files API)
audio_file = genai.upload_file(audio_path, mime_type="audio/webm")

response = model.generate_content([
    audio_file,
    f"""이 오디오는 두 사람이 다음 질문에 대해 나눈 대화입니다.
질문: {question}

오디오를 전사하고 화자를 구분해줘.
- 화자가 바뀔 때마다 새 항목으로 분리
- 화자는 "A", "B"로만 표기
- 반드시 아래 JSON 배열 형식으로만 반환 (다른 텍스트 없이):
[
  {{"speaker": "A", "text": "발화 내용"}},
  {{"speaker": "B", "text": "발화 내용"}}
]"""
])
```

### 고려사항
- 오디오 파일을 임시 파일로 저장 후 업로드, 처리 완료 후 삭제
- 응답이 JSON 파싱 불가능할 경우 재시도 또는 fallback 처리 필요
- WebM/Opus 포맷을 Gemini가 직접 지원 (변환 불필요)

---

## 기능 1: 대화 요약 (`/api/summarize`)

### 역할
- Card 하나에 대한 두 사람의 대화가 끝났을 때 호출
- 화자A 요약, 화자B 요약, 전체 대화 요약 3가지를 생성

### 프롬프트 설계 초안
```
System:
당신은 두 연인의 대화를 분석하는 어시스턴트입니다.
주어진 대화 기록을 바탕으로 아래 세 가지를 JSON 형식으로 반환하세요:
1. speakerA: Speaker A의 핵심 의견과 감정 요약 (2-3문장)
2. speakerB: Speaker B의 핵심 의견과 감정 요약 (2-3문장)
3. overall: 두 사람의 대화 전체 요약 및 공통점/차이점 (3-4문장)

User:
질문: {question}
대화 기록:
{transcript}
```

### 고려사항
- 응답은 반드시 JSON 파싱 가능하게 강제 (`response_format` 또는 프롬프트 지시)
- transcript가 매우 짧거나 비어있을 경우 graceful 처리

---

## 기능 2: Chat Agent (`/api/chat`)

### 역할
- 사용자가 Chat View에서 AI와 자유롭게 대화
- 사용자의 모든 conversation 기록을 컨텍스트로 참조

### 시스템 프롬프트 설계 초안
```
System:
당신은 두 연인의 대화 기록을 알고 있는 따뜻한 AI 어시스턴트입니다.
아래는 두 사람이 나눈 대화 기록 요약입니다:

{conversation_context}

이 기록을 바탕으로 사용자의 질문에 답변하세요.
- 과거 대화 내용을 구체적으로 인용해서 답변하세요.
- 심리 치료나 관계 분석보다는, 기억을 상기시키고 정리해주는 역할에 집중하세요.
- 페르소나 요청이 있을 경우 해당 역할로 전환하세요.
```

### 컨텍스트 주입 방식 (확정)
- Frontend가 localStorage의 **전체 conversations**를 Request의 `context` 배열로 전송
- Backend는 수신한 `context` 전체를 system prompt에 주입 (필터링 없음, MVP)
- 컨텍스트 크기 제한 고려 불필요 (Gemini Flash: 1M token context → MVP에서는 제한 없이 사용 가능)
- 추후 개선: 최근 N개 또는 키워드 기반 필터링

### 페르소나 기능
- 사용자가 채팅 입력에서 페르소나를 요청하면 (예: "심리상담사 입장에서 말해줘")
- 별도 페르소나 전환 메커니즘 없이, 프롬프트 내 지시로 처리
- 추후: 페르소나 프리셋 버튼 제공 가능

### 대화 히스토리 관리
- `conversation_history` 배열로 이전 turn을 유지
- Frontend에서 턴마다 누적하여 전송
- 너무 길어질 경우 최근 N turn만 전송 (추후 개선)

---

## 확정 API 응답 스키마

### `POST /api/transcribe`
```json
// Response
{
  "transcript": [
    { "speaker": "A", "text": "string" },
    { "speaker": "B", "text": "string" }
  ]
}
```

### `POST /api/summarize`
```json
// Request
{
  "question": "string",
  "transcript": [
    { "speaker": "A", "text": "string" }
  ]
}
// Response
{
  "speakerA": "string",
  "speakerB": "string",
  "overall": "string"
}
```

### `POST /api/chat`
```json
// Request
{
  "message": "string",
  "conversation_history": [{ "role": "user|assistant", "content": "string" }],
  "context": [ /* conversations.json 전체 또는 일부 */ ]
}
// Response
{
  "reply": "string"
}
```

---

## 고려사항 정리

| 항목 | 현재 계획 (확정) | 추후 개선 |
|------|----------|----------|
| ASR 방식 | Gemini API 배치 (Files API) | - |
| 요약 모델 | `gemini-2.0-flash` | 필요 시 고급 모델로 전환 |
| 컨텍스트 전달 | 전체 conversations.json | 관련 대화만 필터링 |
| 응답 포맷 | JSON (전사/요약), 자유 텍스트 (채팅) | `/api/chat` SSE 스트리밍 |
| 페르소나 | 프롬프트 내 자연어 처리 | 프리셋 버튼 |
| 언어 | 한국어 우선 | 다국어 |

---

## TODO / 미결 사항
- [ ] `/api/transcribe` 프롬프트 테스트 및 정교화
- [ ] 요약 프롬프트 최종 확정 및 테스트
- [ ] Chat system prompt 최종 확정 및 테스트
- [x] 오디오 임시 파일 처리 로직 구현 (업로드 후 삭제) → 완료 (2026-02-28)
- [ ] 컨텍스트 크기가 커질 경우 처리 전략 수립
- [ ] (추후) `/api/chat` SSE 스트리밍 구현

---

## 작업 로그

### 2026-02-28

#### `backend/main.py` 수정
- **모델명 수정**: `gemini-3.1-pro` → `gemini-2.0-flash`
- **`/api/transcribe` 엔드포인트 구현**
  - `google-generativeai` 네이티브 SDK 사용 (OpenAI 호환 SDK와 별개)
  - `multipart/form-data`로 오디오 파일(`audio`) + 질문 텍스트(`question`) 수신
  - `tempfile`로 임시 저장 → `genai.upload_file()` Files API 업로드 → `finally` 블록에서 임시 파일 삭제
  - 응답에서 마크다운 코드블록(` ```json `) 자동 제거 후 JSON 파싱
  - 상단에 `google.generativeai` 초기화 (`genai.configure`, `transcribe_model`) 추가
- **import 정리**: `UploadFile`, `File`, `Form`, `genai`, `json`, `tempfile` 추가. 함수 내 중복 `import json` 제거

#### `backend/requirements.txt` 수정
- `google-generativeai` 추가 (네이티브 SDK)
- `python-multipart` 추가 (FastAPI `File`/`Form` 처리 필수)
