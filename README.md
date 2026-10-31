# MindToDo

마인드맵으로 할일을 설계하고 Google Tasks와 동기화하는 개인용 앱.

- 마인드맵 1개(루트 노드) = Google TaskList 1개
- depth 0 = TaskList, depth 1 = Task, depth 2 = Subtask (depth 3 이상 미지원)
- DB 없음. 할 일 데이터는 브라우저가 Google Tasks API를 직접 호출해 다룹니다. 로그인 유지를
  위한 서버(Route Handler)만 있고, 암호화된 refresh token을 쿠키로만 보관합니다 — 서버에
  저장하는 건 없습니다 (`WORKLOG.md` #23 참고).
- 자동저장 없음. **가져오기**(Google Tasks → 마인드맵)와 **내보내기**(마인드맵 → Google Tasks, 전체삭제후재생성) 버튼으로만 동기화

## 시작하기

1. Google Cloud Console에서 OAuth 2.0 클라이언트 ID(웹 애플리케이션)를 만들거나 기존 클라이언트를 사용합니다.
   **승인된 리디렉션 URI**에 `http://localhost:3000/api/auth/callback`을 등록합니다
   (JavaScript 원본이 아니라 리디렉션 URI입니다 — 서버 사이드 플로우로 바뀌면서 달라졌습니다).
2. 같은 화면에서 **client secret**을 확인해 둡니다.
3. `.env.example`을 `.env.local`로 복사하고 채웁니다:
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   - `AUTH_COOKIE_SECRET` — `openssl rand -base64 32`로 생성
   - `APP_URL=http://localhost:3000`
4. 의존성 설치 후 개발 서버 실행:

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인합니다.

## 배포 (Vercel)

- Vercel 프로젝트에 위 4개 환경변수(`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `AUTH_COOKIE_SECRET`, `APP_URL`)를 등록합니다. `APP_URL`은 실제 배포 도메인으로
  설정합니다 (예: `https://mindtodo.app`) — redirect_uri를 이 값으로 만들기 때문에,
  요청 Host가 www/apex 중 무엇이든 일관됩니다.
- 배포 도메인의 `/api/auth/callback`을 Google Cloud Console의 **승인된 리디렉션 URI**에
  추가합니다 (예: `https://mindtodo.app/api/auth/callback`,
  `https://www.mindtodo.app/api/auth/callback`).
- 동의 화면의 **scope 목록은 건드리지 않습니다** — `https://www.googleapis.com/auth/tasks`
  하나만 요청해야 기존 Google OAuth 검증이 유효합니다.
- OAuth 동의 화면은 "외부" 유형, "프로덕션" 상태를 유지하세요. "테스트" 상태로 되돌아가면
  refresh token이 7일마다 만료되어, 로그인 유지 기능 자체가 무력화됩니다
  (비검증 앱 경고 화면이 추가로 뜨는 대신 유지 — 의도된 트레이드오프입니다).
