export const deepEqual = (a, b) => {
  if (a === b) return true;

  const aType = typeof a;
  const bType = typeof b;

  if (aType !== bType) return false;

  if (!a || !b) return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }

    return true;
  } else if (aType === "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    for (let i = 0; i < aKeys.length; i++) {
      const key = aKeys[i];
      if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return false;
};
