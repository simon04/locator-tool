function W(c){return c&&c.__esModule&&Object.prototype.hasOwnProperty.call(c,"default")?c.default:c}var T,q;function L(){if(q)return T;q=1;var c=function(t){return u(t)&&!s(t)};function u(n){return!!n&&typeof n=="object"}function s(n){var t=Object.prototype.toString.call(n);return t==="[object RegExp]"||t==="[object Date]"||f(n)}var d=typeof Symbol=="function"&&Symbol.for,g=d?Symbol.for("react.element"):60103;function f(n){return n.$$typeof===g}function h(n){return Array.isArray(n)?[]:{}}function p(n,t){return t.clone!==!1&&t.isMergeableObject(n)?v(h(n),n,t):n}function O(n,t,l){return n.concat(t).map(function(m){return p(m,l)})}function w(n,t){if(!t.customMerge)return v;var l=t.customMerge(n);return typeof l=="function"?l:v}function j(n){return Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(n).filter(function(t){return n.propertyIsEnumerable(t)}):[]}function P(n){return Object.keys(n).concat(j(n))}function F(n,t){try{return t in n}catch{return!1}}function A(n,t){return F(n,t)&&!(Object.hasOwnProperty.call(n,t)&&Object.propertyIsEnumerable.call(n,t))}function S(n,t,l){var m={};return l.isMergeableObject(n)&&P(n).forEach(function(y){m[y]=p(n[y],l)}),P(t).forEach(function(y){A(n,y)||(F(n,y)&&l.isMergeableObject(t[y])?m[y]=w(y,l)(n[y],t[y],l):m[y]=p(t[y],l))}),m}function v(n,t,l){l=l||{},l.arrayMerge=l.arrayMerge||O,l.isMergeableObject=l.isMergeableObject||c,l.cloneUnlessOtherwiseSpecified=p;var m=Array.isArray(t),y=Array.isArray(n),b=m===y;return b?m?l.arrayMerge(n,t,l):S(n,t,l):p(t,l)}v.all=function(t,l){if(!Array.isArray(t))throw new Error("first argument should be an array");return t.reduce(function(m,y){return v(m,y,l)},{})};var e=v;return T=e,T}var J=L();const Y=W(J);var R,D,B=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},G=(R=function(c){(function(u){function s(e,n){var t=(65535&e)+(65535&n);return(e>>16)+(n>>16)+(t>>16)<<16|65535&t}function d(e,n,t,l,m,y){return s((b=s(s(n,e),s(l,y)))<<(r=m)|b>>>32-r,t);var b,r}function g(e,n,t,l,m,y,b){return d(n&t|~n&l,e,n,m,y,b)}function f(e,n,t,l,m,y,b){return d(n&l|t&~l,e,n,m,y,b)}function h(e,n,t,l,m,y,b){return d(n^t^l,e,n,m,y,b)}function p(e,n,t,l,m,y,b){return d(t^(n|~l),e,n,m,y,b)}function O(e,n){var t,l,m,y,b;e[n>>5]|=128<<n%32,e[14+(n+64>>>9<<4)]=n;var r=1732584193,a=-271733879,i=-1732584194,o=271733878;for(t=0;t<e.length;t+=16)l=r,m=a,y=i,b=o,r=g(r,a,i,o,e[t],7,-680876936),o=g(o,r,a,i,e[t+1],12,-389564586),i=g(i,o,r,a,e[t+2],17,606105819),a=g(a,i,o,r,e[t+3],22,-1044525330),r=g(r,a,i,o,e[t+4],7,-176418897),o=g(o,r,a,i,e[t+5],12,1200080426),i=g(i,o,r,a,e[t+6],17,-1473231341),a=g(a,i,o,r,e[t+7],22,-45705983),r=g(r,a,i,o,e[t+8],7,1770035416),o=g(o,r,a,i,e[t+9],12,-1958414417),i=g(i,o,r,a,e[t+10],17,-42063),a=g(a,i,o,r,e[t+11],22,-1990404162),r=g(r,a,i,o,e[t+12],7,1804603682),o=g(o,r,a,i,e[t+13],12,-40341101),i=g(i,o,r,a,e[t+14],17,-1502002290),r=f(r,a=g(a,i,o,r,e[t+15],22,1236535329),i,o,e[t+1],5,-165796510),o=f(o,r,a,i,e[t+6],9,-1069501632),i=f(i,o,r,a,e[t+11],14,643717713),a=f(a,i,o,r,e[t],20,-373897302),r=f(r,a,i,o,e[t+5],5,-701558691),o=f(o,r,a,i,e[t+10],9,38016083),i=f(i,o,r,a,e[t+15],14,-660478335),a=f(a,i,o,r,e[t+4],20,-405537848),r=f(r,a,i,o,e[t+9],5,568446438),o=f(o,r,a,i,e[t+14],9,-1019803690),i=f(i,o,r,a,e[t+3],14,-187363961),a=f(a,i,o,r,e[t+8],20,1163531501),r=f(r,a,i,o,e[t+13],5,-1444681467),o=f(o,r,a,i,e[t+2],9,-51403784),i=f(i,o,r,a,e[t+7],14,1735328473),r=h(r,a=f(a,i,o,r,e[t+12],20,-1926607734),i,o,e[t+5],4,-378558),o=h(o,r,a,i,e[t+8],11,-2022574463),i=h(i,o,r,a,e[t+11],16,1839030562),a=h(a,i,o,r,e[t+14],23,-35309556),r=h(r,a,i,o,e[t+1],4,-1530992060),o=h(o,r,a,i,e[t+4],11,1272893353),i=h(i,o,r,a,e[t+7],16,-155497632),a=h(a,i,o,r,e[t+10],23,-1094730640),r=h(r,a,i,o,e[t+13],4,681279174),o=h(o,r,a,i,e[t],11,-358537222),i=h(i,o,r,a,e[t+3],16,-722521979),a=h(a,i,o,r,e[t+6],23,76029189),r=h(r,a,i,o,e[t+9],4,-640364487),o=h(o,r,a,i,e[t+12],11,-421815835),i=h(i,o,r,a,e[t+15],16,530742520),r=p(r,a=h(a,i,o,r,e[t+2],23,-995338651),i,o,e[t],6,-198630844),o=p(o,r,a,i,e[t+7],10,1126891415),i=p(i,o,r,a,e[t+14],15,-1416354905),a=p(a,i,o,r,e[t+5],21,-57434055),r=p(r,a,i,o,e[t+12],6,1700485571),o=p(o,r,a,i,e[t+3],10,-1894986606),i=p(i,o,r,a,e[t+10],15,-1051523),a=p(a,i,o,r,e[t+1],21,-2054922799),r=p(r,a,i,o,e[t+8],6,1873313359),o=p(o,r,a,i,e[t+15],10,-30611744),i=p(i,o,r,a,e[t+6],15,-1560198380),a=p(a,i,o,r,e[t+13],21,1309151649),r=p(r,a,i,o,e[t+4],6,-145523070),o=p(o,r,a,i,e[t+11],10,-1120210379),i=p(i,o,r,a,e[t+2],15,718787259),a=p(a,i,o,r,e[t+9],21,-343485551),r=s(r,l),a=s(a,m),i=s(i,y),o=s(o,b);return[r,a,i,o]}function w(e){var n,t="",l=32*e.length;for(n=0;n<l;n+=8)t+=String.fromCharCode(e[n>>5]>>>n%32&255);return t}function j(e){var n,t=[];for(t[(e.length>>2)-1]=void 0,n=0;n<t.length;n+=1)t[n]=0;var l=8*e.length;for(n=0;n<l;n+=8)t[n>>5]|=(255&e.charCodeAt(n/8))<<n%32;return t}function P(e){var n,t,l="0123456789abcdef",m="";for(t=0;t<e.length;t+=1)n=e.charCodeAt(t),m+=l.charAt(n>>>4&15)+l.charAt(15&n);return m}function F(e){return unescape(encodeURIComponent(e))}function A(e){return function(n){return w(O(j(n),8*n.length))}(F(e))}function S(e,n){return function(t,l){var m,y,b=j(t),r=[],a=[];for(r[15]=a[15]=void 0,b.length>16&&(b=O(b,8*t.length)),m=0;m<16;m+=1)r[m]=909522486^b[m],a[m]=1549556828^b[m];return y=O(r.concat(j(l)),512+8*l.length),w(O(a.concat(y),640))}(F(e),F(n))}function v(e,n,t){return n?t?S(n,e):P(S(n,e)):t?A(e):P(A(e))}c.exports?c.exports=v:u.md5=v})(B)},R(D={exports:{}}),D.exports);function K(c,u){c=c.replace(/^File:/,"").replace(/\s+/g,"_");var s=encodeURIComponent(c),d="https://upload.wikimedia.org/wikipedia/commons",g=G(c),f=g[0]+"/"+g[0]+g[1];return u?d+"/thumb/"+f+"/"+s+"/"+u+"px-"+s+(c.match(/tiff?$/i)?".jpg":c.match(/svg$/i)?".png":""):d+"/"+f+"/"+s}class C{constructor(u,s,d,g,f){this.type=u,this.lat=s,this.lng=d,this.latOriginal=g,this.lngOriginal=f,arguments.length===3&&(this.latOriginal=s,this.lngOriginal=d)}withLatLng(u,s){return new C(this.type,u,s,this.latOriginal,this.lngOriginal)}roundToPrecision(){return new C(this.type,$(this.lat),$(this.lng),this.latOriginal,this.lngOriginal)}rollback(){return new C(this.type,this.latOriginal,this.lngOriginal)}commit(){return new C(this.type,this.lat,this.lng,this.lat,this.lng)}get isDefined(){return this.lat!==void 0&&this.lng!==void 0}get isChanged(){return this.lat!==this.latOriginal||this.lng!==this.lngOriginal}get isDefinedAndSaved(){return this.isDefined&&!this.isChanged}get csv(){return this.lat!==void 0&&this.lng!==void 0?[this.lat,this.lng].map(V).join(", "):""}}function V(c){return c%1===0?c.toFixed(1):c}function $(c,u=5){return typeof c=="number"?+c.toFixed(u):c}const N={"*":"P625",Location:"P1259","Object location":"P9149"},z="https://commons.wikimedia.org/w/api.php",I=6,H=14,k=50;async function Q(c){var f;if(typeof c=="string"&&(c=c.split("|")),c.length>k)return X(c);const u={prop:"coordinates",colimit:500,coprop:"type|name",coprimary:"all",titles:c.join("|").replace(/_/g," ")},s=await E(u),d=((f=s==null?void 0:s.query)==null?void 0:f.pages)||{};return Object.entries(d).map(([h,p])=>{var O,w;return{pageid:parseInt(h),file:p.title,url:`https://commons.wikimedia.org/wiki/${p.title}`,imageUrl(j){return K(this.file,j)},coordinates:new C("Location",...g((O=p.coordinates)==null?void 0:O.find(j=>j.primary===""&&j.type==="camera"))),objectLocation:new C("Object location",...g((w=p.coordinates)==null?void 0:w.find(j=>j.type==="object")))}});function g(h){return typeof h=="object"?[h.lat,h.lon]:[void 0,void 0]}}async function X(c){const u=[...c],s=[];for(;u.length;)s.push(u.splice(0,Math.min(k,u.length)));const d=s.map(f=>Q(f));return(await Promise.all(d)).flat()}async function ot(c,u="categories|imageinfo|revisions|wbentityusage",s="url|extmetadata"){var P,F,A,S,v,e,n;const d={prop:u,pageids:c,iiprop:s,iiextmetadatafilter:"ImageDescription|Artist|DateTimeOriginal",iiextmetadatalanguage:document.body.parentElement.lang,...u.includes("categories")?{clshow:"!hidden"}:{},...u.includes("revisions")?{rvslots:"*",rvprop:"content"}:{}},g=await E(d),f=(F=(P=g==null?void 0:g.query)==null?void 0:P.pages)==null?void 0:F[c],h=((f==null?void 0:f.categories)||[]).map(t=>t.title.replace(/^Category:/,"")),p=(A=f==null?void 0:f.imageinfo[0])==null?void 0:A.extmetadata;return{categories:h,description:(S=p==null?void 0:p.ImageDescription)==null?void 0:S.value,author:(v=p==null?void 0:p.Artist)==null?void 0:v.value,timestamp:(e=p==null?void 0:p.DateTimeOriginal)==null?void 0:e.value,...s.includes("url")?{url:(n=f==null?void 0:f.imageinfo[0])==null?void 0:n.descriptionurl}:{},objectLocation:j(f),...O(f)};function O(t){var r,a,i,o,U;const l=(i=(a=(r=t==null?void 0:t.revisions)==null?void 0:r[0])==null?void 0:a.slots)==null?void 0:i.mediainfo["*"];if(!l)return{};const m=JSON.parse(l),y=w("Location",(o=m.statements[N.Location])==null?void 0:o[0]),b=w("Object location",(U=m.statements[N["Object location"]])==null?void 0:U[0]);return{...y?{coordinates:y}:{},...b?{objectLocation:b}:{}}}function w(t,l){var m;if(((m=l==null?void 0:l.mainsnak.datavalue)==null?void 0:m.type)==="globecoordinate")return new C(t,l==null?void 0:l.mainsnak.datavalue.value.latitude,l==null?void 0:l.mainsnak.datavalue.value.longitude)}function j(t){var l,m,y;try{const b=((y=(m=(l=t==null?void 0:t.revisions)==null?void 0:l[0])==null?void 0:m.slots)==null?void 0:y.main["*"])||"",r=b.match(/\{\{Object location( dec)?\|([0-9]+)\|([0-9]+)\|([0-9.]+)\|([NS])\|([0-9]+)\|([0-9]+)\|([0-9.]+)\|([WE])/i),a=b.match(/\{\{Object location( dec)?\s*\|\s*([0-9.]+)\s*\|\s*([0-9.]+)/i);let i,o;return r?(i=parseInt(r[2])+parseInt(r[3])/60+parseFloat(r[4])/3600,i*=r[5]==="N"?1:-1,o=parseInt(r[6])+parseInt(r[7])/60+parseFloat(r[8])/3600,o*=r[9]==="E"?1:-1):a&&(i=parseFloat(a[2]),o=parseFloat(a[3])),new C("Object location",i,o)}catch{return new C("Object location",void 0,void 0)}}}async function ct(c){return((await E({list:"allpages",apnamespace:H,aplimit:30,apfrom:c,apprefix:c},{},void 0,()=>!1)).query.allpages||[]).map(d=>d.title.replace(/^Category:/,""))}async function st(c){return((await E({list:"allusers",aulimit:30,aufrom:c,apuprefix:c},{},void 0,()=>!1)).query.allusers||[]).map(d=>d.name)}async function lt({files:c,user:u,userLimit:s,userStart:d,userEnd:g,category:f,categoryDepth:h}){if(typeof c=="string"&&(c=c.split("|")),c)return c.map(p=>p.startsWith("File:")?p:`File:${p}`);if(u)return s=typeof s=="string"?+s:s,Z(u,s,d,g);if(f)return h=typeof h=="string"?+h:h,tt(f,h);throw new Error}function _(c,u){const s="https://commons.wikimedia.org/wiki/";return c.startsWith(s)&&(c=c.slice(s.length),c=decodeURI(c)),c.startsWith(u)&&(c=c.slice(u.length)),c}async function Z(c,u,s,d){c=_(c,"User:");const g={generator:"allimages",gaiuser:c,gailimit:typeof u=="number"&&u<=500?u:"max",gaistart:d?new Date(d).toISOString():void 0,gaiend:s?new Date(s).toISOString():void 0,gaisort:"timestamp",gaidir:"older"},f=w=>Object.values(w.query.pages),p=await E(g,{},void 0,w=>w.continue?!u||f(w).length<u:!1),O=f(p).map(w=>w.title);return u?O.slice(0,u):O}async function tt(c,u=3){c=_(c,"Category:");const s=new AbortController,d=[rt(c,u,s.signal),nt(c,u,s.signal),at(c,u,s.signal)];u<=0&&d.unshift(et(c,s.signal));try{return await it(d)}finally{s.abort()}}async function et(c,u){const s={list:"categorymembers",cmlimit:500,cmnamespace:I,cmtitle:"Category:"+c};return((await E(s,{},u)).query.categorymembers||[]).map(g=>g.title)}async function rt(c,u,s){const d={lang:"commons",cat:c.replace(/^Category:/,""),type:I,depth:u,json:1},g="https://cats-php.toolforge.org/?"+M(d);return(await x(g,{signal:s})).map(h=>`File:${h}`)}async function nt(c,u,s){const d={category:c.replace(/^Category:/,""),ns:I,depth:u},g="/catscan?"+M(d);return(await x(g,{signal:s})).pages.map(h=>`File:${h}`)}async function at(c,u,s){const d={language:"commons",project:"wikimedia",depth:u,categories:c,[`ns[${I}]`]:1,format:"json",sparse:1,doit:1},g="https://petscan.wmcloud.org/?"+M(d);return(await x(g,{signal:s}))["*"][0].a["*"]}async function E(c,u={},s,d=g=>!!g.continue){const g={action:"query",format:"json",origin:"*",...c},f=z+"?"+M(g);let h=await x(f,{signal:s});return h=Y(u,h,{arrayMerge:(p,O)=>[].concat(...p,...O)}),d(h)?E({...c,continue:void 0,...h.continue},{...h,continue:void 0},s,d):h}function M(c){const u=new URLSearchParams;return Object.entries(c).forEach(([s,d])=>d===void 0||u.append(s,String(d))),u}function it(c){return c=c.filter(u=>!!u),new Promise((u,s)=>{c.forEach(d=>d.then(u)),Promise.allSettled(c).catch(s)})}async function x(c,u){console.log("Fetching",c);const s=await fetch(c,{cache:"no-cache",headers:{Accept:"application/json"},...u});if(s.ok)return s.json();throw new Error(s.statusText)}export{C as L,st as a,lt as b,Q as c,ot as d,W as e,ct as g};
//# sourceMappingURL=B63oJqa3gFqbHRwP5MY.js.map