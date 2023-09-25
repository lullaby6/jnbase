const jnbase = require('./index.js');

jnbase.create('users')

jnbase.data.add('users', {nombre: "XD"})
jnbase.data.add('users', {nombre: "XD"})
jnbase.data.remove('users', {nombre: "XD"})

console.log(jnbase.get('users'));