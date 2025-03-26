import{d as l,j as p,t as c,I as f,k as u,c as m,o as d}from"./index-OklLjvPj.js";import{u as _,L as g}from"./BpTAP-ZXed2FulDou5w.js";import{b as k,c as b}from"./cgaqnUAsUwBFiBqgUDy.js";import{u as h,r as y}from"./Dd5f0S-HKL2198cOOx8.js";const B=l({__name:"ltAllMap",setup(M){const s=u(),t=p(null);return h(y(),c("Map")),f(async()=>{const{map:a}=_(t),o=await k(s.query),r=(await b(o)).flatMap(e=>{if(!e.coordinates.isDefined)return[];const{lat:n,lng:i}=e.coordinates;return[g.circleMarker({lat:n,lng:i},{color:"#2a4b8d"}).bindTooltip(e.file).bindPopup(()=>`
<div style="width: 300px">
  <p><a href="${e.url}" target="_blank">${e.file}</a></p>
  <img src="${e.imageUrl(300)}" style="width: 100%" />
</div>`).addTo(a).getLatLng()]});a.fitBounds(r)}),(a,o)=>(d(),m("div",{ref_key:"mapRef",ref:t,class:"map fill",style:{"min-height":"300px"}},null,512))}});export{B as default};
//# sourceMappingURL=CMUxfueHKFGqPlUvs0l.js.map
