var es = require('event-stream')
  , reducestream = require('stream-reduce')
  , jsonstream = require('JSONStream')
  , merge = require('lodash.merge')

function passthrough(data) {
  return data
}

module.exports = exports = stats

// pristine copy of default options
var DEFAULTS = {
    registry: 'https://skimdb.npmjs.com/',
    modules: 'registry',
    // https://api.npmjs.org/downloads/ :detail=(point|range) / :period=(last-month|last-week|last-day|YYYY-MM-DD:YYYY-MM-DD) / :package?
    downloads: 'https://api.npmjs.org/downloads',
    users: 'public_users',
    dirty: false
}

// inherit to ensure original defaults peek through if keys get deleted
var GLOBAL_DEFAULTS = merge(Object.create(DEFAULTS), DEFAULTS)

exports.defaults = function(defaults){
  return merge(GLOBAL_DEFAULTS, defaults)
}

function stats(registry, mainopts) {
  if (typeof registry === 'object') {
    mainopts = registry
    registry = undefined
  }

  mainopts = merge({}, GLOBAL_DEFAULTS, mainopts, {registry:registry});
  var nanoConf = merge({url: mainopts.registry}, mainopts.nano)

  var nano = require('nano')(nanoConf)
    , modules = nano.db.use(mainopts.modules)
    , users = nano.db.use(mainopts.users)
    , downloadUrl = mainopts.downloads

  var Keyword = require('./lib/keyword')(modules, downloadUrl, users, mainopts)
    , Module = require('./lib/module')(modules, downloadUrl, users, mainopts)
    , User = require('./lib/user')(modules, downloadUrl, users, mainopts)
    , Registry = require('./lib/registry')(modules, downloadUrl, users, mainopts)

  function modifier(method) {
    return function(options, callback) {
      options = options || {}

      if (typeof options === 'string') {
        options = { string: options }
      }
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      if (!method.select || mainopts.dirty) {
        return method.call(this, options, callback)
      }

      var buffer = ''
      var write = callback ? function write(data) {
        buffer += data
        this.queue(data)
      } : function(data) {
        this.queue(data)
      }

      var stream = es.pipeline(
          method.call(this, options)
        , jsonstream.parse(method.select)
        , es.mapSync(method.map || passthrough)
        , method.reduce
          ? reducestream(method.reduce, method.reduce.start)
          : es.mapSync(passthrough)
        , method.single
          ? es.stringify()
          : jsonstream.stringify('[', ',', ']')
        , es.through(write, end)
      )

      if (callback) stream.on('error', callback)

      function end() {
        var self = this

        if (callback) {
          try {
            callback(null, JSON.parse(buffer))
          } catch(e) {
            callback(e)
          }
          return
        }

        this.queue(null)
      }

      return stream
    }
  }

  ;[Registry, Keyword, User, Module].forEach(function(model) {
    Object.keys(model.prototype).forEach(function(name) {
      var method = model.prototype[name]

      model.prototype[name] = modifier(model.prototype[name])
    })
  })

  var registry = new Registry

  registry.user = User
  registry.module = Module
  registry.keyword = Keyword

  return registry
}
