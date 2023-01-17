// eslint-disable-next-line @typescript-eslint/ban-types
export default function omit<Obj extends {}, Keys extends (keyof Obj)[]>(
  object: Obj,
  ...keys: Keys
) {
  return (Object.keys(object) as (keyof Obj)[]).reduce((obj, key) => {
    const keysSet = new Set(keys);
    const currentObj = { ...obj };
    // eslint-disable-next-line no-prototype-builtins
    if (keysSet.has(key)) {
      return currentObj;
    }
    currentObj[key] = object[key];
    return currentObj;
  }, {} as Obj) as Omit<Obj, Keys[number]>;
}
