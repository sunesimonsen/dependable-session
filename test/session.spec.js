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
  global.__dependable.nextId = 0;
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
        observables: { text: "Hello session", array: [0, 1, 2] },
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
        observables: { text: "Hello session", array: [0, 1, 2] },
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
});

describe("restoreSession", () => {
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
          observables: { text: "Hello session", array: [0, 1, 2] },
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
    global.__dependable.nextId = 14;

    const textObservable = observable("Hello session", { id: "text" });
    const noRestore = observable("Don't restore", {
      id: "dont-restore",
      restore: false,
    });
    const arrayObservable = observable([0, 1, 2], { id: "array" });
  });

  it("stores the state in session store", () => {
    expect(createSnapshot(), "to equal", {
      nextId: 14,
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
      nextId: 42,
      observables: { text: "Hello session", array: [0, 1, 2] },
    });
  });

  it("initializes the next id", () => {
    global.__dependable.nextId = 42;
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
});

describe("diffSnapshots and applySnapshotDiff", () => {
  const current = {
    nextId: 3,
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

  let updated;

  beforeEach(() => {
    updated = clone(current);
    updated.nextId = current.nextId + 1;

    updated.observables.$0 = "Updated anonymous observable";
    updated.observables.newObservable = "New observable";
    updated.observables.main.nestedObject.added = {
      $reference: "newObservable",
    };
    delete updated.observables.$1;
    delete updated.observables.main.anonymous.anonymousObservable;
  });

  it("deepEqual(b, applySnapshotDiff(a, diffSnapshots(a, b))", () => {
    const diff = diffSnapshots(current, updated);
    const result = applySnapshotDiff(current, diff);

    expect(updated, "to equal", result);
  });
});
