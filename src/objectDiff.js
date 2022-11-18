const createArrayUpdates = (current, next, delMarker) => {
  if (!Array.isArray(current)) return next;

  const updates = [];

  const commonLength = Math.min(current.length, next.length);

  for (let i = 0; i < commonLength; i++) {
    if (
      !next[i] ||
      typeof next[i] !== "object" ||
      typeof current[i] !== "object"
    ) {
      updates[i] = next[i];
    } else {
      updates[i] = createUpdates(current[i], next[i], delMarker);
    }
  }

  for (let i = commonLength; i < next.length; i++) {
    updates[i] = next[i];
  }

  return updates;
};

const hasArrayChanges = (updates, current) =>
  !Array.isArray(current) ||
  updates.length !== current.length ||
  updates.some((update, i) => {
    if (update !== null) {
      if (Array.isArray(update)) return hasArrayChanges(update, current[i]);
      if (typeof update === "object") return Object.keys(update).length;
    }

    return !Object.is(update, current[i]);
  });

const createUpdates = (current, next, delMarker) => {
  if (Array.isArray(next)) {
    return createArrayUpdates(current, next, delMarker);
  }

  const cKeys = Object.keys(current);
  const nKeys = Object.keys(next);

  const updates = {};

  for (const key of nKeys) {
    if (
      !next[key] ||
      typeof next[key] !== "object" ||
      typeof current[key] !== "object"
    ) {
      if (!Object.is(next[key], current[key])) {
        updates[key] = next[key];
      }
    } else {
      const keyUpdates = createUpdates(current[key], next[key], delMarker);
      const hasChanges = Array.isArray(keyUpdates)
        ? hasArrayChanges(keyUpdates, current[key])
        : Object.keys(keyUpdates).length;

      if (hasChanges) {
        updates[key] = createUpdates(current[key], next[key], delMarker);
      }
    }
  }

  for (const key of cKeys) {
    if (!(key in next)) {
      updates[key] = delMarker;
    }
  }

  return updates;
};

const delMarkerRegexp = /^\$del(\d+)$/;

const findDelMarkerLikeValues = (data) => {
  if (typeof data === "string" && data.match(delMarkerRegexp)) {
    return data;
  }

  if (data && typeof data === "object") {
    return Object.values(data).flatMap(findDelMarkerLikeValues).filter(Boolean);
  }

  return null;
};

const createDelMarker = (data) => {
  const index = findDelMarkerLikeValues(data)
    .map((v) => parseInt(v.replace(delMarkerRegexp, "$1")))
    .reduce((max, v) => Math.max(max, v), 0);

  if (!index) {
    return "$del";
  }

  return "$del" + (index + 1);
};

export const createPatch = (current, next) => {
  const delMarker = createDelMarker(next);
  return { u: createUpdates(current, next, delMarker), d: delMarker };
};

const applyArrayPatchUpdate = (current, update, delMarker) => {
  const result = current.slice(update.length);

  for (let i = 0; i < update.length; i++) {
    result[i] = applyPatchUpdate(current[i], update[i], delMarker);
  }

  return result;
};

const applyObjectPatchUpdate = (current, update, delMarker) => {
  const result = { ...current };

  for (const key of Object.keys(update)) {
    const value = update[key];
    if (value === delMarker) {
      delete result[key];
    } else {
      result[key] = applyPatchUpdate(current[key], update[key], delMarker);
    }
  }

  return result;
};

const applyPatchUpdate = (current, update, delMarker) => {
  if (
    update &&
    current &&
    typeof update === "object" &&
    typeof current === "object"
  ) {
    if (Array.isArray(update)) {
      return applyArrayPatchUpdate(current, update, delMarker);
    }

    return applyObjectPatchUpdate(current, update, delMarker);
  }

  return update;
};

export const applyPatch = (current, patch) =>
  applyPatchUpdate(current, patch.u, patch.d);
