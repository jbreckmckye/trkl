function n(n){function r(n,r){~e.indexOf(n)||e.push(n),r&&n(c)}function i(n){var r=c;c=n,e.slice().forEach(function(n){n(c,r)})}function o(){var n=u[u.length-1];return n&&r(n.n),c}var c=n,e=[],f=function(n){if(!arguments.length)return o();i(n)};return f.subscribe=r,f.unsubscribe=function(n){t(e,n)},f}function r(n){if(-1!==u.indexOf(n))throw Error("Circular computation detected")}function t(n,r){var t=n.indexOf(r);-1!==t&&n.splice(t,1)}var u=[];n.computed=function(t){function i(){r(c),u.push(c);var n,i;try{i=t()}catch(r){n=r}if(u.pop(),n)throw n;o(i)}var o=n(),c={n:i};return i(),o},n.from=function(r){var t=n();return r(t),t},"object"==typeof module?module.exports=n:window.trkl=n;