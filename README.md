# JNBase

JNBase is a simple and lightweight and asynchronous file-based JSON database. It features in-memory caching, atomic writes to prevent data corruption, and Mutex locking to ensure concurrency safety.

## Installation

### NPM

```bash
npm i jnbase
```

### Import

#### CommonJS

```js
const { createData, getDataById } = require("jnbase");
```

#### ModuleJS

```js
import { createData, getDataById } from "jnbase";
```

## Usage

```js
const {
	createKey,
	createData,
	getDataByObject,
	updateDataById,
	deleteDataById,
} = require("jnbase");

(async () => {
	await createKey("users");

	await createData("users", {
		name: "Alice",
		age: 25,
		role: "admin",
	});

	const users = await getDataByObject("users", {
		name: "Alice",
	});

	const user = users[0];

	console.log(user);

	await updateDataById("users", user.id, {
		age: 26,
	});

	await deleteDataById("users", user.id);
})();
```

## API

| Method               | Description                                                                         | Parameters                                               | Returns                      |
| -------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------- |
| `createKey`          | Creates a new empty array for a key if it does not exist.                           | `key` (string)                                           | `Promise<void>`              |
| `getKeyData`         | Retrieves all data associated with a key.                                           | `key` (string)                                           | `Promise<Array>`             |
| `setKeyData`         | Overwrites all data for a specific key.                                             | `key` (string), `value` (array)                          | `Promise<void>`              |
| `renameKey`          | Renames an existing key.                                                            | `key` (string), `newKey` (string)                        | `Promise<void>`              |
| `deleteKey`          | Deletes a key and all its data.                                                     | `key` (string)                                           | `Promise<void>`              |
| `clearKeyData`       | Empties the array for a specific key.                                               | `key` (string)                                           | `Promise<void>`              |
| `createData`         | Adds a new object to a key array. Generates UUID if missing. Checks for duplicates. | `key` (string), `data` (object)                          | `Promise<void>`              |
| `createMultipleData` | Adds multiple objects to a key array efficiently.                                   | `key` (string), `dataList` (array)                       | `Promise<void>`              |
| `getDataById`        | Retrieves a specific item by its ID.                                                | `key` (string), `id` (string)                            | `Promise<Object, undefined>` |
| `getDataByObject`    | Retrieves items matching a specific set of key-value pairs.                         | `key` (string), `condition` (object)                     | `Promise<Array>`             |
| `updateDataById`     | Updates fields of an item identified by ID.                                         | `key` (string), `id` (string), `newData` (object)        | `Promise<boolean>`           |
| `updateDataByObject` | Updates items matching a condition.                                                 | `key` (string), `condition` (object), `newData` (object) | `Promise<number>`            |
| `deleteDataById`     | Removes an item by its ID.                                                          | `key` (string), `id` (string)                            | `Promise<boolean>`           |
| `deleteDataByObject` | Removes items matching a condition.                                                 | `key` (string), `condition` (object)                     | `Promise<boolean>`           |
| `hasDataById`        | Checks if an item with the given ID exists.                                         | `key` (string), `id` (string)                            | `Promise<boolean>`           |
| `hasDataByObject`    | Checks if any item matches the condition.                                           | `key` (string), `condition` (object)                     | `Promise<boolean>`           |
| `getJsonData`        | Returns the entire database object from memory.                                     | None                                                     | `Promise<Object>`            |
| `setJsonData`        | Replaces the entire database. Use with caution.                                     | `jsonData` (object)                                      | `Promise<void>`              |

## License

-   [MIT](https://github.com/lullaby6/jnbase/blob/main/LICENSE)
