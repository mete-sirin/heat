import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Button from "../ui/Button";
import Footer from "../ui/Footer";
import ThemeToggleButton from "../ui/ThemeToggleButton";

function getTimeGreeting(date) {
  const hour = date.getHours();
  if (hour < 5) return "Late night ledger";
  if (hour < 12) return "Morning ledger";
  if (hour < 18) return "Afternoon ledger";
  return "Evening ledger";
}

function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="min-h-dvh w-full bg-app text-fg flex flex-col justify-between">
      {/* Header */}
      <header className="w-full max-w-2xl mx-auto px-4 pt-6 pb-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2.5">
          <img
            src="/heat_logo.png"
            alt="HEAT"
            className="h-9 w-auto object-contain border border-border rounded-sm bg-ink-black px-1.5 py-0.5"
          />
        </div>
        <ThemeToggleButton />
      </header>

      {/* Main Content */}
      <main className="w-full max-w-2xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center gap-6">
        {/* Hero Card */}
        <section className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-border pb-3 text-xs text-fg-muted font-medium">
            <span>{getTimeGreeting(time)}</span>
            <span className="font-display text-sm text-fg-secondary tabular-nums">
              {formattedTime}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-fg leading-tight">
              Control your cash and recurring subscriptions without noise.
            </h1>
            <p className="text-sm sm:text-base text-fg-secondary leading-relaxed">
              HEAT tracks every spending entry and active subscription cycle against your monthly budget in Turkish Lira (₺). Built for phones, zero fluff.
            </p>
          </div>

          {isAuthenticated ? (
            <div className="pt-2">
              <Link to="/home" className="block w-full">
                <Button size="lg" className="w-full">
                  Continue as {user?.fullName || user?.email}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/login" className="w-full">
                <Button size="lg" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to="/signup" className="w-full">
                <Button size="lg" variant="secondary" className="w-full">
                  Create account
                </Button>
              </Link>
            </div>
          )}

          {/* Feature Highlights */}
          <div className="pt-4 border-t border-border divide-y divide-border text-xs">
            <div className="py-3 flex items-start justify-between gap-4">
              <span className="font-display font-semibold text-fg shrink-0">
                01 · Monthly budget
              </span>
              <span className="text-fg-secondary text-right">
                Every spending entry immediately updates your running balance in ₺.
              </span>
            </div>
            <div className="py-3 flex items-start justify-between gap-4">
              <span className="font-display font-semibold text-fg shrink-0">
                02 · Spendings ledger
              </span>
              <span className="text-fg-secondary text-right">
                Filter transactions by category, payment method, amount range, or date.
              </span>
            </div>
            <div className="pt-3 flex items-start justify-between gap-4">
              <span className="font-display font-semibold text-fg shrink-0">
                03 · Subscriptions
              </span>
              <span className="text-fg-secondary text-right">
                Track cycle lengths in days and see upcoming billing dates.
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
