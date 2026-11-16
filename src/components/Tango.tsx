import { cn } from "../lib/cn";

type TangoProps = {
  className?: string;
  dance?: boolean;
  title?: string;
};

export function Tango({ className, dance = false, title }: TangoProps) {
  return (
    <svg
      viewBox="0 0 128 140"
      className={cn("tango overflow-visible", dance && "tango-dance", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <ellipse className="tango-shadow" cx="58" cy="132" rx="30" ry="4.5" fill="#171717" opacity="0.1" />
      <g className="tango-body">
        <path className="tango-leg-l" d="M46 116 V130" fill="none" stroke="#171717" strokeWidth="7" strokeLinecap="round" />
        <path className="tango-leg-r" d="M74 116 V130" fill="none" stroke="#171717" strokeWidth="7" strokeLinecap="round" />
        <rect x="26" y="48" width="68" height="70" rx="12" fill="#F4E4CC" stroke="#171717" strokeWidth="5" />
        <path d="M34 58 H86" fill="none" stroke="#171717" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
        <path d="M60 46 V76" stroke="#0047AB" strokeWidth="9" strokeLinecap="round" />
        <ellipse cx="46" cy="86" rx="6.2" ry="7.2" fill="#fff" />
        <ellipse cx="76" cy="86" rx="6.2" ry="7.2" fill="#fff" />
        <circle cx="47.4" cy="88" r="2.6" fill="#171717" />
        <circle cx="77.4" cy="88" r="2.6" fill="#171717" />
        <path d="M52 100 Q61 107 71 100" fill="none" stroke="#171717" strokeWidth="2.4" strokeLinecap="round" />
        <path
          className="tango-string"
          d="M94 78 C110 72 118 92 108 106"
          fill="none"
          stroke="#0047AB"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <g transform="translate(102 102) rotate(16)">
          <rect x="0" y="0" width="26" height="18" rx="3" fill="#fff" stroke="#0047AB" strokeWidth="2.2" />
          <circle cx="6" cy="9" r="1.8" fill="#0047AB" />
          <path d="M11 9 H19" stroke="#0047AB" strokeWidth="1.7" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
