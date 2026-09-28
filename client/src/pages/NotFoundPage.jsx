import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import AuthShell from "../ui/AuthShell";
import Button from "../ui/Button";

function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const primaryDestination = user ? "/home" : "/";
  const primaryLabel = user ? "Back to Dashboard" : "Back to Home";

  return (
    <AuthShell
      title="Page not found"
      subtitle="The page you're looking for doesn't exist or may have been moved."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between border border-border bg-secondary/40 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-card text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Error Code
              </p>
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                404 — Route Not Found
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Link to={primaryDestination} className="flex-1">
            <Button type="button" className="w-full">
              {primaryLabel}
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1 gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Go Back
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}

export default NotFoundPage;
