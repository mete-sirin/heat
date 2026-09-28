import { Link } from "react-router";
import Footer from "./Footer";
import ThemeToggleButton from "./ThemeToggleButton";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-dvh w-full bg-app text-fg flex flex-col justify-between">
      {/* Top Bar */}
      <header className="w-full max-w-md mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/heat_logo.png"
            alt="HEAT"
            className="h-9 w-auto object-contain border border-border rounded-sm bg-ink-black px-1.5 py-0.5"
          />
        </Link>
        <ThemeToggleButton />
      </header>

      {/* Main Centered Card */}
      <main className="w-full max-w-md mx-auto px-4 py-6 my-auto">
        <div className="bg-surface border border-border rounded-lg p-5 sm:p-6">
          {(title || subtitle) && (
            <div className="mb-5 border-b border-border pb-4">
              {title && (
                <h1 className="font-display text-2xl font-bold tracking-tight text-fg">{title}</h1>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-fg-secondary leading-relaxed">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
