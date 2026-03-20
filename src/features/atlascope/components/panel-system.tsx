"use client";

import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from "react";

import { themeClasses, type ThemeMode } from "@/features/atlascope/config/theme";

type PanelConfig = {
  dismissible?: boolean;
};

type UsePanelManagerOptions<T extends string> = {
  activePanel: T | null;
  onActivePanelChange: (panel: T | null) => void;
  panelConfigs: Partial<Record<T, PanelConfig>>;
  panelRootRef: RefObject<HTMLElement | null>;
};

type BasePanelProps = {
  theme: ThemeMode;
  isOpen: boolean;
  ariaLabel: string;
  children: ReactNode;
  widthClassName?: string;
  wrapperClassName?: string;
  variant?: "default" | "compact";
};

type PanelHeaderProps = {
  theme: ThemeMode;
  eyebrow?: string;
  title?: string;
  actions?: ReactNode;
  className?: string;
};

function isPanelDismissible<T extends string>(
  panel: T | null,
  panelConfigs: Partial<Record<T, PanelConfig>>,
) {
  if (panel === null) {
    return true;
  }

  return panelConfigs[panel]?.dismissible ?? true;
}

export function usePanelManager<T extends string>({
  activePanel,
  onActivePanelChange,
  panelConfigs,
  panelRootRef,
}: UsePanelManagerOptions<T>) {
  useEffect(() => {
    if (activePanel === null || !isPanelDismissible(activePanel, panelConfigs)) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!panelRootRef.current?.contains(target)) {
        onActivePanelChange(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [activePanel, onActivePanelChange, panelConfigs, panelRootRef]);

  useEffect(() => {
    if (activePanel === null || !isPanelDismissible(activePanel, panelConfigs)) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      onActivePanelChange(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePanel, onActivePanelChange, panelConfigs]);

  const openPanel = useCallback((panel: T) => {
    if (activePanel !== null && activePanel !== panel && !isPanelDismissible(activePanel, panelConfigs)) {
      return;
    }

    onActivePanelChange(panel);
  }, [activePanel, onActivePanelChange, panelConfigs]);

  const togglePanel = useCallback((panel: T) => {
    if (activePanel === panel) {
      if (!isPanelDismissible(panel, panelConfigs)) {
        return;
      }

      onActivePanelChange(null);
      return;
    }

    if (activePanel !== null && !isPanelDismissible(activePanel, panelConfigs)) {
      return;
    }

    onActivePanelChange(panel);
  }, [activePanel, onActivePanelChange, panelConfigs]);

  const closeActivePanel = useCallback(() => {
    if (activePanel === null || !isPanelDismissible(activePanel, panelConfigs)) {
      return;
    }

    onActivePanelChange(null);
  }, [activePanel, onActivePanelChange, panelConfigs]);

  return {
    closeActivePanel,
    isPanelOpen: (panel: T) => activePanel === panel,
    openPanel,
    togglePanel,
  };
}

export function BasePanel({
  theme,
  isOpen,
  ariaLabel,
  children,
  widthClassName = "w-[320px]",
  wrapperClassName,
  variant = "default",
}: BasePanelProps) {
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div
      className={`absolute right-0 top-0 origin-top-right transition-[opacity,transform] ease-out ${
        isOpen
          ? "translate-y-0 scale-100 opacity-100 duration-250"
          : "pointer-events-none -translate-y-1 scale-[0.985] opacity-0 duration-120"
      } ${wrapperClassName ?? ""}`}
    >
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="false"
        aria-label={ariaLabel}
        className={`${widthClassName} ${themeClasses(theme, getPanelVariantClasses(variant))}`}
      >
        {children}
      </aside>
    </div>
  );
}

export function PanelHeader({
  theme,
  eyebrow,
  title,
  actions,
  className,
}: PanelHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className ?? ""}`}>
      <div>
        {eyebrow ? (
          <p
            className={themeClasses(theme, {
              dark: "text-[10px] font-semibold tracking-[0.24em] text-white/30 uppercase",
              light: "text-[10px] font-semibold tracking-[0.24em] text-[#607078] uppercase",
            })}
          >
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <p
            className={themeClasses(theme, {
              dark: eyebrow ? "mt-2 text-lg font-semibold text-white/86" : "text-[30px] font-semibold tracking-[-0.02em] text-white/88",
              light: eyebrow ? "mt-2 text-lg font-semibold text-[#1F2A30]" : "text-[30px] font-semibold tracking-[-0.02em] text-[#36424A]",
            })}
          >
            {title}
          </p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

function getPanelVariantClasses(variant: BasePanelProps["variant"]) {
  if (variant === "compact") {
    return {
      dark:
        "rounded-[28px] border border-white/10 bg-[rgba(11,16,19,0.88)] p-4 shadow-[0_22px_54px_rgba(0,0,0,0.28)] backdrop-blur-md",
      light:
        "rounded-[28px] border border-[#3D464C]/12 bg-[rgba(243,245,246,0.92)] p-4 shadow-[0_18px_38px_rgba(68,79,88,0.14)] backdrop-blur-md",
    };
  }

  return {
    dark:
      "rounded-3xl border border-white/10 bg-[rgba(11,16,19,0.84)] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur-md",
    light:
      "rounded-3xl border border-[#3D464C]/12 bg-[rgba(243,245,246,0.9)] p-4 shadow-[0_18px_40px_rgba(68,79,88,0.14)] backdrop-blur-md",
  };
}
