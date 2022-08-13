class IdGenerator {
  constructor(prefix) {
    this.nextId = 0;
    this.prefix = prefix;
  }

  generate() {
    return `${this.prefix}${this.nextId++}`;
  }
}

const objectToJSON = (value, options) =>
  Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, toJSON(v, options)])
  );

const arrayToJSON = (value, options) =>
  value.map((item) => toJSON(item, options));

const toJSON = (value, options) => {
  if (typeof value === "function") {
    if (value.kind === "observable") {
      const id = storeObservableInCache(value, options.cache, options);
      return { $reference: id };
    } else {
      throw new Error(
        "Observables can only contain JSON serializable data and other observables"
      );
    }
  }

  if (value && typeof value === "object") {
    if (Array.isArray(value)) {
      return arrayToJSON(value, options);
    } else {
      return objectToJSON(value, options);
    }
  }

  return value;
};

export const storeObservableInCache = (
  observable,
  cache,
  { ids = new Map(), idGenerator = new IdGenerator("anonymous$") } = {}
) => {
  let id = observable.id || ids.get(observable);

  if (!id) {
    id = idGenerator.generate();
    ids.set(observable, id);
  }

  if (!cache[id]) {
    cache[id] = toJSON(observable(), { cache, ids, idGenerator });
  }

  return id;
};
