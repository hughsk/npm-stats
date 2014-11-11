var request = require('request')
  , merge = require('lodash.merge')


function leading(n, d) {
  d = d || 2
  n += ''
  while (n.length < d) n = "0" + n
  return n
}

function ymd(date) {
  date = new Date(date)
  return [date.getFullYear(), leading(date.getMonth() + 1), leading(date.getDate())].join('-')
}

module.exports = function(modules, downloadUrl, users, mainopts) {
  function Module(name) {
    if (!(this instanceof Module)) return new Module(name)
    this.name = name
  }

  Module.prototype.info = function(options, callback) {
    return modules.get(this.name, callback)
  }
  Module.prototype.version = function(options, callback) {
    return modules.get('_design/app/_show/package/' + this.name, {
      version: options.string
    }, callback)
  }

  function getDownloader(methodName, defs) {
    defs = merge({
        detail: 'range',
        since: '2000-01-01',
        until: '3000-01-01'
      }, defs)
    function Downloader(options, callback) {
      var detail = options.detail || defs.detail
        , period = (options.since = options.since ? ymd(options.since) : defs.since) + ':' +
                   (options.until = options.until ? ymd(options.until) : defs.until)
      var url = [downloadUrl, detail, period, this.name].join('/')
      return request.get({ url:url, strictSSL:false }, callback)
    }
    return Downloader
  }
  
  Module.prototype.downloads = getDownloader('downloads')
  Module.prototype.downloads.select = ['downloads', true]
  Module.prototype.downloads.map = function(row) {
    return { date:row.day, value:row.downloads }
  }

  Module.prototype.totalDownloads = getDownloader('totalDownloads')
  Module.prototype.totalDownloads.select = ['downloads', true]
  Module.prototype.totalDownloads.single = true
  Module.prototype.totalDownloads.reduce = function(acc, row) {
    return acc + (row.downloads || 0)
  }
  Module.prototype.totalDownloads.reduce.start = 0

  Module.prototype.stars = function(options, callback) {
    return modules.get('_design/app/_view/starredByPackage', {
      startkey: this.name
      , endkey: this.name
    }, callback)
  }
  Module.prototype.stars.select = ['rows', true, 'value']

  Module.prototype.latest = function(options, callback) {
    return modules.get('_design/app/_view/byField', {
      key: this.name
    }, callback)
  }
  Module.prototype.latest.select = ['rows', true, 'value']
  Module.prototype.latest.single = true

  Module.prototype.field = function(options, callback) {
    var field = options.field || options.string

    return modules.get('_design/app/_list/byField/byField', {
        field: field
      , key: this.name
    }, callback)
  }

  Module.prototype.size = function(options, callback) {
    return modules.get('_design/app/_view/howBigIsYourPackage', {
      key: this.name
    }, callback)
  }
  Module.prototype.size.select = ['rows', true, 'value']
  Module.prototype.size.single = true

  Module.prototype.dependents = function(options, callback) {
    return modules.get('_design/app/_view/dependedUpon', {
        group_level: 2
      , startkey: [this.name]
      , endkey: [this.name, {}]
    }, callback)
  }
  Module.prototype.dependents.select = ['rows', true, 'key']
  Module.prototype.dependents.map = function(row) {
    return row[1]
  }

  return Module
}