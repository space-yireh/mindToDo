"use client";

import { useLanguage } from "@/components/LanguageProvider";

interface LoginScreenProps {
  isReady: boolean;
  hasClientId: boolean;
  expired: boolean;
  authError: string | null;
  onSignIn: () => void;
}

export function LoginScreen({ isReady, hasClientId, expired, authError, onSignIn }: LoginScreenProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center dark:bg-slate-950">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">MindToDo</h1>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{t.loginDescription}</p>
      {expired && (
        <p className="text-sm text-amber-600 dark:text-amber-400">{t.sessionExpired}</p>
      )}
      {!hasClientId && (
        <p className="max-w-sm text-sm text-red-600 dark:text-red-400">{t.missingClientId}</p>
      )}
      {authError && <p className="max-w-sm text-sm text-red-600 dark:text-red-400">{authError}</p>}
      <button
        type="button"
        onClick={onSignIn}
        disabled={!isReady}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isReady ? t.signIn : t.signInPreparing}
      </button>
    </div>
  );
}
