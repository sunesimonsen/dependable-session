import unexpected from "unexpected";
import unexpectedDependable from "unexpected-dependable";
import unexpectedSinon from "unexpected-sinon";
import sinon from "sinon";
import { observable, flush } from "@dependable/state";
import clone from "just-clone";

import {
  applySnapshotDiff,
  createSnapshot,
  diffSnapshots,
  restoreSession,
  restoreSnapshot,
  saveSession,
} from "../src/session.js";

const expect = unexpected
  .clone()
  .use(unexpectedSinon)
  .use(unexpectedDependable);

class SessionStorage {
  constructor() {
    this.data = new Map();
  }

  setItem(key, value) {
    this.data.set(key, value);
  }

  getItem(key) {
    return this.data.get(key);
  }

  removeItem(key) {
    this.data.delete(key);
  }
}

beforeEach(() => {
  global.sessionStorage = new SessionStorage();

  // Make sure other tests doesn't have registered references
  global.__dependable._references.clear();
  global.__dependable._initial.clear();
});

describe("saveSession", () => {
  beforeEach(() => {
    const textObservable = observable("Hello session", { id: "text" });
    const arrayObservable = observable([0, 1, 2], { id: "array" });

    saveSession();
  });

  it("stores the state in session store", () => {
    expect(
      sessionStorage.getItem("@dependable/session"),
      "to equal",
      JSON.stringify({
        nextId: 0,
        observables: {
          array: [0, 1, 2],
          text: "Hello session",
        },
      })
    );
  });
});

describe("restoreSession", () => {
  beforeEach(() => {
    sessionStorage.setItem(
      "@dependable/session",
      JSON.stringify({
        nextId: 0,
        observables: {
          text: "Hello session",
          array: [0, 1, 2],
        },
      })
    );

    restoreSession();
  });

  it("initializes restored observables", () => {
    const text = observable("will be override", { id: "text" });

    expect(text, "to satisfy", "Hello session");
  });

  it("reuses observables with the same id", () => {
    const reference0 = observable("will be override", { id: "text" });
    const reference1 = observable("will be override", { id: "text" });

    expect(reference0, "to be", reference1);
  });

  describe("with a non-existing session", () => {
    it("throws an error", () => {
      expect(
        () => {
          restoreSession();
        },
        "to throw",
        "No session to restore"
      );
    });
  });

  describe("with a valid session", () => {
    beforeEach(() => {
      sessionStorage.setItem(
        "@dependable/session",
        JSON.stringify({
          nextId: 0,
          observables: {
            text: "Hello session",
            array: [0, 1, 2],
          },
        })
      );

      restoreSession();
    });

    it("initializes restored observables", () => {
      const text = observable("will be override", { id: "text" });

      expect(text, "to satisfy", "Hello session");
    });

    it("reuses observables with the same id", () => {
      const reference0 = observable("will be override", { id: "text" });
      const reference1 = observable("will be override", { id: "text" });

      expect(reference0, "to be", reference1);
    });

    it("removes the stored session", () => {
      expect(sessionStorage.getItem("@dependable/session"), "to be undefined");
    });
  });
});

describe("createSnapshot", () => {
  beforeEach(() => {
    const textObservable = observable("Hello session", { id: "text" });
    const noRestore = observable("Don't restore");
    const arrayObservable = observable([0, 1, 2], { id: "array" });
  });

  it("stores the state in session store", () => {
    expect(createSnapshot(), "to equal", {
      nextId: 0,
      observables: {
        text: "Hello session",
        array: [0, 1, 2],
      },
    });
  });
});

describe("restoreSnapshot", () => {
  beforeEach(() => {
    restoreSnapshot({
      nextId: 0,
      observables: {
        text: "Hello session",
        array: [0, 1, 2],
      },
    });
  });

  it("initializes the next id", () => {});

  it("initializes restored observables", () => {
    const text = observable("will be override", { id: "text" });

    expect(text, "to satisfy", "Hello session");
  });

  it("reuses observables with the same id", () => {
    const reference0 = observable("will be override", { id: "text" });
    const reference1 = observable("will be override", { id: "text" });

    expect(reference0, "to be", reference1);
  });
});

describe("diffSnapshots and applySnapshotDiff", () => {
  const current = {
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
  };

  let updated;

  beforeEach(() => {
    updated = clone(current);

    updated.$0 = "Updated anonymous observable";
    updated.newObservable = "New observable";
    updated.main.nestedObject.added = {
      $reference: "newObservable",
    };
    delete updated.$1;
    delete updated.main.anonymous.anonymousObservable;
  });

  it("deepEqual(b, applySnapshotDiff(a, diffSnapshots(a, b))", () => {
    const patch = diffSnapshots(current, updated);
    const result = applySnapshotDiff(current, patch);

    expect(updated, "to equal", result);
  });
});
