import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";

type TangoProps = {
  className?: string;
  /** Random dances every 8–20s, plus hover and click. Off for tiny chrome. */
  ambient?: boolean;
  /** Looping celebration, used when the waitlist succeeds. */
  celebrate?: boolean;
  title?: string;
};

const DANCE_MS = 1700;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function Tango({ className, ambient = true, celebrate = false, title }: TangoProps) {
  const reduced = usePrefersReducedMotion();
  const [dancing, setDancing] = useState(false);
  const stopTimer = useRef<number>(0);
  const waitTimer = useRef<number>(0);

  function play() {
    if (reduced || celebrate) return;
    window.clearTimeout(stopTimer.current);
    setDancing(false);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setDancing(true);
        stopTimer.current = window.setTimeout(() => setDancing(false), DANCE_MS);
      });
    });
  }

  useEffect(() => {
    if (reduced || !ambient || celebrate) return;
    let cancelled = false;

    const schedule = () => {
      const wait = 8000 + Math.random() * 12000;
      waitTimer.current = window.setTimeout(() => {
        if (cancelled) return;
        setDancing(true);
        stopTimer.current = window.setTimeout(() => {
          if (cancelled) return;
          setDancing(false);
          schedule();
        }, DANCE_MS);
      }, wait);
    };

    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(waitTimer.current);
      window.clearTimeout(stopTimer.current);
    };
  }, [ambient, celebrate, reduced]);

  const moving = !reduced && (celebrate || dancing);

  return (
    <svg
      viewBox="0 0 160 180"
      className={cn(
        "tango overflow-visible",
        celebrate && !reduced && "tango-celebrate",
        dancing && !celebrate && !reduced && "tango-dancing",
        className,
      )}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      onMouseEnter={play}
      onClick={play}
    >
      <rect width="160" height="180" fill="transparent" />
      <ellipse className="tango-shadow" cx="80" cy="170" rx="36" ry="5" fill="#171717" opacity="0.12" />
      <g className={cn("tango-body", moving && "is-moving")}>
        <g className="tango-string">
          <path
            d="M62 62 C48 44 40 22 62 12 C86 1 112 16 108 40 C105 56 86 64 70 62"
            fill="none"
            stroke="#0047AB"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </g>
        <g className="tango-legs">
          <path className="tango-leg-l" d="M68 146 C64 158 54 166 46 168" fill="none" stroke="#171717" strokeWidth="5" strokeLinecap="round" />
          <path className="tango-leg-r" d="M96 146 C102 158 114 164 122 162" fill="none" stroke="#171717" strokeWidth="5" strokeLinecap="round" />
        </g>
        <path
          d="M70 50 L112 50 C124 50 132 58 132 70 L132 128 C132 142 120 152 106 152 L58 152 C44 152 34 142 34 128 L34 74 L70 50 Z"
          fill="#fff"
          stroke="#171717"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <circle cx="58" cy="68" r="6.5" fill="#fff" stroke="#0047AB" strokeWidth="2.6" />
        <circle cx="58" cy="68" r="2.2" fill="#0047AB" />
        <path className="tango-arm-l" d="M40 102 C24 96 16 112 26 124" fill="none" stroke="#171717" strokeWidth="4.2" strokeLinecap="round" />
        <path className="tango-arm-r" d="M124 100 C140 86 150 104 138 118" fill="none" stroke="#171717" strokeWidth="4.2" strokeLinecap="round" />
        <path d="M62 84 Q72 78 80 86" fill="none" stroke="#171717" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M90 86 Q102 80 110 88" fill="none" stroke="#171717" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="70" cy="100" r="7.2" fill="#171717" />
        <circle cx="100" cy="100" r="7.2" fill="#171717" />
        <circle cx="72.6" cy="97.2" r="2.3" fill="#fff" />
        <circle cx="102.6" cy="97.2" r="2.3" fill="#fff" />
        <circle cx="68" cy="103" r="1.3" fill="#0047AB" />
        <circle cx="98" cy="103" r="1.3" fill="#0047AB" />
        <path className="tango-smile" d="M74 114 Q86 126 102 114" fill="none" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="56" cy="112" r="3.2" fill="#0047AB" opacity="0.28" />
        <circle cx="114" cy="112" r="3.2" fill="#0047AB" opacity="0.28" />
      </g>
    </svg>
  );
}
