import { observable } from "@dependable/state";

const isAnonymous = (id) => id.startsWith("anonymous$");

const processArray = (value, cache, observables) =>
  value.map((item) => processValue(item, cache, observables));

const processObject = (value, cache, observables) =>
  Object.fromEntries(
    Object.entries(value).map(([k, v]) => [
      k,
      processValue(v, cache, observables),
    ])
  );

const processValue = (value, cache, observables) => {
  if (value && typeof value === "object") {
    if (value.$reference) {
      return processObservable(value.$reference, cache, observables);
    } else if (Array.isArray(value)) {
      return processArray(value, cache, observables);
    } else {
      return processObject(value, cache, observables);
    }
  } else {
    return value;
  }
};

const processObservable = (id, cache, observables) => {
  if (observables[id]) return observables[id];

  const value = processValue(cache[id], cache, observables);

  if (isAnonymous(id)) {
    observables[id] = observable(value);
  } else {
    observables[id] = observable(value, { id });
  }

  return observables[id];
};

export const restoreObservablesFromCache = (cache) => {
  const result = {};
  const observables = {};

  for (const id of Object.keys(cache)) {
    if (!isAnonymous(id)) {
      result[id] = processObservable(id, cache, observables);
    }
  }

  return result;
};
