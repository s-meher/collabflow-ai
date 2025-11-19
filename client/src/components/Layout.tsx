import type { ReactNode } from "react";

type LayoutProps = {
  title: string;
  children: ReactNode;
};

export function Layout({ title, children }: LayoutProps) {
  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900 flex">
      <aside className="hidden md:flex md:w-64 flex-col bg-slate-900 text-slate-100 p-6 gap-6">
        <div className="text-2xl font-bold tracking-tight">CollabFlow AI</div>
        <nav className="flex flex-col gap-3 text-sm">
          <a className="text-slate-300 hover:text-white transition" href="#">
            Dashboard
          </a>
          <a className="text-slate-300 hover:text-white transition" href="#">
            Documents
          </a>
          <a className="text-slate-300 hover:text-white transition" href="#">
            Team
          </a>
          <a className="text-slate-300 hover:text-white transition" href="#">
            Settings
          </a>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="w-full bg-white border-b border-slate-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
