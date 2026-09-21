# MindToDo

마인드맵으로 할일을 설계하고 Google Tasks와 동기화하는 개인용 앱.

- 마인드맵 1개(루트 노드) = Google TaskList 1개
- depth 0 = TaskList, depth 1 = Task, depth 2 = Subtask (depth 3 이상 미지원)
- 백엔드/DB 없음 — 브라우저에서 Google Tasks API를 직접 호출하는 순수 클라이언트 앱
- 자동저장 없음. **가져오기**(Google Tasks → 마인드맵)와 **내보내기**(마인드맵 → Google Tasks, 전체삭제후재생성) 버튼으로만 동기화

## 시작하기

1. Google Cloud Console에서 OAuth 2.0 클라이언트 ID(웹 애플리케이션)를 만들고, 승인된 JavaScript 원본에 `http://localhost:3000`을 등록합니다.
2. `.env.local.example`을 `.env.local`로 복사하고 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`를 채웁니다.
3. 의존성 설치 후 개발 서버 실행:

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인합니다.

## 배포 (Vercel)

- Vercel 프로젝트에 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 환경변수를 등록합니다.
- 배포 도메인을 Google Cloud Console의 승인된 JavaScript 원본에 추가합니다.
- OAuth 동의 화면은 "외부" 유형으로 시작하며, 테스트 모드에서는 refresh token 없이도 access token 발급 자체는 동작하지만 테스트 사용자 등록이 필요합니다. 매주 재로그인이 번거롭다면 "프로덕션" 상태로 전환하세요(비검증 앱 경고 화면이 추가로 뜨는 대신 유지).
