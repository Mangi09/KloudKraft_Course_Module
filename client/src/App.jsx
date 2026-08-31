import { Moon, Sun } from "lucide-react";
import { useTheme } from "./contexts/ThemeContext.jsx";

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-app-bg text-app-text">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
        <header className="flex items-center justify-between border-b border-app-border pb-5">
          <div>
            <p className="text-sm font-medium text-app-primary">LabsKraft</p>
            <h1 className="text-2xl font-semibold">Course Module</h1>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-app-border bg-app-panel text-app-text shadow-sm transition hover:border-app-primary"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <section className="rounded-lg border border-app-border bg-app-panel p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Frontend initialized</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-app-muted">
            Vite, React Router, Tailwind, dark mode, Poppins, Lucide icons, and
            the course module color tokens are ready.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-app-border p-4">
              <p className="text-xs text-app-muted">Primary</p>
              <p className="mt-1 font-semibold text-app-primary">#2563eb</p>
            </div>

            <div className="rounded-md border border-app-border p-4">
              <p className="text-xs text-app-muted">Success</p>
              <p className="mt-1 font-semibold text-status-success">Published</p>
            </div>

            <div className="rounded-md border border-app-border p-4">
              <p className="text-xs text-app-muted">Warning</p>
              <p className="mt-1 font-semibold text-status-warning">Draft</p>
            </div>

            <div className="rounded-md border border-app-border p-4">
              <p className="text-xs text-app-muted">Danger</p>
              <p className="mt-1 font-semibold text-status-danger">Error</p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;