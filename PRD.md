# 📝 mindToDo: 개발 사양서 (Specification Document)

## 1. 프로젝트 개요 (Overview)

* **프로젝트명:** mindToDo (마인드투두)
* **한 줄 정의:** 생각을 시각적으로 확장하는 마인드맵 UI와 실행력을 극대화하는 Google Tasks를 유기적으로 결합한 1인 생산성 웹 애플리케이션.
* **타겟 아키텍처:** 백엔드 없이 프론트엔드 단독으로 구동되는 **Serverless Single Page Application (SPA)**.
* **인프라 및 인증:** Firebase Auth (구글 로그인) 및 Firebase Hosting 사용.

## 2. 핵심 기술 스택 (Tech Stack)

* **Framework:** React (Vite 기반, TypeScript 권장)
* **UI Component & Styling:** shadcn/ui + Tailwind CSS (깔끔하고 모던한 미니멀 디자인)
* **Mindmap Engine:** React Flow (키보드 단축키 지원, 노드 드래그 앤 드롭, 커스텀 노드 렌더링 최적화)
* **Database & Storage:** 브라우저 LocalStorage (실시간 임시 저장용)
* **External API:** Google Identity Services (GIS) 및 Google Tasks API

## 3. 기능 요구사항 (Functional Requirements)

### 3.1. 마인드맵 UI 및 인터랙션 (Mindmap Core)

* **초기 화면:** 중앙에 '루트 노드(새 프로젝트)'가 생성된 상태로 시작.
* **키보드 조작:** * `Tab`: 현재 선택된 노드의 '자식(Child) 노드' 추가 및 포커스 이동.
* `Enter`: 현재 선택된 노드와 대등한 위치의 '형제(Sibling) 노드' 추가 및 포커스 이동.
* `Delete` / `Backspace`: 선택된 노드 및 하위 노드 삭제.


* **마우스 조작:** 노드를 드래그하여 위치 이동 가능 (React Flow 기본 기능 활용).
* **디자인 톤앤매너:** shadcn/ui 특유의 무채색 톤, 깔끔한 보더라인, 직관적인 핀치 줌 및 팬(Pan) 기능 제공.

### 3.2. 데이터 저장 및 동기화 (Data Management)

* **임시 저장:** 사용자가 노드를 추가, 수정, 이동할 때마다 브라우저의 `LocalStorage`에 마인드맵 트리 전체가 실시간(또는 Debounce 적용) 저장됨. 새로고침해도 작업 상태 보존.
* **구글 연동:** 사용자가 "Google Tasks로 내보내기" 버튼을 누르면 싱크 로직 발동.

### 3.3. Google Tasks 매핑 가이드라인 (Mapping Rules)

Google Tasks API의 2단계 계층 제한을 우회하기 위해 아래의 **[방법 B]** 규칙을 엄격히 준수한다.

1. **루트 노드 (Root):** Google Tasks의 '할 일 목록(Task List)'을 생성하거나 매핑함. (목록 이름 = 루트 노드 텍스트)
2. **Level 1 자식 노드:** 해당 목록 내의 '부모 할 일(Task)'로 등록.
3. **Level 2 자식 노드:** 해당 부모 할 일 밑의 '서브 태스크(Subtask)'로 등록.
4. **Level 3 이하 모든 하위 노드:** Level 2 서브 태스크의 **'상세 설명(Description)'** 란에 텍스트 트리 구조로 주입함.
* *예시 형태:*
```text
[하위 세부 계획]
- 3뎁스 작업 아이템 A
  - 4뎁스 세부 내용 A-1
- 3뎁스 작업 아이템 B

```





### 3.4. 인증 및 배포 (Auth & Deployment)

* **인증:** Firebase Authentication을 통한 Google OAuth2 로그인 환경 구축.
* 구글 API 호출을 위해 로그인 성공 후 발급받는 Access Token을 안전하게 관리하고, Tasks API 호출 권한(Scope: `https://www.googleapis.com/auth/tasks`)을 요청함.

---

