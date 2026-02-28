# Team UI - 작업 기록 & 고려사항

> UI/디자인 팀의 작업 기록 문서. 구현 전 고려사항 초안.

---

## 디자인 시스템

### 컬러
- 감성적이고 따뜻한 톤 고려 (연인 간 대화라는 컨셉에 맞게)
- Primary, Neutral, Surface, Error 등 기본 토큰 정의 필요
- 다크모드 지원 여부 결정 필요 (MVP에서는 라이트모드만 우선)

### 타이포그래피
- 질문 텍스트는 가독성이 최우선 → 충분한 폰트 사이즈와 line-height
- 한국어 폰트 고려 (Noto Sans KR 등)

### 간격 / 레이아웃
- Tailwind의 기본 spacing scale 사용
- 모바일 우선 반응형 (두 사람이 하나의 기기를 보는 시나리오 → 태블릿/데스크탑도 고려)

---

## 화면별 레이아웃 고려사항

### Home
- Deck 카드가 Nx2 Grid로 배치됨 (MVP: 1개 Deck)
- Deck 카드: 테마명, 카드 수, 한줄 설명
- 상단 Nav: 로고/앱명 + History, Chat 링크
- 전체적으로 심플하고 따뜻한 첫인상

### Card View (`/card/[cardId]`)
- 질문 텍스트가 화면 중앙에 크게 배치 → 읽기 편하게
- 하단 고정 버튼 영역: Previous / End Conversation / Next
- 좌상단 뒤로가기 버튼 (Container 외부)
- 녹음 상태 표시 UI 필요 (녹음 중임을 시각적으로 표시 → 예: 파형 애니메이션, 빨간 점 등)
- **타이머 UI (`ConversationTimer`)**: 상단에 카운트다운 표시 (10:00 → 0:00)
  - 남은 시간이 2분 이하일 때 색상 변화 (기본 컬러 → 경고색 Rose/Red)
  - 만료 시 자동 End Conversation (로딩 상태로 전환)
- **로딩 상태**: End Conversation 클릭 → Gemini 처리 중 → 완료 (오버레이 또는 버튼 로딩 스피너)

### History View
- 목록: 카드형 리스트, 질문 텍스트 + 날짜 + 테마명
- 상세: 섹션 순서 - 화자A 요약 → 화자B 요약 → 전체 요약 → transcript
  - 화자 이름 설정 가능 (인라인 편집 or 설정 팝업)

### Chat View
- 좌측 사이드바 (대화 기록 필터) + 우측 채팅창
- 채팅 메시지: 사용자/AI 구분, 버블 스타일
- 입력창 하단 고정

---

## 컴포넌트 UX 고려사항

| 컴포넌트 | 고려사항 |
|----------|----------|
| `DeckCard` | hover 효과, 클릭 시 첫 번째 card로 이동 |
| `QuestionCard` | 텍스트 크기 크게, 카드 전환 시 애니메이션(slide or fade) |
| `ConversationTimer` | **신규** - 10분 카운트다운. 2분 이하 경고 색상. 만료 시 End Conversation 자동 트리거 |
| `CardNavigation` | 첫 카드에서 Previous 비활성화, 마지막 카드에서 Next → Finish Deck. End Conversation 버튼은 처리 중 로딩 스피너 표시 |
| `ConfirmModal` | 뒤로가기 클릭 시 노출, "나가기 / 취소" 선택 |
| `SpeakerSummary` | 화자 이름 인라인 편집 가능 |
| `ChatMessage` | 사용자 메시지 우측, AI 메시지 좌측 정렬 |

---

## 반응형 고려사항
- 기본 타겟: 태블릿 가로/세로, 데스크탑
- 모바일도 지원 (질문 텍스트 가독성 확보)
- 사이드바가 있는 Chat View는 좁은 화면에서 사이드바 토글로 전환

---

## 작업 진행 계획 (UI/Design Agent)

1. **디자인 토큰 정의**: `globals.css`에 따뜻한 감성의 컬러 팔레트와 CSS 변수 정의 (Peach/Rose 계열)
2. **Shadcn UI 초기화**: 기본 컴포넌트(Button, Card, Modal, Input 등) 설치 및 스타일링 가이드 적용
3. **공통 레이아웃 구축**: `Navbar`, `Main Container` 등 전역 레이아웃 요소 구현
4. **핵심 컴포넌트 구현**: `DeckCard`, `QuestionCard`, `CardNavigation` 등 화면별 핵심 UI 컴포넌트 개발
5. **반응형 및 테마 적용**: 모바일/태블릿 대응 및 감성적인 인터랙션 추가

---

## 작업 로그

### [2026-02-28] 초기 디자인 시스템 및 레이아웃 구축
- **작업 내용**:
    - **디자인 컨셉 확정**: Warm & Emotional 테마 적용. Cream 배경(#FFFBF0)과 Rose 포인트(#F43F5E) 사용.
    - **디자인 토큰 정의**: `globals.css`에 HSL 기반의 CSS Variable 정의 (shadcn 호환).
    - **기본 컴포넌트 구현**: `Button`, `Card` 컴포넌트 (shadcn 기반 스타일링) 구축.
    - **레이아웃 및 네비게이션**: `Navbar` 구현 및 `layout.tsx` 적용.
    - **핵심 UI 컴포넌트 개발**:
        - Home: `DeckCard`, `DeckGrid` 구현.
        - Card View: `QuestionCard`, `CardNavigation` 구현. (Conversation Log 제외)
    - **프로토타입 적용**: Home 및 Card View 페이지에 초기 레이아웃 및 디자인 적용 완료.
