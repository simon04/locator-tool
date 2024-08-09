import{d as l,i as p,t as c,C as f,a as u,x as m,o as d}from"./index-D06__tOs.js";import{u as _,L as g}from"./djBMEwylSaC9Ui27djc.js";import{a as k,b}from"./B2MJPNsjtKU8Jsw4DhR.js";import{u as h,r as y}from"./BWlJ4Jp0bUMWDPiL3wz.js";const B=l({__name:"ltAllMap",setup(M){const s=m(),t=p(null);return h(y(),c("Map")),f(async()=>{const{map:a}=_(t),o=await k(s.query),r=(await b(o)).flatMap(e=>{if(!e.coordinates.isDefined)return[];const{lat:n,lng:i}=e.coordinates;return[g.circleMarker({lat:n,lng:i},{color:"#2a4b8d"}).bindTooltip(e.file).bindPopup(()=>`
<div style="width: 300px">
  <p><a href="${e.url}" target="_blank">${e.file}</a></p>
  <img src="${e.imageUrl(300)}" style="width: 100%" />
</div>`).addTo(a).getLatLng()]});a.fitBounds(r)}),(a,o)=>(d(),u("div",{ref_key:"mapRef",ref:t,class:"map fill",style:{"min-height":"300px"}},null,512))}});export{B as default};
//# sourceMappingURL=BglUBzBUn8IZ6iDed3c.js.map
