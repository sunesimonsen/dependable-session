import unexpected from "unexpected";
import unexpectedDependable from "unexpected-dependable";
import { observable } from "@dependable/state";

import { storeObservableInCache } from "../src/storeObservableInCache.js";

const expect = unexpected.clone().use(unexpectedDependable);

const nullObservable = observable(null, { id: "null" });
const falseObservable = observable(false, { id: "false" });
const arrayObservable = observable([0, 1, 2], { id: "array" });
const objectObservable = observable(
  { zero: 0, one: 1, two: 2 },
  { id: "object" }
);
const anonymousObservable = observable("Value of an anonymous observable");

describe("storeObservableInCache", () => {
  beforeEach(() => {
    // Make sure other tests doesn't have registered references
    global.__dependable._references.clear();
    global.__dependable._initial.clear();
  });

  it("stores observables with plain values", () => {
    const cache = {};
    storeObservableInCache(nullObservable, cache);
    storeObservableInCache(falseObservable, cache);
    storeObservableInCache(arrayObservable, cache);
    storeObservableInCache(objectObservable, cache);

    expect(cache, "to equal", {
      null: null,
      false: false,
      array: [0, 1, 2],
      object: { zero: 0, one: 1, two: 2 },
    });
  });

  it("values with nested observables", () => {
    const mainObservable = observable(
      {
        plainValue: 42,
        nestedArray: [nullObservable, falseObservable],
        nestedObject: {
          array: arrayObservable,
          object: objectObservable,
          anonymous: anonymousObservable,
        },
        anonymous: {
          anonymousObservable,
          nested: observable(anonymousObservable),
        },
      },
      { id: "main" }
    );

    const cache = {};

    storeObservableInCache(mainObservable, cache);

    expect(cache, "to equal", {
      null: null,
      false: false,
      array: [0, 1, 2],
      object: { zero: 0, one: 1, two: 2 },
      anonymous$0: "Value of an anonymous observable",
      anonymous$1: { $reference: "anonymous$0" },
      main: {
        plainValue: 42,
        nestedArray: [{ $reference: "null" }, { $reference: "false" }],
        nestedObject: {
          array: { $reference: "array" },
          object: { $reference: "object" },
          anonymous: { $reference: "anonymous$0" },
        },
        anonymous: {
          anonymousObservable: { $reference: "anonymous$0" },
          nested: { $reference: "anonymous$1" },
        },
      },
    });
  });
});
