export type Language = "ko" | "en";

const ko = {
  appDescription: "마인드맵으로 할일을 설계하고 Google Tasks와 동기화하는 개인용 앱",

  // auth / login screen
  loginDescription: "마인드맵으로 할일을 설계하고 Google Tasks와 동기화하는 개인용 앱입니다.",
  sessionExpired: "세션이 만료되었습니다. 다시 로그인해주세요.",
  missingClientId: "NEXT_PUBLIC_GOOGLE_CLIENT_ID 환경변수가 설정되지 않았습니다.",
  signIn: "Google 계정으로 로그인",
  signInPreparing: "로그인 준비 중…",
  authNotReady: "아직 로그인 준비가 되지 않았습니다. 잠시 후 다시 시도해주세요.",
  scriptLoadFailed: "Google Identity Services 스크립트 로드 실패",
  loginFailed: "Google 로그인에 실패했습니다.",

  // sidebar
  sidebarTitle: "📋 목록",
  closeSidebar: "목록 닫기",
  newList: "새 목록",
  noLists: "목록이 없습니다.",
  untitled: "(제목 없음)",
  deleteListAria: "목록 삭제",
  delete: "삭제",

  // toolbar
  import: "가져오기",
  importing: "가져오는 중…",
  export: "내보내기",
  exporting: "내보내는 중…",
  showCompleted: "완료된 할일 보기",
  toggleSidebar: "목록 패널 토글",
  toggleProperties: "속성 패널 토글",
  themeLight: "라이트 모드",
  themeDark: "다크 모드",
  themeSystem: "시스템 설정",
  languageToggle: "언어 전환",

  // properties panel
  closePropertiesAria: "속성 패널 닫기",
  addChildItem: "+ 하위 항목 추가",
  propertiesTitle: "속성",
  selectNodeHint: "노드를 선택하세요.",
  listPropertiesTitle: "목록",
  fieldTitle: "제목",
  taskLabel: "할일",
  subtaskLabel: "세부 할일",
  fieldNotes: "설명",
  fieldDueDate: "마감일",
  fieldCompleted: "완료됨",

  // canvas / node box
  addChildNodeAria: "자식 노드 추가",
  deleteNodeAria: "노드 삭제",
  newTaskDefault: "새 할일",
  newSubtaskDefault: "새 세부 할일",

  // confirm modal defaults
  confirm: "확인",
  cancel: "취소",

  // page-level empty state + confirms + toasts
  emptyStateHint: "왼쪽에서 목록을 선택하거나 새로 만들어주세요.",
  deleteListTitle: "목록 삭제",
  deleteListMessage: (name: string) => `"${name}" 목록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
  importTitle: "가져오기",
  importMessage:
    "Google Tasks의 최신 데이터를 불러옵니다.\n현재 마인드맵에 저장하지 않은 변경사항은 사라집니다.",
  exportTitle: "내보내기",
  exportMessage:
    "Google Tasks의 기존 할일을 모두 삭제하고\n현재 마인드맵 상태로 다시 생성합니다.\n완료 시각 등 기존 메타데이터는 초기화됩니다.",
  toastSessionExpired: "세션이 만료되었습니다. 다시 로그인해주세요.",
  toastListsLoadFailed: "목록을 불러오지 못했습니다",
  toastImportSuccess: "가져오기 완료",
  toastImportFailed: "가져오기 실패",
  toastListCreated: "새 목록을 만들었습니다",
  toastListCreateFailed: "목록 생성 실패",
  toastListDeleted: "목록을 삭제했습니다",
  toastListDeleteFailed: "목록 삭제 실패",
  toastExportSuccess: "내보내기 완료",
  toastExportFailed: "내보내기 실패",
};

const en: typeof ko = {
  appDescription: "A personal app for planning tasks as a mind map and syncing with Google Tasks",

  loginDescription:
    "A personal app for planning tasks as a mind map and syncing with Google Tasks.",
  sessionExpired: "Your session has expired. Please sign in again.",
  missingClientId: "The NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is not set.",
  signIn: "Sign in with Google",
  signInPreparing: "Preparing sign-in…",
  authNotReady: "Sign-in isn't ready yet. Please try again in a moment.",
  scriptLoadFailed: "Failed to load the Google Identity Services script",
  loginFailed: "Google sign-in failed.",

  sidebarTitle: "📋 Lists",
  closeSidebar: "Close list panel",
  newList: "New List",
  noLists: "No lists yet.",
  untitled: "(Untitled)",
  deleteListAria: "Delete list",
  delete: "Delete",

  import: "Import",
  importing: "Importing…",
  export: "Export",
  exporting: "Exporting…",
  showCompleted: "Show completed",
  toggleSidebar: "Toggle list panel",
  toggleProperties: "Toggle properties panel",
  themeLight: "Light mode",
  themeDark: "Dark mode",
  themeSystem: "System setting",
  languageToggle: "Switch language",

  closePropertiesAria: "Close properties panel",
  addChildItem: "+ Add sub-item",
  propertiesTitle: "Properties",
  selectNodeHint: "Select a node.",
  listPropertiesTitle: "List",
  fieldTitle: "Title",
  taskLabel: "Task",
  subtaskLabel: "Subtask",
  fieldNotes: "Notes",
  fieldDueDate: "Due date",
  fieldCompleted: "Completed",

  addChildNodeAria: "Add child node",
  deleteNodeAria: "Delete node",
  newTaskDefault: "New Task",
  newSubtaskDefault: "New Subtask",

  confirm: "Confirm",
  cancel: "Cancel",

  emptyStateHint: "Select a list on the left, or create a new one.",
  deleteListTitle: "Delete list",
  deleteListMessage: (name: string) => `Delete the list "${name}"?\nThis action cannot be undone.`,
  importTitle: "Import",
  importMessage:
    "This fetches the latest data from Google Tasks.\nAny unsaved changes in the current mind map will be lost.",
  exportTitle: "Export",
  exportMessage:
    "This deletes all existing tasks in Google Tasks\nand recreates them from the current mind map.\nCompletion timestamps and other existing metadata will be reset.",
  toastSessionExpired: "Your session has expired. Please sign in again.",
  toastListsLoadFailed: "Failed to load lists",
  toastImportSuccess: "Import complete",
  toastImportFailed: "Import failed",
  toastListCreated: "Created a new list",
  toastListCreateFailed: "Failed to create list",
  toastListDeleted: "List deleted",
  toastListDeleteFailed: "Failed to delete list",
  toastExportSuccess: "Export complete",
  toastExportFailed: "Export failed",
};

export const translations: Record<Language, typeof ko> = { ko, en };
export type Dictionary = typeof ko;
