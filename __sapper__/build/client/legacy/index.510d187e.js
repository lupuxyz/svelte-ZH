import{s as n,n as t}from"./index.a0792a5e.js";var e=[];function r(r){var i,a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:t,o=[];function u(t){if(n(r,t)&&(r=t,i)){for(var a=!e.length,u=0;u<o.length;u+=1){var f=o[u];f[1](),e.push(f,r)}if(a){for(var l=0;l<e.length;l+=2)e[l][0](e[l+1]);e.length=0}}}return{set:u,update:function(n){u(n(r))},subscribe:function(n){var e=[n,arguments.length>1&&void 0!==arguments[1]?arguments[1]:t];return o.push(e),1===o.length&&(i=a(u)||t),n(r),function(){var n=o.indexOf(e);-1!==n&&o.splice(n,1),0===o.length&&(i(),i=null)}}}}export{r as w};