'use strict';
var o = {
  foo: function() {
    return this;
  }
};
var f = o.foo;
console.log(f());
