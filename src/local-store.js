import {initialState} from './data.js';
import {applyAction} from './actions.js';

export const STORAGE_KEY = 'tavola-household-v1';
const CHANGE_EVENT = 'tavola-data-change';

export function readLocalState() {
  const content = localStorage.getItem(STORAGE_KEY);
  if (content) {
    try {return JSON.parse(content);}
    catch {throw new Error('I dati salvati non sono leggibili. Puoi ripristinare una copia dalle impostazioni.');}
  }
  const state = initialState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export async function localAction(action) {
  const update = () => {
    const state = applyAction(readLocalState(), action);
    try {localStorage.setItem(STORAGE_KEY, JSON.stringify(state));}
    catch {throw new Error('Non riesco a salvare sul dispositivo. Controlla lo spazio disponibile o le impostazioni del browser.');}
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return state;
  };
  return navigator.locks ? navigator.locks.request(STORAGE_KEY, update) : update();
}

export function subscribeLocalState(callback) {
  const onStorage = e => {if (e.key === STORAGE_KEY) callback();};
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {window.removeEventListener('storage', onStorage); window.removeEventListener(CHANGE_EVENT, callback);};
}
