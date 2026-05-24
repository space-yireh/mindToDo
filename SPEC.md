# 🛠️ Antigravity 에이전트 구동을 위한 환경 셋업 가이드

이 프로젝트를 Antigravity 2.0 환경에서 개발할 때 에이전트에게 쥐여주어야 할 **도구(Tools & Extensions)** 설정입니다.

### 1. 필요한 MCP (Model Context Protocol) 설정

프로젝트를 진행하면서 에이전트가 외부 문서를 참고하거나 테스트할 수 있도록 `~/.gemini/antigravity/mcp_config.json`에 아래 MCP 서버들을 활성화해 주는 것이 좋습니다.

* **Browser / Firecrawl MCP:** 에이전트가 최신 `React Flow` 공식 문서나 `Google Tasks API` 레퍼런스를 실시간으로 검색하고 크롤링하여 정확한 코드를 짤 수 있도록 돕습니다.
* **Google Tasks / Firebase MCP (선택):** 개발 중 에이전트가 직접 API 연동 테스트를 백엔드 없이 시뮬레이션해 볼 때 유용합니다.

### 2. 에이전트에게 로드해 줄 전용 스킬 (Skills)

Antigravity 프로젝트 루트에 `.antigravity/skills/` 폴더를 만들고 아래 가이드를 포함하면 에이전트가 훨씬 똑똑하게 움직입니다.

* **Frontend Build & Test Skill:** 에이전트가 코드를 작성한 후 `npm run build`나 `vite` 개발 서버를 열어 문법 에러가 없는지 스스로 교차 검증하게 만드는 스킬 세트.
* **shadcn/ui CLI Skill:** 에이전트가 필요한 UI 컴포넌트(Button, Input, Dialog 등)를 `npx shadcn@latest add` 명령어를 통해 자동으로 로컬에 설치하고 커스터마이징하도록 허용하는 실행 권한 규칙.

### 3. 에이전트 시작 명령어 추천 (초기 프롬프트)

Antigravity 앱을 켜고 대화창에 아래와 같이 명령을 내리며 프로젝트를 시작하세요. 초기 디테일을 촘촘하게 잡기 위해 **`/grill-me`** 명령어를 사용하는 것을 강력히 추천합니다.

> **입력 예시:**
> `/grill-me 프로젝트 폴더에 있는 SPEC.md(이 문서) 파일을 읽고, React + Vite + TypeScript 환경에서 mindToDo 프로젝트의 기본 뼈대와 폴더 구조를 세워줘. shadcn/ui와 React Flow를 사용할 수 있도록 패키지 설치부터 진행해줘.`

