import {set, get, getMany} from 'idb-keyval';

let localState = {};

export function getState(key) {
  if (key in localState) {
    return Promise.resolve(localState[key]);
  }

  return get(key).then((x) => {
    localState[key] = x;
    return x;
  });
}

export async function setState(key, value) {
  const savedKeys = await get('ue-pb-saved-keys');
  localState[key] = value;
  let success = true;
  set(key, value)
    .catch((e) => {
      success = false;
    })
    .then(() => {
      const newKeys = Array.from(new Set([...(savedKeys || []), key]));
      set('ue-pb-saved-keys', newKeys);
    });
}

const zip = (a, b) => a.map((k, i) => [k, b[i]]);

export async function materializeState() {
  const keys = await get('ue-pb-saved-keys').then((x) => x || []);
  const result = await getMany(keys);
  return Object.fromEntries(zip(keys, result));
}
