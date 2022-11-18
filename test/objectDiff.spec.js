import { createPatch, applyPatch } from "../src/objectDiff.js";
import expect from "unexpected";

const examples = [
  { current: {}, next: {}, patch: { u: {}, d: "$del" } },
  { current: {}, next: { a: "a" }, patch: { u: { a: "a" }, d: "$del" } },
  {
    current: { a: "a" },
    next: { a: "a", b: "b" },
    patch: { u: { b: "b" }, d: "$del" },
  },
  {
    current: { a: "a", b: "b" },
    next: { a: "a", c: "c" },
    patch: { u: { b: "$del", c: "c" }, d: "$del" },
  },
  {
    current: { a: { "a.a": "a.a", "a.b": "a.b" }, b: "b" },
    next: { a: { "a.a": "a.a", "a.c": "a.c" }, b: "updated" },
    patch: {
      u: { a: { "a.b": "$del", "a.c": "a.c" }, b: "updated" },
      d: "$del",
    },
  },
  {
    current: { a: "a", b: "b", d: "d", e: "e" },
    next: { a: "$del", b: "$del0", c: "$del1", d: "d" },
    patch: {
      u: { a: "$del", b: "$del0", c: "$del1", e: "$del2" },
      d: "$del2",
    },
  },
  {
    current: { a: ["a", "b", "c"] },
    next: { a: ["a", "c"] },
    patch: { u: { a: ["a", "c"] }, d: "$del" },
  },
  {
    current: { a: ["a", "c"] },
    next: { a: ["a", "b", "c"] },
    patch: { u: { a: ["a", "b", "c"] }, d: "$del" },
  },
  {
    current: { a: ["a", "c"] },
    next: { a: "overridden" },
    patch: { u: { a: "overridden" }, d: "$del" },
  },
  {
    current: { a: "initial" },
    next: { a: { b: "b" } },
    patch: { u: { a: { b: "b" } }, d: "$del" },
  },
  {
    current: { a: "initial" },
    next: { a: ["b"] },
    patch: { u: { a: ["b"] }, d: "$del" },
  },
  {
    current: { a: ["a", { a: { "a.a": "a.a", "a.b": "a.b" }, b: "b" }, "c"] },
    next: { a: ["a", { a: { "a.a": "a.a", "a.c": "a.c" }, b: "updated" }] },
    patch: {
      u: { a: ["a", { a: { "a.b": "$del", "a.c": "a.c" }, b: "updated" }] },
      d: "$del",
    },
  },
  {
    current: { a: ["a", { a: { "a.a": "a.a", "a.c": "a.c" }, b: "b" }, "c"] },
    next: { a: ["a", { a: { "a.a": "a.a", "a.c": "a.c" }, b: "b" }] },
    patch: {
      u: {
        a: ["a", {}],
      },
      d: "$del",
    },
  },
  {
    current: { a: ["a", "b", "c"] },
    next: { a: ["a", "b", "c"] },
    patch: {
      u: {},
      d: "$del",
    },
  },
];

describe("createPatch", () => {
  it("creates a valid patch for any JSON object", () => {
    examples.forEach((example) => {
      expect(
        createPatch(example.current, example.next),
        "to equal",
        example.patch
      );
    });
  });
});

describe("applyPatch", () => {
  it("applies a valid patch for any JSON object", () => {
    examples.forEach((example) => {
      expect(
        applyPatch(example.current, example.patch),
        "to equal",
        example.next
      );
    });
  });
});
