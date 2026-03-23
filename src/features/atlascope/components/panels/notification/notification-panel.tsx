import { BasePanel, PanelHeader } from "@/features/atlascope/components/overlay/panel/panel-system";
import { atlasUi, cx } from "@/features/atlascope/config/theme";
import { mockNotifications } from "@/features/atlascope/data/mock-notifications";

type NotificationPanelProps = {
  isOpen: boolean;
};

export function NotificationPanel({ isOpen }: NotificationPanelProps) {
  return (
    <BasePanel isOpen={isOpen} ariaLabel="Notifications panel">
      <PanelHeader eyebrow="Notifications" />

      <div className="mt-5 space-y-3">
        {mockNotifications.map((notification) => (
          <div key={notification.id} className={cx("p-4", atlasUi.surfaces.card)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={atlasUi.text.label}>{notification.title}</p>
                <p className={cx("mt-1", atlasUi.text.meta)}>{notification.detail}</p>
              </div>
              <span className="mt-1 size-2 shrink-0 rounded-full bg-atlas-primary" />
            </div>

            <p className={cx("mt-3", atlasUi.text.body)}>{notification.summary}</p>
          </div>
        ))}
      </div>
    </BasePanel>
  );
}
