# Team AI - 구현 지시 프롬프트

> 작업 디렉토리: `backend/`
> 참조 문서: `docs/team_AI.md`, `docs/prd.md`

---

## 현재 상태 확인

`backend/main.py`를 먼저 읽어라. 현재 구현된 내용:
- `/api/summarize`: 구현 완료
- `/api/chat`: 구현 완료
- 모델명: `gemini-3.1-pro` (수정 필요)
- `/api/transcribe`: 미구현 (추가 필요)

`backend/requirements.txt`도 읽어라.

---

## 할 일 1: 모델명 수정

`main.py`에서 아래를 수정한다:
```python
# 변경 전
MODEL = "gemini-3.1-pro"

# 변경 후
MODEL = "gemini-2.0-flash"
```

---

## 할 일 2: `/api/transcribe` 엔드포인트 추가

### 개요
Card View에서 녹음된 오디오(WebM/Opus)를 받아 Gemini API로 화자 분리 전사 후 transcript 배열을 반환한다.
`End Conversation` 버튼 클릭 또는 타이머(10분) 만료 시 Frontend가 호출한다.

### Request / Response 스키마
```
Request:  multipart/form-data
  - audio: 오디오 파일 (WebM/Opus, MediaRecorder 출력)
  - question: string (현재 카드 질문, 컨텍스트 제공용)

Response: application/json
{
  "transcript": [
    { "speaker": "A", "text": "발화 내용" },
    { "speaker": "B", "text": "발화 내용" }
  ]
}
```

### 구현 방식

`google-generativeai` 네이티브 SDK를 사용한다. (파일 상단 기존 `openai` SDK와 별개로 초기화)

```python
# 파일 상단 import 및 초기화 추가
from fastapi import UploadFile, File, Form
import google.generativeai as genai
import tempfile, os, json

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
transcribe_model = genai.GenerativeModel("gemini-2.0-flash")


@app.post("/api/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    question: str = Form(...)
):
    # 1. 임시 파일로 저장
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        # 2. Gemini Files API에 업로드
        audio_file = genai.upload_file(tmp_path, mime_type="audio/webm")

        # 3. 화자 분리 전사 요청
        response = transcribe_model.generate_content([
            audio_file,
            f"""이 오디오는 두 사람이 다음 질문에 대해 나눈 대화입니다.
질문: {question}

오디오를 전사하고 화자를 구분해줘.
규칙:
- 화자가 바뀔 때마다 새 항목으로 분리
- 화자는 "A", "B"로만 표기
- 반드시 아래 JSON 배열 형식으로만 반환 (다른 텍스트 없이):
[
  {{"speaker": "A", "text": "발화 내용"}},
  {{"speaker": "B", "text": "발화 내용"}}
]"""
        ])

        # 4. 마크다운 코드블록 제거 후 JSON 파싱
        content = response.text.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        transcript = json.loads(content.strip())
        return {"transcript": transcript}

    finally:
        # 5. 임시 파일 반드시 삭제
        os.unlink(tmp_path)
```

### 주의사항
- `import json`은 파일 함수 내부에서 중복 import하지 말고 파일 상단에 한 번만 선언
- `finally` 블록으로 임시 파일 삭제 보장 (예외 발생 시에도 삭제)
- JSON 파싱 실패 시 500 에러가 발생하도록 자연스럽게 두면 됨 (MVP)

---

## 할 일 3: `requirements.txt` 업데이트

아래 두 패키지를 추가한다:
```
google-generativeai
python-multipart
```

`python-multipart`는 FastAPI에서 `File`, `Form` 처리 시 필수 의존성이다.

---

## 완료 기준

`uvicorn main:app --reload` 실행 후:
- `POST /api/transcribe`: WebM 오디오 파일 + question 전송 시 `{ "transcript": [...] }` 반환
- `POST /api/summarize`: question + transcript 전송 시 `{ "speakerA": ..., "speakerB": ..., "overall": ... }` 반환
- `POST /api/chat`: message + conversation_history + context 전송 시 `{ "reply": ... }` 반환
- 모든 엔드포인트 모델: `gemini-2.0-flash`
