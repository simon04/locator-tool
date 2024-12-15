import{d as l,j as p,t as c,I as f,c as u,y as m,o as d}from"./index-dahIkjYb.js";import{u as _,L as g}from"./DaFFlQ0-heGAtKHTuMs.js";import{b as k,c as y}from"./B63oJqa3gFqbHRwP5MY.js";import{u as b,r as h}from"./q08HnKiSBff-9NRbgde.js";const B=l({__name:"ltAllMap",setup(M){const s=m(),t=p(null);return b(h(),c("Map")),f(async()=>{const{map:a}=_(t),o=await k(s.query),r=(await y(o)).flatMap(e=>{if(!e.coordinates.isDefined)return[];const{lat:n,lng:i}=e.coordinates;return[g.circleMarker({lat:n,lng:i},{color:"#2a4b8d"}).bindTooltip(e.file).bindPopup(()=>`
<div style="width: 300px">
  <p><a href="${e.url}" target="_blank">${e.file}</a></p>
  <img src="${e.imageUrl(300)}" style="width: 100%" />
</div>`).addTo(a).getLatLng()]});a.fitBounds(r)}),(a,o)=>(d(),u("div",{ref_key:"mapRef",ref:t,class:"map fill",style:{"min-height":"300px"}},null,512))}});export{B as default};
//# sourceMappingURL=DK9YyenjXUTSzL8PkKo.js.map
