import Link from "next/link";

export function LegalPageLayout({
  title,
  dateLabel,
  children,
}: {
  title: string;
  dateLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-y-auto bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← MindToDo로 돌아가기
        </Link>
        <h1 className="mb-2 text-2xl font-bold">{title}</h1>
        <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">{dateLabel}</p>
        <div className="flex flex-col gap-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">{heading}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
