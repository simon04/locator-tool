import{d as l,i as p,B as c,a as f,s as m,o as u}from"./index-gceCSPjE.js";import{u as d,L as _}from"./qGU2Un8L2W5qfd5ETVx.js";import{a as g,b as k}from"./iXGVQD7tWU8F5VIA7-1.js";const L=l({__name:"ltAllMap",setup(h){const o=m(),s=p(null);return c(async()=>{const{map:a}=d(s),t=await g(o.query),n=(await k(t)).flatMap(e=>{if(!e.coordinates.isDefined)return[];const{lat:r,lng:i}=e.coordinates;return[_.marker({lat:r,lng:i}).bindPopup(()=>`
<div style="width: 300px">
  <p><a href="${e.url}" target="_blank">${e.file}</a></p>
  <img src="${e.imageUrl(300)}" style="width: 100%" />
</div>`).addTo(a).getLatLng()]});a.fitBounds(n)}),(a,t)=>(u(),f("div",{ref_key:"mapRef",ref:s,class:"map fill",style:{"min-height":"300px"}},null,512))}});export{L as default};
//# sourceMappingURL=FDBjHPsiOyuZZHV1jWo.js.map
