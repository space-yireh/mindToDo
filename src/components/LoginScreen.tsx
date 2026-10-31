"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { LegalFooter } from "@/components/LegalFooter";

interface LoginScreenProps {
  expired: boolean;
  authError: string | null;
  onSignIn: () => void;
}

export function LoginScreen({ expired, authError, onSignIn }: LoginScreenProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center dark:bg-slate-950">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- see Sidebar.tsx's same note: tiny static SVG mark, not worth an image-config change */}
        <img src="/logo.svg" alt="" className="h-8 w-8" />
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">MindToDo</h1>
      </div>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{t.loginDescription}</p>
      {expired && (
        <p className="text-sm text-amber-600 dark:text-amber-400">{t.sessionExpired}</p>
      )}
      {authError && <p className="max-w-sm text-sm text-red-600 dark:text-red-400">{authError}</p>}
      {/* Signing in is just a top-level navigation to /api/auth/login — no
          async "preparing" step, so the button is always clickable. The
          "do we already have a session?" check happens before this screen
          ever renders (see page.tsx's `!auth.isReady` gate). */}
      <button
        type="button"
        onClick={onSignIn}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        {t.signIn}
      </button>
      <LegalFooter className="mt-6" />
    </div>
  );
}
