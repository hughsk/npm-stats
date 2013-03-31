module.exports = function(modules, downloads, users, mainopts) {
  function Registry() {
    if (!(this instanceof Registry)) return new Registry(name)
  }

  Registry.prototype.list = function(options, callback) {
    return modules.get('_design/app/_view/browseAll', {
      group_level: 1
    }, callback)
  }
  Registry.prototype.list.select = ['rows', true, 'key', '0']

  return Registry
}
