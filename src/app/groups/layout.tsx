import { AppHeader } from "@/components/shell/app-header";

export default function GroupsLayout({ children }: LayoutProps<"/groups">) {
  return (
    <>
      <AppHeader />
      <main id="main" className="page-wash min-h-[calc(100dvh-3.5rem)]">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </main>
    </>
  );
}
