import { getAtlascopeShellBootstrap } from "@/features/atlascope/data/shell-bootstrap";
import { AtlascopeShell } from "@/features/atlascope/components/shell/atlascope-shell";

export default async function HomePage() {
  const shellBootstrap = await getAtlascopeShellBootstrap();

  return (
    <AtlascopeShell
      incidents={shellBootstrap.incidents}
      notifications={shellBootstrap.notifications}
    />
  );
}
