# Hack Gemini3 Project

이 프로젝트는 Frontend(Next.js)와 Backend(FastAPI)로 구성되어 있습니다.
아래의 명령어를 통해 각각의 서버를 실행할 수 있습니다.

## 🖥 Frontend 실행 방법

Frontend는 `npm`을 패키지 매니저로 사용합니다.

```bash
cd frontend
npm install
npm run dev
```

- 로컬 서버: [http://localhost:3000](http://localhost:3000)

## ⚙️ Backend 실행 방법

Backend는 `uv`기반의 Python FastAPI 환경입니다. (API Key가 필요한 경우 `.env` 파일을 설정해주세요.)

```bash
cd backend
uv sync # (선택사항) 패키지 설치/동기화
uv run uvicorn main:app --reload
```

- 로컬 서버: [http://localhost:8000](http://localhost:8000) (기본 포트)
- Swagger API 문서: [http://localhost:8000/docs](http://localhost:8000/docs)
