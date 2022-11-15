// TODO reject unsupported values
import { subscribables, registerInitial } from "@dependable/state";
import { storeObservableInCache } from "./storeObservableInCache.js";
import { restoreObservablesFromCache } from "./restoreObservablesFromCache.js";
import { createPatch, applyPatch } from "./objectDiff.js";

/**
 * Returns a snapshot of the current session.
 *
 * @returns {import('./shared').SessionSnapshot} a snapshot of the current session.
 */
export const createSnapshot = () => {
  const observables = {};
  for (const subscribable of subscribables()) {
    if (subscribable.kind === "observable" && subscribable.restore) {
      storeObservableInCache(subscribable, observables);
    }
  }
  return { nextId: globalThis.__dependable.nextId, observables };
};

/**
 * Save the current @dependable/state to session storage.
 */
export const saveSession = () => {
  const snapshot = createSnapshot();

  sessionStorage.setItem("@dependable/session", JSON.stringify(snapshot));
};

/**
 * Restore the observables for the given snapshot.
 *
 * @param {import('./shared').SessionSnapshot} snapshot the snapshot to be restored.
 */
export const restoreSnapshot = (snapshot) => {
  const observables = restoreObservablesFromCache(snapshot.observables);

  globalThis.__dependable.nextId = snapshot.nextId;

  for (const observable of Object.values(observables)) {
    registerInitial(observable);
  }
};

/**
 * Restore saved @dependable/state from session storage.
 *
 * @throws Error if no session has been stored.
 */
export const restoreSession = () => {
  const data = sessionStorage.getItem("@dependable/session");
  if (!data) {
    throw new Error("No session to restore");
  }

  sessionStorage.removeItem("@dependable/session");
  const snapshot = JSON.parse(data);

  restoreSnapshot(snapshot);
};

/**
 * Creates a patch between two session snapshots.
 *
 * @param {import('./shared').SessionSnapshot} current a snapshot of the current session
 * @param {import('./shared').SessionSnapshot} updated a snapshot of the updated session
 * @return {import('./shared').SessionSnapshotDiff} the diff between the snapshots
 */
export const diffSnapshots = (current, updated) =>
  createPatch(current, updated);

/**
 * Applies a snapshot patch to a given session snapshot.
 *
 * @param {import('./shared').SessionSnapshot} snapshot a session snapshot to apply the patch to
 * @param {import('./shared').SessionSnapshotPatch} patch a snapshot patch to apply to the given session snapshot
 * @return {import('./shared').SessionSnapshot} the resulting session snapshot
 */
export const applySnapshotDiff = (snapshot, patch) =>
  applyPatch(snapshot, patch);
