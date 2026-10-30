interface ZeraphMarkProps {
  size?: number;
  className?: string;
}

export const ZeraphMark = ({ size = 18, className }: ZeraphMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth={8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M8 13h26l22 22" />
    <path d="M8 35h16l16 16" />
  </svg>
);
