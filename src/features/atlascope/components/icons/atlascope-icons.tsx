import type { ComponentProps } from "react";

import { cx } from "@/features/atlascope/config/theme";

type AtlascopeIconProps = ComponentProps<"svg">;

export function SearchIcon({ className, ...props }: AtlascopeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx("size-4 fill-none stroke-current", className)}
      {...props}
    >
      <circle cx="10.5" cy="10.5" r="5.75" strokeWidth="2" />
      <path
        d="m15.25 15.25 4 4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UserIcon({ className, ...props }: AtlascopeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx("size-5 fill-none stroke-current", className)}
      {...props}
    >
      <path d="M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" strokeWidth="1.9" />
      <path
        d="M5.5 19.25a6.5 6.5 0 0 1 13 0"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LayersIcon({ className, ...props }: AtlascopeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx("size-5 fill-none stroke-current", className)}
      {...props}
    >
      <path
        d="m12 5 7 3.5-7 3.5-7-3.5L12 5Zm7 7-7 3.5L5 12m14 4-7 3.5L5 16"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GeofenceIcon({ className, ...props }: AtlascopeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx("size-5 fill-none stroke-current", className)}
      {...props}
    >
      <path
        d="M12 20.25c-.53 0-1-.24-1.31-.68l-3.74-5.4A7.4 7.4 0 0 1 5.7 10.05C5.7 6.14 8.52 3.3 12 3.3s6.3 2.84 6.3 6.75c0 1.53-.45 2.95-1.25 4.12l-3.74 5.4c-.31.44-.78.68-1.31.68Z"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.2" r="2.7" strokeWidth="1.8" />
    </svg>
  );
}

export function ToolIcon({ className, ...props }: AtlascopeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx("size-4 fill-none stroke-current", className)}
      {...props}
    >
      <path
        d="M14.5 6.5a4 4 0 0 0-5.4 4.9L4 16.5V20h3.6l5.1-5.1a4 4 0 0 0 4.9-5.4l-2.7 2.7-2.1-.4-.4-2.1 2.7-2.7Z"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon({ className, ...props }: AtlascopeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx("size-4 fill-current", className)}
      {...props}
    >
      <path d="M14.5 3.5a8.5 8.5 0 1 0 6 14.5A9 9 0 0 1 14.5 3.5Z" />
    </svg>
  );
}

export function SunIcon({ className, ...props }: AtlascopeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx("size-4 fill-none stroke-current", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
      <path
        d="M12 2.75v2.5m0 13.5v2.5m9.25-9.25h-2.5M5.25 12h-2.5m15.29-6.29-1.77 1.77M7.48 16.52l-1.77 1.77m12.06 0-1.77-1.77M7.48 7.48 5.71 5.71"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
