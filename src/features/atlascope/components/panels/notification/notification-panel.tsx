import { BasePanel, PanelHeader } from "@/features/atlascope/components/overlay/panel/panel-system";
import { atlasUi, cx } from "@/features/atlascope/config/theme";
import type { AtlascopeNotification } from "@/features/atlascope/types/atlascope";

type NotificationPanelProps = {
  isOpen: boolean;
  notifications: AtlascopeNotification[];
};

export function NotificationPanel({
  isOpen,
  notifications,
}: NotificationPanelProps) {
  return (
    <BasePanel isOpen={isOpen} ariaLabel="Notifications panel">
      <PanelHeader eyebrow="Notifications" />

      {notifications.length ? (
        <div className="mt-5 space-y-3">
          {notifications.map((notification) => (
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
      ) : (
        <div className={cx("mt-5 p-4", atlasUi.surfaces.card)}>
          <p className={atlasUi.text.label}>No notifications yet</p>
          <p className={cx("mt-2", atlasUi.text.body)}>
            Notification delivery is ready for backend integration, but no live feed is configured
            for this environment.
          </p>
        </div>
      )}
    </BasePanel>
  );
}
