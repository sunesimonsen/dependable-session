type Brand<K, T> = K & { __brand: T };

export type SessionSnapshot = Brand<object, "SessionSnapshot">;
