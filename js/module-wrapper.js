"use strict";

var _require = require("./errors.js"),
  XTInternalError = _require.XTInternalError;
function emptyFun() {}
function identity(i) {
  return i;
}
module.exports = function (module) {
  var defaults = {
    set: emptyFun,
    matchers: function matchers() {
      return [];
    },
    parse: emptyFun,
    render: emptyFun,
    getTraits: emptyFun,
    getFileType: emptyFun,
    nullGetter: emptyFun,
    optionsTransformer: identity,
    postrender: identity,
    errorsTransformer: identity,
    getRenderedMap: identity,
    preparse: identity,
    postparse: identity,
    on: emptyFun,
    resolve: emptyFun,
    preResolve: emptyFun
  };
  if (Object.keys(defaults).every(function (key) {
    return !module[key];
  })) {
    var err = new XTInternalError("This module cannot be wrapped, because it doesn't define any of the necessary functions");
    err.properties = {
      id: "module_cannot_be_wrapped",
      explanation: "This module cannot be wrapped, because it doesn't define any of the necessary functions"
    };
    throw err;
  }
  Object.keys(defaults).forEach(function (key) {
    module[key] = module[key] || defaults[key];
  });
  return module;
};