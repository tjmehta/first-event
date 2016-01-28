# first-event [![Build Status](https://travis-ci.org/tjmehta/first-event.svg?branch=master)](https://travis-ci.org/tjmehta/first-event) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
Race event-emitter events, resolves the first to occur. Promise-based [ee-first](https://github.com/jonathanong/ee-first)

# Installation
```js
npm install --save first-event
```

# Usage
#### Error Example
```js
var first = require('first-event')
var ee = new EventEmitter()

first(ee, ['error', 'foo', 'bar'])
  .catch(function (err) {
    // error from emit 'error' gets sent here
    console.log(err) // [ Error: 'boom' ]
  })

ee.emit('error', new Error('boom'))
// below does nothing, because 'foo' event emitted after 'error' event and first-event ignores all
// events after the first event.
ee.emit('foo', 1)
```
#### Event Example
```js
var first = require('first-event')
var ee = new EventEmitter()

first(ee, ['error', 'foo', 'bar'])
  .then(function (firstEvent) {
    console.log(firstEvent.ee)    // [ EventEmitter: ... ]
    console.log(firstEvent.event) // 'foo'
    console.log(firstEvent.args)  // [ 'one', 'two', 'three' ]
  })

ee.emit('foo', 'one', 'two', 'three')
// below does nothing, because 'bar' event emitted after 'foo' event and first-event ignores all
// events after the first event.
ee.emit('bar', 1)
```
#### Race Events from different EventEmitters
```js
var first = require('first-event')
var ee = new EventEmitter()
var ee2 = new EventEmitter()

Promise.race(
  first(ee, ['error', 'foo', 'bar'])
  first(ee2, ['error', 'foo', 'bar'])
).then(function (firstEvent) {
  console.log(firstEvent.ee)    // [ EventEmitter: ... ] === ee2
  console.log(firstEvent.event) // 'foo'
  console.log(firstEvent.args)  // [ 'one', 'two', 'three' ]
})

ee2.emit('foo', 'one', 'two', 'three')
// below does nothing, because 'bar' event emitted after 'foo' event and first-event ignores all
// events after the first event.
ee.emit('bar', 1)
```
### Cancel
```js
var first = require('first-event')
var ee = new EventEmitter()
var eventPromise = first(ee, ['error', 'foo', 'bar'])

eventPromise
  .then(function (data) {
    // never happens, because event handlers are cancelled below
  }).catch(function () {
    // never happens, because event handlers are cancelled below
  })

// cancel and cleanup event handlers
eventPromise.cancel()
// below will do nothing, bc the event handlers were removed
ee.emit('foo', 1)
```

# License
MIT
