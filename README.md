# first-event
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
// below does nothing, bc it happenned second
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
// below does nothing, bc it happenned second
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
// below does nothing, bc it happenned second
ee.emit('bar', 1)
```
### Cancel
```js
var first = require('first-event')
var ee = new EventEmitter()
var eventPromise = first(ee, ['error', 'foo', 'bar'])

eventPromise
  .then(function (data) {
    // never happens, bc event handlers were cancelled below
  }).catch(function () {
    // never happens, bc event handlers were cancelled below
  })

// cancel and cleanup event handlers
eventPromise.cancel()
// below will do nothing, bc the event handlers were removed
ee.emit('foo', 1)
```

# License
MIT