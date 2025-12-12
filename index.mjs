import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JSON_FILE_PATH = join(__dirname, 'jnbase.json');

class Mutex {
    constructor() {
        this._queue = [];
        this._locked = false;
    }

    lock() {
        return new Promise((resolve) => {
            if (this._locked) {
                this._queue.push(resolve);
            } else {
                this._locked = true;
                resolve();
            }
        });
    }

    release() {
        if (this._queue.length > 0) {
            const resolve = this._queue.shift();
            resolve();
        } else {
            this._locked = false;
        }
    }
}

const dbLock = new Mutex();

let dbCache = null;

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

async function loadCache() {
    if (dbCache !== null) return dbCache;

    try {
        const fileContent = await fs.readFile(JSON_FILE_PATH, 'utf-8');
        dbCache = JSON.parse(fileContent);
    } catch (error) {
        if (error.code === 'ENOENT') {
            dbCache = {};
            await saveCache();
        } else {
            throw error;
        }
    }

    return dbCache;
}

async function saveCache() {
    if (dbCache === null) return;

    const tempPath = `${JSON_FILE_PATH}.tmp`;

    await fs.writeFile(tempPath, JSON.stringify(dbCache, null, 4));

    await fs.rename(tempPath, JSON_FILE_PATH);
}

async function executeWrite(operation) {
    await dbLock.lock();

    try {
        await loadCache();
        const result = await operation(dbCache);
        if (result !== false) {
            await saveCache();
        }
        return result;
    } finally {
        dbLock.release();
    }
}

export async function getJsonData() {
    await loadCache();

    return dbCache;
}

export async function setJsonData(jsonData) {
    await executeWrite((cache) => {
        for (const key in cache) delete cache[key];

        Object.assign(cache, jsonData);
    });
}

export async function getKeyData(key) {
    const data = await getJsonData();

    return data[key];
}

export async function hasKey(key) {
    const data = await getJsonData();

    return key in data;
}

export async function createKey(key) {
    await executeWrite((cache) => {
        if (key in cache) return false;

        cache[key] = [];
    });
}

export async function setKeyData(key, value) {
    await executeWrite((cache) => {
        if (!(key in cache)) throw new Error(`${key} key not found`);

        cache[key] = value;
    });
}

export async function renameKey(key, newKey) {
    await executeWrite((cache) => {
        if (!(key in cache)) throw new Error(`${key} key not found`);

        cache[newKey] = cache[key];

        delete cache[key];
    });
}

export async function deleteKey(key) {
    await executeWrite((cache) => {
        if (!(key in cache)) throw new Error(`${key} key not found`);

        delete cache[key];
    });
}

export async function clearKeyData(key) {
    await executeWrite((cache) => {
        if (!(key in cache)) throw new Error(`${key} key not found`);

        cache[key] = [];
    });
}

export async function getDataById(key, id) {
    const data = await getJsonData();

    if (!(key in data)) throw new Error(`${key} key not found`);

    return data[key].find(item => item.id === id);
}

export async function getDataByObject(key, condition) {
    const data = await getJsonData();

    if (!(key in data)) throw new Error(`${key} key not found`);

    const keys = Object.keys(condition);
    const values = Object.values(condition);

    return data[key].filter(obj => {
        return keys.every((k, i) => obj[k] === values[i]);
    });
}

export async function createData(key, data) {
    await executeWrite((cache) => {
        if (!(key in cache)) throw new Error(`${key} not found`);

        if ('id' in data) {
            if (cache[key].some(item => item.id === data.id)) {
                throw new Error(`Item with id ${data.id} already exists in ${key}`);
            }
        } else {
            data['id'] = uuidv4();
        }
        cache[key].push(data);
    });
}

export async function createMultipleData(key, dataList) {
    await executeWrite((cache) => {
        if (!(key in cache)) throw new Error(`${key} not found`);

        for (const data of dataList) {
            if ('id' in data) {
                if (cache[key].some(item => item.id === data.id)) {
                    throw new Error(`Item with id ${data.id} already exists in ${key}`);
                }
            } else {
                data['id'] = uuidv4();
            }

            cache[key].push(data);
        }
    });
}

export async function hasDataById(key, id) {
    const data = await getJsonData();

    if (!(key in data)) throw new Error(`${key} key not found`);

    return data[key].some(item => item.id === id);
}

export async function hasDataByObject(key, condition) {
    const results = await getDataByObject(key, condition);

    return results.length > 0;
}

export async function updateDataById(key, id, newData) {
    return await executeWrite((cache) => {
        if (!(key in cache)) throw new Error(`${key} key not found`);

        const index = cache[key].findIndex(item => item.id === id);

        if (index !== -1) {
            cache[key][index] = { ...cache[key][index], ...newData };
            return true;
        }

        return false;
    });
}

export async function updateDataByObject(key, condition, newData) {
    return await executeWrite((cache) => {
        if (!(key in cache)) throw new Error(`${key} key not found`);

        const keys = Object.keys(condition);
        const values = Object.values(condition);
        let updatedCount = 0;

        cache[key].forEach((obj, index) => {
            const pass = keys.every((k, i) => obj[k] === values[i]);
            if (pass) {
                cache[key][index] = { ...cache[key][index], ...newData };
                updatedCount++;
            }
        });

        return updatedCount > 0 ? updatedCount : false;
    });
}

export async function deleteDataById(key, id) {
    return await executeWrite((cache) => {
        if (!(key in cache)) throw new Error(`${key} key not found`);

        const initialLength = cache[key].length;
        cache[key] = cache[key].filter(item => item.id !== id);

        return cache[key].length !== initialLength;
    });
}

export async function deleteDataByObject(key, condition) {
    return await executeWrite((cache) => {
        if (!(key in cache)) throw new Error(`${key} key not found`);

        const keys = Object.keys(condition);
        const values = Object.values(condition);
        const initialLength = cache[key].length;

        cache[key] = cache[key].filter(obj => {
            return !keys.every((k, i) => obj[k] === values[i]);
        });

        return cache[key].length !== initialLength;
    });
}