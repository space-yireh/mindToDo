"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { useToast } from "@/components/ToastProvider";
import { LEGAL_LINKS } from "@/lib/legal";

function LegalLink({ href, label, comingSoonMessage }: { href: string; label: string; comingSoonMessage: string }) {
  const { showToast } = useToast();
  const isPlaceholder = href === "#";

  return (
    <a
      href={href}
      target={isPlaceholder ? undefined : "_blank"}
      rel={isPlaceholder ? undefined : "noopener noreferrer"}
      onClick={(e) => {
        if (isPlaceholder) {
          e.preventDefault();
          showToast(comingSoonMessage, "info");
        }
      }}
      className="text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline dark:text-slate-500 dark:hover:text-slate-300"
    >
      {label}
    </a>
  );
}

export function LegalFooter({ className }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <div className={`flex items-center justify-center gap-3 text-xs ${className ?? ""}`}>
      <LegalLink href={LEGAL_LINKS.terms} label={t.legalTerms} comingSoonMessage={t.legalComingSoon} />
      <span className="text-slate-300 dark:text-slate-700">·</span>
      <LegalLink href={LEGAL_LINKS.privacy} label={t.legalPrivacy} comingSoonMessage={t.legalComingSoon} />
    </div>
  );
}
