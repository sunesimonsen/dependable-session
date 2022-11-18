import unexpected from "unexpected";
import unexpectedDependable from "unexpected-dependable";
import { observable } from "@dependable/state";

import { observablesFromSnapshot } from "../src/observablesFromSnapshot.js";

const expect = unexpected.clone().use(unexpectedDependable);

const nullObservable = observable(null, { id: "null" });
const falseObservable = observable(false, { id: "false" });
const arrayObservable = observable([0, 1, 2], { id: "array" });
const objectObservable = observable(
  { zero: 0, one: 1, two: 2 },
  { id: "object" }
);
const anonymousObservable = observable("Value of an anonymous observable");

const snapshot = {
  nextId: 42,
  observables: {
    null: null,
    false: false,
    array: [0, 1, 2],
    object: { zero: 0, one: 1, two: 2 },
    $0: "Value of an anonymous observable",
    $1: { $reference: "$0" },
    main: {
      plainValue: 42,
      nestedArray: [{ $reference: "null" }, { $reference: "false" }],
      nestedObject: {
        array: { $reference: "array" },
        object: { $reference: "object" },
        anonymous: { $reference: "$0" },
      },
      anonymous: {
        anonymousObservable: { $reference: "$0" },
        nested: { $reference: "$1" },
      },
    },
  },
};

describe("observablesFromSnapshot", () => {
  let state;

  beforeEach(() => {
    // Make sure other tests doesn't have registered references
    global.__dependable._references.clear();
    global.__dependable._initial.clear();

    state = observablesFromSnapshot(snapshot);
  });

  it("returns state corresponding to the cache", () => {
    expect(state, "to satisfy", {
      null: nullObservable,
      false: falseObservable,
      array: arrayObservable,
      object: objectObservable,
      main: {
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
    });
  });

  it("makes new observables initialize from the restored cache", () => {
    const main = observable("initial value will be overriden", { id: "main" });

    expect(main, "to satisfy", {
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
    });
  });
});
