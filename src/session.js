// TODO reject unsupported values
import { subscribables, registerInitial } from "@dependable/state";
import { storeObservableInCache } from "./storeObservableInCache.js";
import { restoreObservablesFromCache } from "./restoreObservablesFromCache.js";

/**
 * Returns a snapshot of the current session.
 *
 * @returns {Object} a snapshot of the current session.
 */
export const createSnapshot = () => {
  const snapshot = {};
  for (const subscribable of subscribables()) {
    if (subscribable.kind === "observable") {
      storeObservableInCache(subscribable, snapshot);
    }
  }
  return snapshot;
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
 * @param {Object} snapshot the snapshot to be restored.
 */
export const restoreSnapshot = (snapshot) => {
  const restored = restoreObservablesFromCache(snapshot);

  for (const observable of Object.values(restored)) {
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
