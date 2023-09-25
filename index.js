const fs = require('fs');
const {join} = require('path')

const DB_PATH = join(__dirname, 'db.json')

if(!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '{}');

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function get(key = null){
    const content = require(DB_PATH);

    if(!key) return content
    else return content[key]
}
function create(key){
    const content = require(DB_PATH);

    if(!(key in content)) {
        content[key] = []

        fs.writeFileSync(DB_PATH, JSON.stringify(content));
    }
}

function set(content){
    fs.writeFileSync(DB_PATH, JSON.stringify(content));
}

function remove(key){
    const content = require(DB_PATH);

    if(key in content) {
        delete content[key]

        fs.writeFileSync(DB_PATH, JSON.stringify(content));
    }
}

const data = {
    add: (key, newData) => {
        const content = require(DB_PATH);

        if(!('id' in newData)) newData['id'] = uuidv4();
        content[key].push(newData)

        fs.writeFileSync(DB_PATH, JSON.stringify(content));
    },
    addMultiple: (key, newDataList) => {
        const content = require(DB_PATH);

        newDataList.forEach(newData => {
            if(!('id' in newData)) newData['id'] = uuidv4();
            content[key].push(newData)
        })

        fs.writeFileSync(DB_PATH, JSON.stringify(content));
    },
    get: (key, condition) => {
        const content = require(DB_PATH);

        const keys = Object.keys(condition)
        const values = Object.values(condition)
        const results = []

        content[key].forEach(obj => {
            let pass = 0
            keys.forEach((keyI, i) => {
                if(obj[keyI] === values[i]) pass++
            })
            if(pass === keys.length) results.push(obj)
        })

        return results
    },
    update: (key, condition, newData) => {
        const content = require(DB_PATH);

        const keys = Object.keys(condition)
        const values = Object.values(condition)
        const indexs = []

        content[key].forEach((obj, objI) => {
            let pass = 0
            keys.forEach((keyI, i) => {
                if(obj[keyI] === values[i]) pass++
            })
            if(pass === keys.length) indexs.push(objI)
        })

        const arrayCopy = Array.from(content[key])

        indexs.forEach(i => {
            arrayCopy[i] = {...arrayCopy[i], ...newData}
        })

        content[key] = arrayCopy

        fs.writeFileSync(DB_PATH, JSON.stringify(content));
    },
    remove: (key, condition) => {
        const content = require(DB_PATH);

        const keys = Object.keys(condition)
        const values = Object.values(condition)
        const indexs = []

        content[key].forEach((obj, objI) => {
            let pass = 0
            keys.forEach((keyI, i) => {
                if(obj[keyI] === values[i]) pass++
            })
            if(pass === keys.length) indexs.push(objI)
        })

        const arrayCopy = Array.from(content[key])

        // indexs.forEach(i => arrayCopy.splice(i, 1))
        for (let i = indexs.length -1; i >= 0; i--)
            arrayCopy.splice(indexs[i], 1);

        content[key] = arrayCopy

        fs.writeFileSync(DB_PATH, JSON.stringify(content));
    },
}

module.exports = {
    get,
    create,
    set,
    remove,
    data
}