import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext.jsx";

export default function Header({ title, actions }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between rounded-full border border-app-border bg-app-panel px-6 py-3 shadow-sm">
      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="flex items-center gap-3">
        {actions}
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-app-border text-app-text transition hover:border-app-primary"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}