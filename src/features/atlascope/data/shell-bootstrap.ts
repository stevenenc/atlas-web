import "server-only";

import { incidents as stubIncidents } from "@/features/atlascope/data/mock-incidents";
import { mockNotifications as stubNotifications } from "@/features/atlascope/data/mock-notifications";
import type {
  AtlascopeNotification,
  Incident,
} from "@/features/atlascope/types/atlascope";

export type AtlascopeShellBootstrap = {
  incidents: Incident[];
  notifications: AtlascopeNotification[];
};

function shouldUseStubShellData() {
  return process.env.ATLAS_ENABLE_STUB_SHELL_DATA !== "false";
}

export async function getAtlascopeShellBootstrap(): Promise<AtlascopeShellBootstrap> {
  if (!shouldUseStubShellData()) {
    return {
      incidents: [],
      notifications: [],
    };
  }

  return {
    incidents: stubIncidents,
    notifications: stubNotifications,
  };
}
