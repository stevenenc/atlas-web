import { atlasUi, cx } from "@/features/atlascope/config/theme";

export default function Loading() {
  return (
    <main className={atlasUi.layout.pageMain}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-10 w-56 animate-pulse rounded bg-atlas-card-border/60" />
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={cx(atlasUi.page.card, "animate-pulse space-y-3")}
            >
              <div className="h-5 w-40 rounded bg-atlas-card-border/70" />
              <div className="h-4 w-56 rounded bg-atlas-card-border/50" />
              <div className="h-4 w-36 rounded bg-atlas-card-border/50" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
