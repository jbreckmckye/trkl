function k(){function d(d){function b(a){if(0<arguments.length)h(a);else{var c=e[e.length-1];c&&f(c.b);return g}}function f(a,b){-1===c.indexOf(a)&&c.push(a);b&&a(g)}function h(a){var b=g;g=a;c.forEach(function(a){a(g,b)})}var g=d,c=[];b.subscribe=f;b.unsubscribe=function(a){a=c.indexOf(a);-1!==a&&c.splice(a,1)};return b}var e=[];d.computed=function(l){function b(){if(-1!==e.indexOf(h))throw Error("Circular computation detected");e.push(h);try{var b=l()}catch(a){var c=a}e.pop();if(c)throw c;f(b)}
    var f=d(),h={b:b};b();return f};return d}"function"===typeof define&&define.c?define([],k):"object"===typeof module&&module.a?module.a=k():this.trkl=k();