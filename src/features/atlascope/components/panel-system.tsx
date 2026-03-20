"use client";

import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from "react";

import { atlasUi, cx } from "@/features/atlascope/config/theme";

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
  isOpen: boolean;
  ariaLabel: string;
  children: ReactNode;
  widthClassName?: string;
  wrapperClassName?: string;
  variant?: "default" | "compact";
};

type PanelHeaderProps = {
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
      className={cx(
        "absolute right-0 top-0 origin-top-right transition-[opacity,transform] ease-out",
        isOpen
          ? "translate-y-0 scale-100 opacity-100 duration-250"
          : "pointer-events-none -translate-y-1 scale-[0.985] opacity-0 duration-120",
        wrapperClassName,
      )}
    >
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="false"
        aria-label={ariaLabel}
        className={cx(
          widthClassName,
          variant === "compact" ? atlasUi.panels.compact : atlasUi.panels.default,
        )}
      >
        {children}
      </aside>
    </div>
  );
}

export function PanelHeader({
  eyebrow,
  title,
  actions,
  className,
}: PanelHeaderProps) {
  return (
    <div className={cx("flex items-start justify-between gap-4", className)}>
      <div>
        {eyebrow ? <p className={atlasUi.text.eyebrow}>{eyebrow}</p> : null}
        {title ? (
          <p className={cx(eyebrow ? `mt-2 ${atlasUi.text.heading}` : atlasUi.text.display)}>
            {title}
          </p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
