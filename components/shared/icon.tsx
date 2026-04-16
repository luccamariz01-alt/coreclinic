import { cn } from "@/lib/utils";

type IconName =
  | "dashboard"
  | "agenda"
  | "patients"
  | "procedures"
  | "search"
  | "bell"
  | "spark"
  | "trendUp"
  | "trendDown"
  | "clock"
  | "currency"
  | "room"
  | "arrowRight"
  | "check";

type IconProps = {
  name: IconName;
  className?: string;
};

export function Icon({ name, className }: IconProps) {
  const baseClassName = cn("size-5", className);

  switch (name) {
    case "dashboard":
      return (
        <svg className={baseClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M4 5.5h7v5H4zM13 5.5h7v9h-7zM4 12.5h7v6H4zM13 16.5h7v2h-7z" />
        </svg>
      );
    case "agenda":
      return (
        <svg className={baseClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M7 3.5v3M17 3.5v3M4 8.5h16M5.5 5.5h13a1.5 1.5 0 0 1 1.5 1.5v11a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V7A1.5 1.5 0 0 1 5.5 5.5Z" />
        </svg>
      );
    case "patients":
      return (
        <svg className={baseClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M9 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16.5 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM4.5 18.5c.7-2.4 2.8-4 5.5-4s4.8 1.6 5.5 4M14 18.5c.4-1.5 1.6-2.8 3.5-3" />
        </svg>
      );
    case "procedures":
      return (
        <svg className={baseClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M7 4.5h10M8 4.5v4l-4.5 7.2A3 3 0 0 0 6.1 20h11.8a3 3 0 0 0 2.6-4.3L16 8.5v-4" />
          <path d="M9.5 13.5h5" />
        </svg>
      );
    case "search":
      return (
        <svg className={baseClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      );
    case "bell":
      return (
        <svg className={baseClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M6.5 9.5a5.5 5.5 0 1 1 11 0v4.2l1.5 2.3H5l1.5-2.3z" />
          <path d="M10 18a2 2 0 0 0 4 0" />
        </svg>
      );
    case "spark":
      return (
        <svg className={baseClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="m12 3 1.7 4.6L18.5 9l-4.8 1.4L12 15l-1.7-4.6L5.5 9l4.8-1.4zM18.5 16l.9 2.3 2.1.7-2.1.7-.9 2.3-.9-2.3-2.1-.7 2.1-.7zM5.5 15.5l.8 2 1.8.6-1.8.6-.8 2-.8-2-1.8-.6 1.8-.6z" />
        </svg>
      );
    case "trendUp":
      return (
        <svg className={baseClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M5 15.5 10 10l3 3 6-6" />
          <path d="M14.5 7H19v4.5" />
        </svg>
      );
    case "trendDown":
      return (
        <svg className={baseClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="m5 8.5 5 5 3-3 6 6" />
          <path d="M14.5 17H19v-4.5" />
        </svg>
      );
    case "clock":
      return (
        <svg className={baseClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7.5v5l3 1.5" />
        </svg>
      );
    case "currency":
      return (
        <svg className={baseClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M14.5 6.5c-.5-1.1-1.7-1.8-3.4-1.8-2.2 0-3.6 1-3.6 2.5 0 1.2.8 2 2.7 2.5l2.2.5c2 .5 2.9 1.2 2.9 2.6 0 1.7-1.6 2.8-4 2.8-2 0-3.4-.8-4-2.3" />
          <path d="M12 3v18" />
        </svg>
      );
    case "room":
      return (
        <svg className={baseClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M12 20s6-5.1 6-10a6 6 0 1 0-12 0c0 4.9 6 10 6 10Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "arrowRight":
      return (
        <svg className={baseClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "check":
      return (
        <svg className={baseClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m5 12 4.2 4.2L19 6.5" />
        </svg>
      );
    default:
      return null;
  }
}
