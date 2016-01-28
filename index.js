var EventEmitter = require('events').EventEmitter

var assertArgs = require('assert-args')
var isString = require('101/is-string')

module.exports = firstEvent

/**
 * Race event-emitter events, yield the first to occur
 * Supports Promises and Node callback style
 * @param  {EventEmitter} ee - event emitter
 * @param  {Array} events - events to race
 * @return {Promise}
 *   resolves { ee:ee, event: event, args: [...] } on first event
 *   rejects w/ err if event is "error"
 *   promise has a special method "cancel", call this to cancel the promise
 */
function firstEvent (ee, events) {
  var args = assertArgs(arguments, {
    'ee': EventEmitter,
    'events': 'array'
  })
  ee = args.ee
  events = args.events
  if (!events.every(isString)) {
    throw new TypeError('"events" must be an array of strings')
  }
  var handlers = {}
  var promise = new Promise(function (resolve, reject) {
    events.forEach(function (event) {
      handlers[event] = createHandler(ee, event)
      ee.on(event, handlers[event])
    })
    /**
     * create an event handler
     * @param  {EventEmitter} ee - event emitter which handler belongs
     * @param  {String} event - event which handler is being attached
     * @return {Function} event handlers
     */
    function createHandler (ee, event) {
      return function (/* ...args */) {
        removeListeners(ee, handlers)
        // if event is "error", reject(err)
        if (event === 'error') {
          return reject(arguments[0])
        }
        // event is not "error", resolve w/ event info
        resolve({
          ee: ee,
          event: event,
          args: Array.prototype.slice.call(arguments)
        })
      }
    }
  })

  promise.cancel = function () {
    removeListeners(ee, handlers)
  }

  return promise
}
/**
 * remove all listeners
 * @param  {EventEmitter} ee - event emitter
 * @param  {Object} handlers - handlers map, ex: { '<event>': function handler () {...} ... }
 */
function removeListeners (ee, handlers) {
  // remove allListeners
  Object.keys(handlers).forEach(function (event) {
    ee.removeListener(event, handlers[event])
    delete handlers[event]
  })
}
