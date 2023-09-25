# jbase

Manipulates json files easily for use as lightweight databases.

# Installation

```sh
npm install jnbase
```

# Usage

```js
const jnbase = require('jnbase');

//creating 'users' key/table
jnbase.create('users')

//adding users
jnbase.obj.add('users', {username: 'lullaby6'});
jnbase.obj.add('users', {username: 'Elon Musk'});

//updating user
jnbase.obj.update('users', {username: 'lullaby6'}, {username: 'Lullbay'});

//removing user
jnbase.obj.remove('users', {username: 'Elon Musk'});

//get user id
console.log(jnbase.obj.get('users', {username: 'Lullaby'})[0].id)
```