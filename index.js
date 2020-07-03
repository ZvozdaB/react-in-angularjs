"use strict";

var React = require("react");

var ReactDOM = require("react-dom");

var isPlainObject = require("lodash/isPlainObject");

var isEqual = require("lodash/isEqual");

function angularize(Component, componentName, angularApp, bindings) {
  bindings = bindings || {};
  if (typeof window === "undefined" || typeof angularApp === "undefined") return;
  angularApp.component(componentName, {
    bindings: bindings,
    controller: ["$element", function ($element) {
      var _this = this;

      if (window.angular) {
        this.$scope = window.angular.element($element).scope();
        var previous = {};

        this.$onInit = function () {
          for (var _i = 0, _Object$keys = Object.keys(bindings); _i < _Object$keys.length; _i++) {
            var bindingKey = _Object$keys[_i];

            if (bindings[bindingKey] === "=") {
              previous[bindingKey] = window.angular.copy(_this[bindingKey]);
            }
          }
        };

        this.$doCheck = function () {
          for (var _i2 = 0, _Object$keys2 = Object.keys(previous); _i2 < _Object$keys2.length; _i2++) {
            var previousKey = _Object$keys2[_i2];

            if (!equals(_this[previousKey], previous[previousKey])) {
              _this.$onChanges();

              return;
            }
          }
        };
      }

      this.$onChanges = function () {
        ReactDOM.render(React.createElement(Component, _this), $element[0]);
      };
    }]
  });
}

function angularizeDirective(Component, directiveName, angularApp, bindings) {
  bindings = bindings || {};
  if (typeof window === "undefined" || typeof angularApp === "undefined") return;
  angularApp.directive(directiveName, function () {
    return {
      scope: bindings,
      replace: true,
      link: function link(scope, element) {
        scope.$scope = scope;
        ReactDOM.render(React.createElement(Component, scope), element[0]);
        var keys = [];

        for (var _i3 = 0, _Object$keys3 = Object.keys(bindings); _i3 < _Object$keys3.length; _i3++) {
          var bindingKey = _Object$keys3[_i3];

          if (bindings[bindingKey] !== "&") {
            keys.push(bindingKey);
          }
        }

        scope.$watchGroup(keys, function () {
          ReactDOM.render(React.createElement(Component, scope), element[0]);
        });
      }
    };
  });
}

function getService(serviceName) {
  if (typeof window === "undefined" || typeof window.angular === "undefined") return {};
  return window.angular.element(document.body).injector().get(serviceName);
}

function equals(o1, o2) {
  if (isPlainObject(o1) && isPlainObject(o2)) {
    return isEqual(o1, o2);
  }

  return window.angular.equals(o1, o2);
}

module.exports = {
  getService: getService,
  angularize: angularize,
  angularizeDirective: angularizeDirective
};