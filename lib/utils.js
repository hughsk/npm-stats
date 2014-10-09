var reduce = Array.prototype.reduce

exports.merge = function merge(target) {
  if (typeof target != 'object') throw new TypeError
  return reduce.call(arguments, function(target, source){
    source = Object(source)
    for (var k in source) {
      var v = source[k]
      // don't copy over undefined values / empty strings
      if (v != null && v !== '') target[k] = v
    }
    return target;
  }, target);
}


