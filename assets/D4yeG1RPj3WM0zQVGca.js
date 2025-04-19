import{d as l,j as p,t as c,K as d,k as f,c as u,o as m}from"./index-COvgTwy_.js";import{u as _,L as g}from"./D6RU3MBCvuBr5f9HRmm.js";import{b as k,c as h,_ as M}from"./P8clTApBHKyD5d_AwrY.js";import{u as b,r as y}from"./CI5Vv1IzJnVwTFOnvrY.js";const x=l({__name:"ltAllMap",setup(v){const o=f(),t=p(null);return b(y(),c("Map")),d(async()=>{const{map:a}=_(t),s=await k(o.query),r=(await h(s)).flatMap(e=>{if(!e.coordinates.isDefined)return[];const{lat:n,lng:i}=e.coordinates;return[g.circleMarker({lat:n,lng:i},{color:"#2a4b8d"}).bindTooltip(e.file).bindPopup(()=>`
<div style="width: 300px">
  <p><a href="${e.url}" target="_blank">${e.file}</a></p>
  <img src="${e.imageUrl(300)}" style="width: 100%" />
</div>`).addTo(a).getLatLng()]});a.fitBounds(r)}),(a,s)=>(m(),u("div",{ref_key:"mapRef",ref:t,class:"map h-100",style:{"min-height":"300px"}},null,512))}}),R=M(x,[["__scopeId","data-v-146d8368"]]);export{R as default};
//# sourceMappingURL=D4yeG1RPj3WM0zQVGca.js.map
