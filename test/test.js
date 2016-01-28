var EventEmitter = require('events').EventEmitter

var Code = require('code')
var Lab = require('lab')

var first = require('../index')

var expect = Code.expect
var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it

describe('first-event', function () {
  describe('invalid args', function () {
    it('should error if not given string events', function (done) {
      var ee = new EventEmitter()

      expect(function () {
        first(ee, [1, 2, 2])
      }).to.throw('"events" must be an array of strings')

      done()
    })
  })

  it('should resolve the first event', function (done) {
    var event = 'foo'
    var ee = new EventEmitter()

    first(ee, ['foo', 'bar'])
      .then(function (firstEvent) {
        expect(firstEvent.ee).to.equal(ee)
        expect(firstEvent.event).to.equal(event)
        expect(firstEvent.args).to.deep.equal([1, 2, 3])
        done()
      })
      .catch(done)

    ee.emit('foo', 1, 2, 3)
    // should not cause multiple done calls error
    ee.emit('bar', 1, 2, 3)
  })

  it('should reject to error', function (done) {
    var err = new Error('boom')
    var ee = new EventEmitter()

    first(ee, ['error', 'foo', 'bar'])
      .then(function () {
        done(new Error('expected an error'))
      })
      .catch(function (firstErr) {
        expect(firstErr).to.equal(err)
        done()
      })
      .catch(done)

    ee.emit('error', err)
    // should not cause multiple done calls error
    ee.emit('bar', 1, 2, 3)
  })

  it('should cancel', function (done) {
    var ee = new EventEmitter()
    var promise = first(ee, ['foo', 'bar'])

    promise
      .then(function () {
        done(new Error('should not happen 1'))
      })
      .catch(function () {
        done(new Error('should not happen 2'))
      })

    promise.cancel()
    done()
    // should not cause multiple done calls error
    ee.emit('foo', 1, 2, 3)
    ee.emit('bar', 1, 2, 3)
  })
})
