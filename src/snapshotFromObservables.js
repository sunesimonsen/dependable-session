const objectToJSON = (value, cache) =>
  Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, toJSON(v, cache)])
  );

const arrayToJSON = (value, cache) => value.map((item) => toJSON(item, cache));

const toJSON = (value, cache) => {
  if (typeof value === "function") {
    if (value.kind === "observable") {
      const id = storeObservableInCache(value, cache);
      return { $reference: id };
    } else {
      throw new Error(
        "Observables can only contain JSON serializable data and other observables"
      );
    }
  }

  if (value && typeof value === "object") {
    if (Array.isArray(value)) {
      return arrayToJSON(value, cache);
    } else {
      return objectToJSON(value, cache);
    }
  }

  return value;
};

const storeObservableInCache = (observable, cache) => {
  let id = observable.id || cache.ids.get(observable);

  if (!id) {
    id = "$" + cache.nextId++;
    cache.ids.set(observable, id);
  }

  if (!cache[id]) {
    cache.observables[id] = toJSON(observable(), cache);
  }

  return id;
};

export const snapshotFromObservables = (observables) => {
  const cache = { nextId: 0, ids: new Map(), observables: {} };

  Array.from(observables)
    .filter((subscribable) => subscribable.kind === "observable")
    .sort((a, b) => {
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
    })
    .forEach((subscribable) => {
      storeObservableInCache(subscribable, cache);
    });

  return cache.observables;
};
