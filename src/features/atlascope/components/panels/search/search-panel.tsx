import { atlasUi, cx } from "@/features/atlascope/config/theme";
import { SearchIcon } from "@/features/atlascope/components/icons/atlascope-icons";
import { BasePanel, PanelHeader } from "@/features/atlascope/components/overlay/panel/panel-system";

type SearchPanelProps = {
  isOpen: boolean;
};

export function SearchPanel({ isOpen }: SearchPanelProps) {
  return (
    <BasePanel
      isOpen={isOpen}
      ariaLabel="Search panel"
      variant="compact"
      widthClassName="w-[272px]"
    >
      <PanelHeader eyebrow="Search" />

      <div className={cx("mt-5 flex w-full items-center gap-3 px-4 py-3", atlasUi.surfaces.card)}>
        <div className="flex size-5 items-center justify-center text-atlas-muted">
          <SearchIcon />
        </div>
        <input
          type="text"
          placeholder="Search region or hazard"
          className="w-full bg-transparent text-sm text-atlas-ink outline-none placeholder:text-atlas-soft"
        />
      </div>
    </BasePanel>
  );
}
