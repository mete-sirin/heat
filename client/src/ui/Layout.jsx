import { Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Header from "./Header";
import BottomNav from "./BottomNav";

function Layout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-dvh w-full bg-app text-fg flex flex-col items-center justify-center p-4">
        <div className="bg-surface border border-border rounded-md px-6 py-5 flex items-center gap-3">
          <svg className="h-5 w-5 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-85"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
            />
          </svg>
          <span className="text-sm font-medium text-fg-secondary">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-dvh w-full bg-app text-fg flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 pb-24">
        <Suspense
          fallback={
            <div className="py-16 text-center text-xs font-medium text-muted-foreground">
              Loading...
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}

export default Layout;
