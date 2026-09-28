import { useId } from "react";

export const inputBaseClasses =
  "w-full rounded-md bg-surface-alt border border-border px-3 py-2.5 text-sm text-fg placeholder:text-fg-muted focus:border-primary focus:outline-none transition-colors";

export default function FormField({ label, hint, error, children, htmlFor }) {
  const generatedId = useId();
  const fieldId = htmlFor || generatedId;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className="text-xs font-medium text-fg-secondary">
          {label}
        </label>
      )}
      {hint && (
        <span id={hintId} className="text-xs text-fg-muted leading-snug">
          {hint}
        </span>
      )}
      {children}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-error mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
