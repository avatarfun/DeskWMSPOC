export default class Storage {
  constructor(name = new Date().getTime()) {
    this.name = name;
    this.getStorage = this.getStorage.bind(this);
    this.get = this.get.bind(this);
    this.has = this.has.bind(this);
    this.set = this.set.bind(this);
    this.delete = this.delete.bind(this);
  }

  getStorage() {
    return _has(this.name) ? JSON.parse(_getItem(this.name)) : {};
  }

  get(key) {
    const storage = this.getStorage();
    if (storage.hasOwnProperty(key)) {
      return storage[key];
    }
    return null;
  }

  set(key, value) {
    let storage = this.getStorage();
    storage[key] = value;
    return _setItem(this.name, JSON.stringify(storage));
  }

  has(key) {
    return this.getStorage().hasOwnProperty(key);
  }

  delete() {
    return _delete(this.name) && delete this;
  }
}

const _getItem = key => localStorage.getItem(key);
const _setItem = (key, value) => localStorage.setItem(key, value);
const _has = key => localStorage.hasOwnProperty(key);
const _delete = key => delete localStorage[key];
