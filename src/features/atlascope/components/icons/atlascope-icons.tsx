import type { ComponentProps } from "react";

import { cx } from "@/features/atlascope/config/theme";

type AtlascopeIconProps = ComponentProps<"svg">;

const ATLAS_ICON_SIZE_CLASS = "size-5";
const ATLAS_ICON_STROKE_WIDTH = 1.8;
const ATLAS_ICON_BASE_CLASS = `${ATLAS_ICON_SIZE_CLASS} fill-none stroke-current`;

export function SearchIcon({ className, ...props }: AtlascopeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx(ATLAS_ICON_BASE_CLASS, "scale-[1.08]", className)}
      {...props}
    >
      <circle cx="10.5" cy="10.5" r="5.75" strokeWidth={ATLAS_ICON_STROKE_WIDTH} />
      <path
        d="m15.25 15.25 4 4"
        strokeWidth={ATLAS_ICON_STROKE_WIDTH}
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
      className={cx(ATLAS_ICON_BASE_CLASS, "scale-[1.1]", className)}
      {...props}
    >
      <path
        d="M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
        strokeWidth={ATLAS_ICON_STROKE_WIDTH}
      />
      <path
        d="M5.5 19.25a6.5 6.5 0 0 1 13 0"
        strokeWidth={ATLAS_ICON_STROKE_WIDTH}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BellIcon({ className, ...props }: AtlascopeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx(ATLAS_ICON_BASE_CLASS, "scale-[1.08]", className)}
      {...props}
    >
      <path
        d="M8.25 10.25a3.75 3.75 0 1 1 7.5 0v2.2c0 .88.24 1.75.69 2.5l.81 1.35H6.75l.81-1.35c.45-.75.69-1.62.69-2.5v-2.2Z"
        strokeWidth={ATLAS_ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.1 18.25a2 2 0 0 0 3.8 0"
        strokeWidth={ATLAS_ICON_STROKE_WIDTH}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LayersIcon({ className, ...props }: AtlascopeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx(ATLAS_ICON_BASE_CLASS, "scale-[0.96]", className)}
      {...props}
    >
      <path
        d="m12 5 7 3.5-7 3.5-7-3.5L12 5Zm7 7-7 3.5L5 12m14 4-7 3.5L5 16"
        strokeWidth={ATLAS_ICON_STROKE_WIDTH}
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
      className={cx(ATLAS_ICON_BASE_CLASS, "scale-[1.02]", className)}
      {...props}
    >
      <path
        d="M12 20.25c-.53 0-1-.24-1.31-.68l-3.74-5.4A7.4 7.4 0 0 1 5.7 10.05C5.7 6.14 8.52 3.3 12 3.3s6.3 2.84 6.3 6.75c0 1.53-.45 2.95-1.25 4.12l-3.74 5.4c-.31.44-.78.68-1.31.68Z"
        strokeWidth={ATLAS_ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.2" r="2.7" strokeWidth={ATLAS_ICON_STROKE_WIDTH} />
    </svg>
  );
}

export function ToolIcon({ className, ...props }: AtlascopeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx(ATLAS_ICON_BASE_CLASS, "scale-[1.02]", className)}
      {...props}
    >
      <path
        d="M14.5 6.5a4 4 0 0 0-5.4 4.9L4 16.5V20h3.6l5.1-5.1a4 4 0 0 0 4.9-5.4l-2.7 2.7-2.1-.4-.4-2.1 2.7-2.7Z"
        strokeWidth={ATLAS_ICON_STROKE_WIDTH}
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
      className={cx(ATLAS_ICON_BASE_CLASS, "scale-[1.04]", className)}
      {...props}
    >
      <path
        d="M14.5 3.5a8.5 8.5 0 1 0 6 14.5A9 9 0 0 1 14.5 3.5Z"
        strokeWidth={ATLAS_ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SunIcon({ className, ...props }: AtlascopeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx(ATLAS_ICON_BASE_CLASS, "scale-[0.98]", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="4" strokeWidth={ATLAS_ICON_STROKE_WIDTH} />
      <path
        d="M12 2.75v2.5m0 13.5v2.5m9.25-9.25h-2.5M5.25 12h-2.5m15.29-6.29-1.77 1.77M7.48 16.52l-1.77 1.77m12.06 0-1.77-1.77M7.48 7.48 5.71 5.71"
        strokeWidth={ATLAS_ICON_STROKE_WIDTH}
        strokeLinecap="round"
      />
    </svg>
  );
}
