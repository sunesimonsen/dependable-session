import unexpected from "unexpected";
import unexpectedDependable from "unexpected-dependable";
import unexpectedSinon from "unexpected-sinon";
import sinon from "sinon";
import { observable, flush } from "@dependable/state";

import {
  saveSession,
  restoreSession,
  createSnapshot,
  restoreSnapshot,
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

describe("saveSession", () => {
  beforeEach(() => {
    // Make sure other tests doesn't have registered references
    global.__dependable.nextId = 0;
    global.__dependable._references.clear();
    global.__dependable._initial.clear();

    global.sessionStorage = new SessionStorage();

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
    // Make sure other tests doesn't have registered references
    global.__dependable.nextId = 0;
    global.__dependable._references.clear();
    global.__dependable._initial.clear();

    global.sessionStorage = new SessionStorage();

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
  beforeEach(() => {
    // Make sure other tests doesn't have registered references
    global.__dependable.nextId = 0;
    global.__dependable._references.clear();
    global.__dependable._initial.clear();

    global.sessionStorage = new SessionStorage();
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
    // Make sure other tests doesn't have registered references
    global.__dependable.nextId = 14;
    global.__dependable._references.clear();
    global.__dependable._initial.clear();

    const textObservable = observable("Hello session", { id: "text" });
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
    // Make sure other tests doesn't have registered references
    global.__dependable.nextId = 0;
    global.__dependable._references.clear();
    global.__dependable._initial.clear();

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
