import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

const STORAGE_PREFIX = 'takhtabozor:';

export function usePersistedState<T>(
  key: string,
  initialValue: T,
  reviver?: (raw: unknown) => T
): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = STORAGE_PREFIX + key;

  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        return reviver ? reviver(parsed) : (parsed as T);
      }
    } catch {
      // corrupt/unavailable storage: fall back to initial value
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // storage full/unavailable: keep working in-memory
    }
  }, [storageKey, state]);

  return [state, setState];
}
