(function(d,b){"function"===typeof define&&define.amd?define([],b):"object"===typeof module&&module.exports?module.exports=b():d.trkl=b()})(this,function(){function d(e){function d(a){-1===c.indexOf(a)&&c.push(a)}function g(a){var b=f;f=a;c.forEach(function(a){a(f,b)})}var f=e,c=[];e=function(a){if(0<arguments.length)g(a);else{var c=b[b.length-1];c&&d(c.subscriber);return f}};e.subscribe=d;e.unsubscribe=function(a){var b=c;a=b.indexOf(a);-1!==a&&b.splice(a,1)};return e}var b=[];d.computed=function(e){function h(){if(-1!==
	b.indexOf(f))throw Error("Circular computation detected");b.push(f);var c,a;try{a=e()}catch(d){c=d}b.pop();if(c)throw c;g(a)}var g=d(),f={subscriber:h};h();return g};return d});