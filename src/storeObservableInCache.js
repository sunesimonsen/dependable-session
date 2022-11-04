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

export const storeObservableInCache = (observable, cache) => {
  const id = observable.id;

  if (!cache[id]) {
    cache[id] = toJSON(observable(), cache);
  }

  return id;
};
