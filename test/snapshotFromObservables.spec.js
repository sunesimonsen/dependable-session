import unexpected from "unexpected";
import unexpectedDependable from "unexpected-dependable";
import { observable } from "@dependable/state";

import { snapshotFromObservables } from "../src/snapshotFromObservables.js";

const expect = unexpected.clone().use(unexpectedDependable);

describe("snapshotFromObservables", () => {
  let nullObservable,
    falseObservable,
    arrayObservable,
    objectObservable,
    anonymousObservable;

  beforeEach(() => {
    // Make sure other tests doesn't have registered references
    global.__dependable._references.clear();
    global.__dependable._initial.clear();

    nullObservable = observable(null, { id: "null" });
    falseObservable = observable(false, { id: "false" });
    arrayObservable = observable([0, 1, 2], { id: "array" });
    objectObservable = observable(
      { zero: 0, one: 1, two: 2 },
      { id: "object" }
    );

    anonymousObservable = observable("Value of an anonymous observable");
  });

  it("throws when storing values that can't be serialized", () => {
    const functionObservable = observable(() => {}, { id: "function" });

    expect(
      () => {
        snapshotFromObservables([functionObservable]);
      },
      "to throw",
      "Observables can only contain JSON serializable data and other observables"
    );
  });

  it("stores observables with plain values", () => {
    const snapshot = snapshotFromObservables([
      nullObservable,
      falseObservable,
      arrayObservable,
      objectObservable,
    ]);

    expect(snapshot, "to equal", {
      nextId: 0,
      observables: {
        null: null,
        false: false,
        array: [0, 1, 2],
        object: { zero: 0, one: 1, two: 2 },
      },
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

    const snapshot = snapshotFromObservables([mainObservable]);

    expect(snapshot, "to equal", {
      nextId: 2,
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
    });
  });
});
