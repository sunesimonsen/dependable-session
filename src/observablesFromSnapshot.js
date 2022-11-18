import { observable } from "@dependable/state";
import { registerInitial } from "@dependable/state";

const processArray = (value, snapshot, observables) =>
  value.map((item) => processValue(item, snapshot, observables));

const processObject = (value, snapshot, observables) =>
  Object.fromEntries(
    Object.entries(value).map(([k, v]) => [
      k,
      processValue(v, snapshot, observables),
    ])
  );

const processValue = (value, snapshot, observables) => {
  if (value && typeof value === "object") {
    if (value.$reference) {
      return processObservable(value.$reference, snapshot, observables);
    } else if (Array.isArray(value)) {
      return processArray(value, snapshot, observables);
    } else {
      return processObject(value, snapshot, observables);
    }
  } else {
    return value;
  }
};

const isAnonymous = (id) => id.match(/^\$\d+$/);

const processObservable = (id, snapshot, observables) => {
  if (observables[id]) return observables[id];

  const value = processValue(snapshot[id], snapshot, observables);

  if (isAnonymous(id)) {
    observables[id] = observable(value);
    observables[id].sessionId = id;
  } else {
    observables[id] = observable(value, { id });
  }

  return observables[id];
};

export const observablesFromSnapshot = (snapshot) => {
  const result = {};
  const observables = {};

  for (const id of Object.keys(snapshot.observables)) {
    result[id] = processObservable(id, snapshot.observables, observables);
  }

  return observables;
};
