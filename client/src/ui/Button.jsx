export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium rounded-md border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary: "bg-primary text-primary-fg border-primary hover:bg-primary-hover",
    secondary: "bg-surface-alt text-fg border-border hover:border-fg-secondary",
    accent: "bg-accent text-ink-black border-accent hover:opacity-90 font-semibold",
    danger: "bg-error-bg text-error border-error hover:bg-error hover:text-ink-black",
    ghost: "bg-transparent text-fg-secondary border-transparent hover:bg-surface-alt hover:text-fg",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs min-h-[34px]",
    md: "px-4 py-2.5 text-sm min-h-[42px]",
    lg: "px-5 py-3 text-base min-h-[46px]",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
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
      )}
      {children}
    </button>
  );
}
