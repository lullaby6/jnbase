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
jnbase.data.add('users', {username: 'lullaby6'});
jnbase.data.add('users', {username: 'Elon Musk'});

//adding multiple users
jnbase.data.addMultiple('users', [{username: 'marcos15'}, {username: 'Pedro'}]);

//updating user
jnbase.data.update('users', {username: 'lullaby6'}, {username: 'Lullaby'});

//removing user
jnbase.data.remove('users', {username: 'Elon Musk'});

//get user id
console.log(jnbase.data.get('users', {username: 'Lullaby'})[0].id)
```