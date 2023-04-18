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

export async function switchPage() {
  getState("Page").then(function(result) { 
    if (result == "intro") {
       setState("util")
        return window.location.hash = '#util'
    } else if(result == "util") {
      setState("Page", "feedback") 
      //set state for data and such so It can be called later
      return window.location.hash = '#feedback'
    } else if (result =="feedback") {
      //will have to get state with data here
      setState("Page", "submit")
      return window.location.hash = '#submit'
    } else if (result == "submit") {
      //empty for now
    }
    return result //placeholder
  }) 
 
  };
  //const results = await getState("Page") ^^ Do this above!!!!!