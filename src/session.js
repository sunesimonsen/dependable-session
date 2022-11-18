// TODO reject unsupported values
import { subscribables, registerInitial } from "@dependable/state";
import { snapshotFromObservables } from "./snapshotFromObservables.js";
import { observablesFromSnapshot } from "./observablesFromSnapshot.js";
import { createPatch, applyPatch } from "./objectDiff.js";

let nextId = 0;

/**
 * Save the current @dependable/state to session storage.
 */
export const saveSession = () => {
  const snapshot = createSnapshot(nextId);

  sessionStorage.setItem("@dependable/session", JSON.stringify(snapshot));
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
 * Returns a snapshot of the current session.
 *
 * @params {number} nextId the id number base to use when generating ids.
 * @returns {import('./shared').SessionSnapshot} a snapshot of the current session.
 */
export const createSnapshot = (nextId = 0) => {
  return snapshotFromObservables(subscribables(), nextId);
};

/**
 * Restore the observables for the given snapshot.
 *
 * @param {import('./shared').SessionSnapshot} snapshot the snapshot to be restored.
 */
export const restoreSnapshot = (snapshot) => {
  const observables = observablesFromSnapshot(snapshot);

  nextId = snapshot.nextId;

  for (const observable of Object.values(observables)) {
    registerInitial(observable);
  }
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
