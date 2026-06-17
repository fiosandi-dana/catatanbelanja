"use client";

/**
 * Tiny client-side event bus so + Catat / Hapus actions can update the
 * BottomNav badge instantly without waiting for a Server Component re-render.
 * Each Server Action still revalidates the layout in the background — this
 * just makes the UI feel sub-100ms.
 */
type Kind = "added" | "removed" | "cleared" | "set";
type Listener = (kind: Kind, delta: number) => void;

const listeners = new Set<Listener>();

export function notifyCatat(kind: Kind, delta = 1) {
  for (const fn of listeners) fn(kind, delta);
}

export function subscribeCatat(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
