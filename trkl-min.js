(function(e,d){"function"===typeof define&&define.amd?define("trkl",[],d):e.trkl=d()})(this,function(){function e(h){function g(b){var a=c;c=b;a!==b&&f.forEach(function(b){b(c,a)})}var c=h,f=[],a=function(b){if(0<arguments.length)g(b);else{var k=d[d.length-1];k&&a.subscribe(k.subscriber);return c}};a.subscribe=function(b){-1===f.indexOf(b)&&f.push(b)};a.unsubscribe=function(b){var a=f;b=a.indexOf(b);-1!==b&&a.splice(b,1)};a.map=function(b){return e.computed(function(){return b(a())})};a.scan=function(b,
d){var c=e(d);a.subscribe(function(a){a=b(c(),a);c(a)});return c};return a}var d=[];e.computed=function(h){function g(){if(-1!==d.indexOf(f))throw Error("Circular computation detected");d.push(f);var a,b;try{b=h()}catch(e){a=e}d.pop();if(a)throw a;c(b)}var c=e(),f={subscriber:g};g();return c};return e});