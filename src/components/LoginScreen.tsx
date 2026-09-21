"use client";

interface LoginScreenProps {
  isReady: boolean;
  hasClientId: boolean;
  expired: boolean;
  authError: string | null;
  onSignIn: () => void;
}

export function LoginScreen({ isReady, hasClientId, expired, authError, onSignIn }: LoginScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">MindToDo</h1>
      <p className="max-w-sm text-sm text-slate-500">
        마인드맵으로 할일을 설계하고 Google Tasks와 동기화하는 개인용 앱입니다.
      </p>
      {expired && (
        <p className="text-sm text-amber-600">세션이 만료되었습니다. 다시 로그인해주세요.</p>
      )}
      {!hasClientId && (
        <p className="max-w-sm text-sm text-red-600">
          NEXT_PUBLIC_GOOGLE_CLIENT_ID 환경변수가 설정되지 않았습니다.
        </p>
      )}
      {authError && <p className="max-w-sm text-sm text-red-600">{authError}</p>}
      <button
        type="button"
        onClick={onSignIn}
        disabled={!isReady}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isReady ? "Google 계정으로 로그인" : "로그인 준비 중…"}
      </button>
    </div>
  );
}
