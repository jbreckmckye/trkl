!function(t,s){"function"==typeof define&&define.amd?define([],s):"object"==typeof module&&module.exports?module.exports=s():t.trkl=s()}(this,function(){function t(t,s){this.t=0,this.s=-1,this.i=[],this.e=[],this.n=s,s&&this.r(),this.u=s?this.u:t}let s=null,i=[],e=function(s){let i=new t(s),e=function(){return arguments.length?i.write(arguments[0]):i.read()};return e.h=!0,e.subscribe=i.sub.bind(i),e.unsubscribe=i.unsub.bind(i),e};e.computed=function(s){let i=new t(0,s),e=i.read.bind(i);return e.h=!0,e.subscribe=i.sub.bind(i),e.unsubscribe=i.unsub.bind(i),e},e.from=function(t){let s=e();return t(s),s},e.unwrap=function(t){let s;if(t instanceof Array){s=[];for(let i=0;i<t.length;i++)s.push(e.unwrap(t[i]))}else if(t instanceof Object){s={};for(let i in t)t.hasOwnProperty(i)&&(s[i]=e.unwrap(t[i]))}else s=t.h?e.unwrap(t()):t;return s};let n={};return t.prototype=n,n.read=function(){return s&&-1==this.i.indexOf(s)&&(this.i.push(s),this.t&&s.setStale()),this.u},n.write=function(s){this.o=this.u,this.l(),this.u=s;try{this.a()}catch(t){throw this.onError(),t}return t.validate(),this.c=this.o,this._(),this.u},n.r=function(){s=this,this.o=this.u;let t;try{this.u=this.n()}catch(s){t=s}if(s=null,t)throw this.onError(),t},n.l=function(){for(let t=0;t<this.i.length;t++)this.i[t].setStale()},n.setStale=function(){1==++this.t&&(this.i.forEach(t=>t.setStale()),this.d())},n.d=function(){this.s=i.length,i[this.s]=this},n.b=function(){i[this.s]=null,this.s=-1},n.a=function(){for(let t=0;t<this.i.length;t++)this.i[t].setReady()},n.setReady=function(){1==this.t&&this.n&&this.r(),0==--this.t&&(this.c=this.o,this.b(),this.a(),this._())},t.validate=function(){let s;for(let t=0;t<i.length;t++)if(null!==i[t]){s=i[t];break}i.length=0,s&&t.foundCircular(s)},t.foundCircular=function(t){throw new Error("Circular dependency detected. Trkl has stopped. Suspicious function is: "+t.n.toString())},n.onError=function(){this.u=this.o,this.t=0,this.i&&this.i.forEach(t=>t.onError())},n.sub=function(t,s){-1==this.e.indexOf(t)&&this.e.push(t),s&&t(this.u,this.c)},n.unsub=function(t){let s=this.e.indexOf(t);s>-1&&this.e.splice(s,1)},n._=function(){if(this.e.length)for(let t=0;t<this.e.length;t++)this.f(this.e[t])},n.f=function(t){let s;try{t(this.u,this.c)}catch(t){s=t}s&&window.setTimeout(()=>{throw s},0)},e});