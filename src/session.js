// TODO reject unsupported values
import { subscribables, registerInitial } from "@dependable/state";
import { storeObservableInCache } from "./storeObservableInCache.js";
import { restoreObservablesFromCache } from "./restoreObservablesFromCache.js";
import { diff } from "just-diff";
import { diffApply } from "just-diff-apply";
import clone from "just-clone";

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
 * Creates a diff between two session snapshots.
 *
 * @param {import('./shared').SessionSnapshot} current a snapshot of the current session
 * @param {import('./shared').SessionSnapshot} updated a snapshot of the updated session
 * @return {import('./shared').SessionSnapshotDiff} the diff between the snapshots
 */
export const diffSnapshots = (current, updated) => diff(current, updated);

/**
 * Applies a snapshot diff to a given session snapshot.
 *
 * @param {import('./shared').SessionSnapshot} snapshot a session snapshot to apply the diff to
 * @param {import('./shared').SessionSnapshotDiff} diff a snapshot diff to apply to the given session snapshot
 * @return {import('./shared').SessionSnapshot} the resulting session snapshot
 */
export const applySnapshotDiff = (snapshot, diff) => {
  const result = clone(snapshot);

  diffApply(result, diff);

  return result;
};
