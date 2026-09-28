import { Link } from "react-router";
import ThemeToggleButton from "./ThemeToggleButton";

function Header() {
  return (
    <header className="sticky top-0 z-30 w-full bg-surface border-b border-border">
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <Link to="/home" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/heat_logo.png"
            alt="HEAT"
            className="h-7 w-auto object-contain border border-border rounded-sm bg-ink-black px-1 py-0.5"
          />
        </Link>

        <ThemeToggleButton />
      </div>
    </header>
  );
}

export default Header;
