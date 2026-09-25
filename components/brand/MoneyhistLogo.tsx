import Link from "next/link";

export function MoneyhistLogo({ href = "/login" }: { href?: string }) {
  return (
    <Link className="brand" href={href} aria-label="Moneyhist">
      <svg
        aria-hidden="true"
        className="brand-mark"
        fill="none"
        role="img"
        viewBox="0 0 48 48"
      >
        <rect className="brand-mark-bg" height="48" rx="15" width="48" />
        <path
          className="brand-mark-letter"
          d="M11 32V16l8.5 9L28 16v16"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.2"
        />
        <path
          className="brand-mark-rise"
          d="M29 30l8-8m-6 0h6v6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.6"
        />
      </svg>
      <span className="brand-name"><span>money</span>hist</span>
    </Link>
  );
}
