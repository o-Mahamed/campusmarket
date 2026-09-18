function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case "textbooks":
      return (
        <svg viewBox="0 0 48 48" fill="none" className="h-14 w-14">
          <path
            d="M10 8h18a4 4 0 0 1 4 4v26a3 3 0 0 0-3-3H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M16 17h12M16 23h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "furniture":
      return (
        <svg viewBox="0 0 48 48" fill="none" className="h-14 w-14">
          <path
            d="M8 24h32v6a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M10 24v-6a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v6" stroke="currentColor" strokeWidth="2" />
          <path d="M11 32v4M37 32v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "electronics":
      return (
        <svg viewBox="0 0 48 48" fill="none" className="h-14 w-14">
          <rect x="9" y="12" width="30" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M17 38h14M24 32v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 18h18v8H15z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "clothing":
      return (
        <svg viewBox="0 0 48 48" fill="none" className="h-14 w-14">
          <path
            d="M18 9 24 14 30 9l6 6-4 4.5V39a1 1 0 0 1-1 1H17a1 1 0 0 1-1-1V19.5L12 15Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" fill="none" className="h-14 w-14">
          <path d="M8 16 24 8l16 8-16 8-16-8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path
            d="M8 16v16l16 8 16-8V16M24 24v16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

interface CategoryPlaceholderProps {
  category: string;
  className?: string;
}

export function CategoryPlaceholder({ category, className }: CategoryPlaceholderProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-mist/40 text-pine/70 ${className ?? ""}`}
    >
      <CategoryIcon category={category} />
    </div>
  );
}