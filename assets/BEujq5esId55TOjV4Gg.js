import{d as l,i as p,t as c,B as f,a as u,s as m,o as d}from"./index-QmqdmOmt.js";import{u as _,L as g}from"./DXlEH2ZTc5TKktgL8Yn.js";import{a as k,b}from"./CBG-hZ7ua1mBYAaDlfu.js";import{u as h,r as y}from"./uRE4_1B7GvcejlOJzRi.js";const v=l({__name:"ltAllMap",setup(M){const o=m(),t=p(null);return h(y(),c("Map")),f(async()=>{const{map:a}=_(t),s=await k(o.query),r=(await b(s)).flatMap(e=>{if(!e.coordinates.isDefined)return[];const{lat:n,lng:i}=e.coordinates;return[g.circleMarker({lat:n,lng:i},{color:"#2a4b8d"}).bindTooltip(e.file).bindPopup(()=>`
<div style="width: 300px">
  <p><a href="${e.url}" target="_blank">${e.file}</a></p>
  <img src="${e.imageUrl(300)}" style="width: 100%" />
</div>`).addTo(a).getLatLng()]});a.fitBounds(r)}),(a,s)=>(d(),u("div",{ref_key:"mapRef",ref:t,class:"map fill",style:{"min-height":"300px"}},null,512))}});export{v as default};
//# sourceMappingURL=BEujq5esId55TOjV4Gg.js.map
