"use client";

/**
 * Edit-mode context. Lets nested widgets discover (a) whether the dashboard is
 * in edit mode, and (b) callbacks to remove/configure themselves.
 *
 * The DashboardRenderer provides the value; individual widgets consume it via
 * `useEditMode()` to render the ⋯ menu and ✕ button.
 */
import { createContext, useContext, type ReactNode } from "react";

export type EditModeValue = {
  editing: boolean;
  onRemove?: (sectionIdx: number, widgetIdx: number) => void;
  onReorder?: (sectionIdx: number, fromIdx: number, toIdx: number) => void;
};

const EditModeContext = createContext<EditModeValue>({ editing: false });

export function EditModeProvider({
  value,
  children,
}: {
  value: EditModeValue;
  children: ReactNode;
}) {
  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode(): EditModeValue {
  return useContext(EditModeContext);
}
