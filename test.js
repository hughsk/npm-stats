/* global describe, it */

var npmStats = require('./')
var expect = require('chai').expect

require('tap').mochaGlobals()
require('chai').should()

describe('npm-stats', function () {
  describe('module', function () {
    it('info() fetches info for module', function (done) {
      npmStats().module('lodash').info(function (err, lodash) {
        expect(err).to.equal(null)
        lodash.name.should.equal('lodash')
        return done()
      })
    })
  })

  describe('user', function () {
    it('count() fetches count of npm modules', function (done) {
      npmStats().user('bcoe').count(function (err, count) {
        expect(err).to.equal(null)
        count.should.be.gt(0)
        return done()
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
