/* global describe, it */

var npmStats = require('./')
var expect = require('chai').expect
var moment = require('moment')

require('tap').mochaGlobals()
require('chai').should()

describe('npm-stats', function () {
  describe('registry', function () {
    describe('listByDate()', function () {
      it('returns modules published before a given date', function (done) {
        npmStats().listByDate({since: moment().subtract(1, 'hour').toDate()}, function (err, packages) {
          expect(err).to.equal(null)
          packages.length.should.be.gt(0)
          return done()
        })
      })
    })
  })

  describe('keyword', function () {
    describe('count()', function () {
      it('returns count of modules using keyword', function (done) {
        npmStats().keyword('foobar').count(function (err, count) {
          expect(err).to.equal(null)
          count.should.be.gt(0)
          return done()
        })
      })
    })
  })

  describe('module', function () {
    describe('info()', function () {
      it('fetches info for module', function (done) {
        npmStats().module('lodash').info(function (err, lodash) {
          expect(err).to.equal(null)
          lodash.name.should.equal('lodash')
          return done()
        })
      })
    })

    describe('downloads()', function () {
      it('returns download counts for a given module', function (done) {
        npmStats().module('lodash').downloads(function (err, downloads) {
          expect(err).to.equal(null)
          downloads[0].value.should.be.gt(0)
          return done()
        })
      })
    })

    describe('size()', function () {
      it('returns the size of a given module', function (done) {
        npmStats().module('lodash').size(function (err, size) {
          expect(err).to.equal(null)
          size.size.should.be.gt(0)
          return done()
        })
      })
    })
  })

  describe('user', function () {
    describe('count()', function () {
      it('fetches count of npm modules', function (done) {
        npmStats().user('bcoe').count(function (err, count) {
          expect(err).to.equal(null)
          count.should.be.gt(0)
          return done()
        })
      })
    })
  })

  describe('configuration', function () {
    it('allows registry URL to be overridden', function (done) {
      npmStats('https://registry.npmjs.org', {modules: ''}).module('lodash').info(function (err, lodash) {
        expect(err).to.equal(null)
        lodash.name.should.equal('lodash')
        return done()
      })
    })

    it('allows registry URL to be overridden with configuration object', function (done) {
      npmStats({
        modules: '',
        registry: 'https://registry.npmjs.org'
      }).module('lodash').info(function (err, lodash) {
        expect(err).to.equal(null)
        lodash.name.should.equal('lodash')
        return done()
      })
    })
  })
})
