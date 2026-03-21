import { useCallback, useEffect, useRef, useState } from "react";

import type { MapCoordinates } from "@/features/atlascope/map/core/types";
import type { AtlascopeGeofence } from "@/features/atlascope/types/geofence";

type FocusedGeofenceRequest = {
  geofenceId: number;
  nonce: number;
};

type UseAtlascopeGeofencesOptions = {
  initialGeofences: AtlascopeGeofence[];
  openGeofencePanel: () => void;
};

export function useAtlascopeGeofences({
  initialGeofences,
  openGeofencePanel,
}: UseAtlascopeGeofencesOptions) {
  const [geofences, setGeofences] = useState<AtlascopeGeofence[]>(initialGeofences);
  const [drawingGeofenceCoordinates, setDrawingGeofenceCoordinates] = useState<MapCoordinates[]>(
    [],
  );
  const [isDrawingGeofence, setIsDrawingGeofence] = useState(false);
  const [editingGeofenceId, setEditingGeofenceId] = useState<number | null>(null);
  const [editingGeofenceCoordinates, setEditingGeofenceCoordinates] = useState<
    MapCoordinates[]
  >([]);
  const [renamingGeofenceId, setRenamingGeofenceId] = useState<number | null>(null);
  const [geofenceDraftName, setGeofenceDraftName] = useState("");
  const [enteringGeofenceId, setEnteringGeofenceId] = useState<number | null>(null);
  const [showGeofenceRowActions, setShowGeofenceRowActions] = useState(false);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<number | null>(null);
  const [focusedGeofenceRequest, setFocusedGeofenceRequest] =
    useState<FocusedGeofenceRequest | null>(null);
  const geofenceEnterTimerRef = useRef<number | null>(null);
  const selectedGeofencePreviewRef = useRef<{
    geofenceId: number;
    previousVisibility: boolean;
  } | null>(null);
  const isGeofencePanelPersistent = isDrawingGeofence || editingGeofenceId !== null;

  const restoreSelectedGeofencePreview = useCallback(() => {
    const preview = selectedGeofencePreviewRef.current;

    if (!preview) {
      return;
    }

    selectedGeofencePreviewRef.current = null;
    setGeofences((current) =>
      current.map((geofence) =>
        geofence.id === preview.geofenceId
          ? { ...geofence, isEnabled: preview.previousVisibility }
          : geofence,
      ),
    );
  }, []);

  const commitEditingGeofenceCoordinates = useCallback(() => {
    if (editingGeofenceId === null || !editingGeofenceCoordinates.length) {
      return;
    }

    setGeofences((current) =>
      current.map((geofence) =>
        geofence.id === editingGeofenceId
          ? { ...geofence, coordinates: cloneCoordinates(editingGeofenceCoordinates) }
          : geofence,
      ),
    );
  }, [editingGeofenceCoordinates, editingGeofenceId]);

  const handleCancelEditingGeofence = useCallback(
    (geofence: AtlascopeGeofence) => {
      setEditingGeofenceCoordinates([]);
      setEditingGeofenceId((current) => (current === geofence.id ? null : current));
      setRenamingGeofenceId((current) => (current === geofence.id ? null : current));
      setGeofenceDraftName(geofence.name);
    },
    [],
  );

  const handleFinishDrawingGeofence = useCallback(() => {
    if (drawingGeofenceCoordinates.length < 3) {
      return;
    }

    const id = Date.now();

    setGeofences((current) => [
      ...current,
      {
        id,
        name: "New Geofence",
        isEnabled: true,
        coordinates: drawingGeofenceCoordinates,
      },
    ]);
    setEditingGeofenceId(id);
    setEditingGeofenceCoordinates(cloneCoordinates(drawingGeofenceCoordinates));
    setRenamingGeofenceId(id);
    setGeofenceDraftName("New Geofence");
    setEnteringGeofenceId(id);
    setIsDrawingGeofence(false);
    setDrawingGeofenceCoordinates([]);
    openGeofencePanel();

    if (geofenceEnterTimerRef.current) {
      window.clearTimeout(geofenceEnterTimerRef.current);
    }

    geofenceEnterTimerRef.current = window.setTimeout(() => {
      setEnteringGeofenceId((current) => (current === id ? null : current));
      geofenceEnterTimerRef.current = null;
    }, 220);
  }, [drawingGeofenceCoordinates, openGeofencePanel]);

  const handleGeofencePanelDismiss = useCallback(() => {
    commitEditingGeofenceCoordinates();
    restoreSelectedGeofencePreview();
    setSelectedGeofenceId(null);
    setShowGeofenceRowActions(false);
    setEditingGeofenceId(null);
    setEditingGeofenceCoordinates([]);
    setRenamingGeofenceId(null);
  }, [commitEditingGeofenceCoordinates, restoreSelectedGeofencePreview]);
  const handleCancelDrawingGeofence = useCallback(() => {
    setIsDrawingGeofence(false);
    setDrawingGeofenceCoordinates([]);
  }, []);
  const handleSaveEditingGeofence = useCallback(() => {
    commitEditingGeofenceCoordinates();
    setEditingGeofenceCoordinates([]);
    setEditingGeofenceId(null);
    setRenamingGeofenceId(null);
  }, [commitEditingGeofenceCoordinates]);

  useEffect(() => {
    return () => {
      if (geofenceEnterTimerRef.current) {
        window.clearTimeout(geofenceEnterTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedGeofenceId === null) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest(`[data-geofence-item-id="${selectedGeofenceId}"]`)) {
        return;
      }

      restoreSelectedGeofencePreview();
      setSelectedGeofenceId(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [restoreSelectedGeofencePreview, selectedGeofenceId]);

  useEffect(() => {
    if (editingGeofenceId === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      const geofence = geofences.find((item) => item.id === editingGeofenceId);

      if (!geofence) {
        return;
      }

      event.preventDefault();
      handleCancelEditingGeofence(geofence);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingGeofenceId, geofences, handleCancelEditingGeofence]);

  useEffect(() => {
    if (!isDrawingGeofence && editingGeofenceId === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();

        if (isDrawingGeofence) {
          handleCancelDrawingGeofence();
          return;
        }

        const geofence = geofences.find((item) => item.id === editingGeofenceId);

        if (geofence) {
          handleCancelEditingGeofence(geofence);
        }

        return;
      }

      if (event.key !== "Enter") {
        return;
      }

      if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      event.preventDefault();

      if (isDrawingGeofence) {
        if (drawingGeofenceCoordinates.length >= 3) {
          handleFinishDrawingGeofence();
        }

        return;
      }

      if (editingGeofenceId !== null) {
        handleSaveEditingGeofence();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    drawingGeofenceCoordinates.length,
    editingGeofenceId,
    geofences,
    handleCancelDrawingGeofence,
    handleCancelEditingGeofence,
    handleFinishDrawingGeofence,
    handleSaveEditingGeofence,
    isDrawingGeofence,
  ]);

  function handleAddGeofence() {
    commitEditingGeofenceCoordinates();
    setShowGeofenceRowActions(false);
    setEditingGeofenceId(null);
    setEditingGeofenceCoordinates([]);
    setRenamingGeofenceId(null);
    setGeofenceDraftName("New Geofence");
    setDrawingGeofenceCoordinates([]);
    setIsDrawingGeofence(true);
    openGeofencePanel();
  }

  function handleAddGeofencePoint(coordinates: MapCoordinates) {
    if (!isDrawingGeofence) {
      return;
    }

    setDrawingGeofenceCoordinates((current) => [...current, coordinates]);
  }

  function handleAddGeofencePointAt(index: number, coordinates: MapCoordinates) {
    if (!isDrawingGeofence) {
      return;
    }

    setDrawingGeofenceCoordinates((current) =>
      insertCoordinatesAt(current, index, coordinates),
    );
  }

  function handleUpdateDrawingGeofencePoint(index: number, coordinates: MapCoordinates) {
    if (!isDrawingGeofence) {
      return;
    }

    setDrawingGeofenceCoordinates((current) =>
      current.map((point, pointIndex) => (pointIndex === index ? coordinates : point)),
    );
  }

  function handleRemoveDrawingGeofencePoint(index: number) {
    if (!isDrawingGeofence) {
      return;
    }

    setDrawingGeofenceCoordinates((current) =>
      current.filter((_, pointIndex) => pointIndex !== index),
    );
  }

  function handleAddEditingGeofencePoint(coordinates: MapCoordinates) {
    if (isDrawingGeofence || editingGeofenceId === null) {
      return;
    }

    setEditingGeofenceCoordinates((current) => [...current, coordinates]);
  }

  function handleAddEditingGeofencePointAt(index: number, coordinates: MapCoordinates) {
    if (isDrawingGeofence || editingGeofenceId === null) {
      return;
    }

    setEditingGeofenceCoordinates((current) =>
      insertCoordinatesAt(current, index, coordinates),
    );
  }

  function handleUpdateEditingGeofencePoint(index: number, coordinates: MapCoordinates) {
    if (isDrawingGeofence || editingGeofenceId === null) {
      return;
    }

    setEditingGeofenceCoordinates((current) =>
      current.map((point, pointIndex) => (pointIndex === index ? coordinates : point)),
    );
  }

  function handleRemoveEditingGeofencePoint(index: number) {
    if (isDrawingGeofence || editingGeofenceId === null) {
      return;
    }

    setEditingGeofenceCoordinates((current) =>
      current.filter((_, pointIndex) => pointIndex !== index),
    );
  }

  function handleRenameGeofence(id: number, name: string) {
    setGeofences((current) =>
      current.map((geofence) => (geofence.id === id ? { ...geofence, name } : geofence)),
    );
  }

  function handleToggleGeofenceVisibility(id: number) {
    setGeofences((current) =>
      current.map((geofence) =>
        geofence.id === id ? { ...geofence, isEnabled: !geofence.isEnabled } : geofence,
      ),
    );
  }

  function handleStartEditingGeofence(geofence: AtlascopeGeofence) {
    commitEditingGeofenceCoordinates();
    const nextId = editingGeofenceId === geofence.id ? null : geofence.id;

    setEditingGeofenceId(nextId);
    setEditingGeofenceCoordinates(
      nextId === geofence.id ? cloneCoordinates(geofence.coordinates) : [],
    );
    setRenamingGeofenceId(null);
    openGeofencePanel();
  }

  function handleFocusGeofence(geofence: AtlascopeGeofence) {
    if (selectedGeofenceId !== geofence.id) {
      restoreSelectedGeofencePreview();
      selectedGeofencePreviewRef.current = {
        geofenceId: geofence.id,
        previousVisibility: geofence.isEnabled,
      };

      if (!geofence.isEnabled) {
        setGeofences((current) =>
          current.map((item) =>
            item.id === geofence.id ? { ...item, isEnabled: true } : item,
          ),
        );
      }
    }

    setSelectedGeofenceId(geofence.id);
    setFocusedGeofenceRequest({
      geofenceId: geofence.id,
      nonce: Date.now(),
    });
  }

  function handleStartRenamingGeofence(geofence: AtlascopeGeofence) {
    commitEditingGeofenceCoordinates();
    setEditingGeofenceId(null);
    setEditingGeofenceCoordinates([]);
    setRenamingGeofenceId(geofence.id);
    setGeofenceDraftName(geofence.name);
    handleFocusGeofence(geofence);
    openGeofencePanel();
  }

  function handleDeleteGeofence(id: number) {
    if (selectedGeofencePreviewRef.current?.geofenceId === id) {
      selectedGeofencePreviewRef.current = null;
    }

    if (editingGeofenceId === id) {
      setEditingGeofenceCoordinates([]);
    }

    setGeofences((current) => current.filter((geofence) => geofence.id !== id));
    setEditingGeofenceId((current) => (current === id ? null : current));
    setRenamingGeofenceId((current) => (current === id ? null : current));
    setEnteringGeofenceId((current) => (current === id ? null : current));
    setSelectedGeofenceId((current) => (current === id ? null : current));
  }

  function handleToggleGeofenceRowActions() {
    const next = !showGeofenceRowActions;

    if (!next) {
      commitEditingGeofenceCoordinates();
      setEditingGeofenceId(null);
      setEditingGeofenceCoordinates([]);
      setRenamingGeofenceId(null);
    }

    setShowGeofenceRowActions(next);
  }

  return {
    drawingGeofenceCoordinates,
    editingGeofenceCoordinates,
    handleAddEditingGeofencePointAt,
    editingGeofenceId,
    enteringGeofenceId,
    focusedGeofenceRequest,
    geofenceDraftName,
    geofences,
    handleAddEditingGeofencePoint,
    handleAddGeofence,
    handleAddGeofencePoint,
    handleAddGeofencePointAt,
    handleCancelDrawingGeofence,
    handleCancelEditingGeofence,
    handleDeleteGeofence,
    handleFinishDrawingGeofence,
    handleFocusGeofence,
    handleGeofencePanelDismiss,
    handleRemoveDrawingGeofencePoint,
    handleRemoveEditingGeofencePoint,
    handleRenameGeofence,
    handleSaveEditingGeofence,
    handleStartEditingGeofence,
    handleStartRenamingGeofence,
    handleToggleGeofenceRowActions,
    handleToggleGeofenceVisibility,
    handleUpdateDrawingGeofencePoint,
    handleUpdateEditingGeofencePoint,
    isDrawingGeofence,
    isGeofencePanelPersistent,
    renamingGeofenceId,
    selectedGeofenceId,
    setGeofenceDraftName,
    showGeofenceRowActions,
  };
}

function cloneCoordinates(coordinates: MapCoordinates[]) {
  return coordinates.map((point) => ({ ...point }));
}

function insertCoordinatesAt(
  coordinates: MapCoordinates[],
  index: number,
  point: MapCoordinates,
) {
  const insertionIndex = Math.max(0, Math.min(index, coordinates.length));

  return [
    ...coordinates.slice(0, insertionIndex),
    point,
    ...coordinates.slice(insertionIndex),
  ];
}
