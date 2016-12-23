import { AsyncStorage } from 'react-native';
export default class Storage {
    static async setItem(key, value) {
        return AsyncStorage.setItem(key,value);
    }
    static async getItem(key) {
        return await AsyncStorage.getItem(key);
    }
    static async removeItem(key) {
        return await AsyncStorage.removeItem(key);
    }
    static async clear() {
        return await AsyncStorage.clear();
    }
}
