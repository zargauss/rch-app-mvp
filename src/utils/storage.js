import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

let mmkv;
if (Platform.OS !== 'web') {
  mmkv = new MMKV();
}

export const storage = {
  getString(key) {
    if (Platform.OS === 'web') {
      const v = window.localStorage.getItem(key);
      return v === null ? undefined : v;
    }
    return mmkv.getString(key);
  },
  set(key, value) {
    if (Platform.OS === 'web') {
      window.localStorage.setItem(key, typeof value === 'string' ? value : String(value));
      return;
    }
    mmkv.set(key, value);
  },
  delete(key) {
    if (Platform.OS === 'web') {
      window.localStorage.removeItem(key);
      return;
    }
    mmkv.delete(key);
  }
};

export default storage;

