import{o as u,c as d,a as e,d as z,E as U,G as q,j as x,e as m,u as f,t as $,b as D,g as P,f as T,p as C,v as A,m as j,F as B,H as ee,I as K,J as E,K as te,L as oe,q as le,r as se,y as ae,n as ne}from"./index-CkBUaJLc.js";import{L as ie,b as re,c as ce,d as ue}from"./B63oJqa3gFqbHRwP5MY.js";import{l as de}from"./CQA941I3jfZjY0vxYnM.js";import{_ as ve,r as fe,a as me}from"./DcTas3GbqPsEaFu1Gjv.js";import{u as pe,L as I}from"./GZpF7q0Xj6VsKOUt3Yp.js";import{u as ge,r as he}from"./CVFU-p6e_0RzwttNsD4.js";const be={xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",fill:"currentColor",class:"bi bi-save",viewBox:"0 0 16 16"};function J(b,o){return u(),d("svg",be,o[0]||(o[0]=[e("path",{d:"M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1z"},null,-1)]))}const _e={xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",fill:"currentColor",class:"bi bi-x-square",viewBox:"0 0 16 16"};function we(b,o){return u(),d("svg",_e,o[0]||(o[0]=[e("path",{d:"M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"},null,-1),e("path",{d:"M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"},null,-1)]))}const Le={class:"input-group"},ye=["value"],$e=["title"],xe=["title","disabled"],R=z({__name:"ltLocationInput",props:{modelValue:{required:!0},modelModifiers:{}},emits:U(["editLocation"],["update:modelValue"]),setup(b,{emit:o}){var i;const _=/(?<lat>[+-]?\d+\.?\d*)(_(?<ns>[NS]))?[_,;\s]+(?<lng>[+-]?\d+\.?\d*)(_(?<ew>[EW]))?/,h=q(b,"modelValue"),k=o,w=x((i=h.value)==null?void 0:i.type),L=x(null);function r(a){var p,g,y;if(a===void 0)return;if(!w.value){const F=(p=h.value)==null?void 0:p.type;F&&(w.value=F)}const t=a.match(_),l=!!t||!a;(y=(g=L.value)==null?void 0:g.classList)==null||y.toggle("is-invalid",!l),l&&(h.value=new ie(w.value,t!=null&&t.groups?parseFloat(t.groups.lat)*(t.groups.ns==="S"?-1:1):void 0,t!=null&&t.groups?parseFloat(t.groups.lng)*(t.groups.ew==="W"?-1:1):void 0,h.value.lat,h.value.lng))}function n(){var a;h.value=(a=h.value)==null?void 0:a.rollback()}return(a,t)=>{var l;return u(),d("div",Le,[e("input",{ref_key:"inputElement",ref:L,value:h.value.csv,class:"form-control",type:"text",onBlur:t[0]||(t[0]=p=>r(p.target.value)),onPaste:t[1]||(t[1]=p=>{var g;r((g=p.clipboardData)==null?void 0:g.getData("text")),p.preventDefault()})},null,40,ye),e("button",{class:"btn btn-outline-secondary",type:"button",title:f($)("Discard"),onClick:t[2]||(t[2]=p=>n())},[m(f(we))],8,$e),e("button",{class:"btn btn-outline-success",type:"button",title:f($)("Save"),disabled:!((l=h.value)!=null&&l.isChanged),onClick:t[3]||(t[3]=p=>k("editLocation"))},[m(f(J))],8,xe)])}}}),ke={xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",fill:"currentColor",class:"bi bi-camera-fill",viewBox:"0 0 16 16"};function W(b,o){return u(),d("svg",ke,o[0]||(o[0]=[e("path",{d:"M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"},null,-1),e("path",{d:"M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0"},null,-1)]))}const je={xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",fill:"currentColor",class:"bi bi-exclamation-triangle-fill",viewBox:"0 0 16 16"};function X(b,o){return u(),d("svg",je,o[0]||(o[0]=[e("path",{d:"M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"},null,-1)]))}const Ce={xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",fill:"currentColor",class:"bi bi-house-fill",viewBox:"0 0 16 16"};function Q(b,o){return u(),d("svg",Ce,o[0]||(o[0]=[e("path",{d:"M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z"},null,-1),e("path",{d:"m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z"},null,-1)]))}const Me={xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",fill:"currentColor",class:"bi bi-question-circle",viewBox:"0 0 16 16"};function G(b,o){return u(),d("svg",Me,o[0]||(o[0]=[e("path",{d:"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"},null,-1),e("path",{d:"M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"},null,-1)]))}const Ve=["disabled"],Te={class:"card mt-2"},Ae={class:"card-body p-2"},De={class:"text-secondary me-1"},Se={class:"text-secondary me-1"},qe=["innerHTML"],Fe=["title"],He={class:"card mt-2"},ze={class:"card-body p-2"},Oe={class:"text-secondary me-1"},Be={class:"text-secondary me-1"},Ee=["innerHTML"],Ue=["title"],Ne={key:0,class:"alert alert-danger mt-2"},Pe={class:"card mt-2"},Ie={class:"card-header p-2"},Re={key:0},Ge=["href"],Ke={class:"card-body p-2"},Je=z({__name:"ltFileDetails",props:U({file:{}},{coordinates:{required:!0},coordinatesModifiers:{},objectLocation:{required:!0},objectLocationModifiers:{}}),emits:["update:coordinates","update:objectLocation"],setup(b){const o=q(b,"coordinates"),_=q(b,"objectLocation"),h=b,k=x(void 0),w=x(!1),L=x(!1),r=D(()=>$(`Camera location via
<a href="https://commons.wikimedia.org/wiki/Template:Location" target="_blank"><code class="mediawiki-template">Location</code></a>`)),n=D(()=>$(`Object location via
<a href="https://commons.wikimedia.org/wiki/Template:Object_location" target="_blank"><code class="mediawiki-template">Object location</code></a>`)),i=D(()=>{var t;return $("Failed to save: {{$ctrl.error.statusText}}").replace("{{$ctrl.error.statusText}}",(t=k.value)==null?void 0:t.statusText)});function a(t){var l,p;return k.value=void 0,t===void 0&&(t=[],(l=o.value)!=null&&l.isChanged&&t.push(o.value),(p=_.value)!=null&&p.isChanged&&t.push(_.value)),ee(h.file,t).then(()=>{t.forEach(g=>{g.type==="Location"?o.value=g.commit():g.type==="Object location"&&(_.value=g.commit())})},g=>{k.value=g})}return(t,l)=>{var p,g;return u(),d(B,null,[e("button",{class:"btn btn-success form-control",type:"button",disabled:!((p=o.value)!=null&&p.isChanged||(g=_.value)!=null&&g.isChanged),onClick:l[0]||(l[0]=y=>a())},[m(f(J),{class:"me-1"}),P(" "+T(f($)("Save")),1)],8,Ve),e("div",Te,[e("div",Ae,[e("div",null,[e("label",{onClick:l[1]||(l[1]=y=>w.value=!w.value)},[C(e("span",De,"▼",512),[[A,!w.value]]),C(e("span",Se,"▶",512),[[A,w.value]]),m(f(W),{class:"me-1"}),e("span",{innerHTML:r.value},null,8,qe),C(e("abbr",{title:f($)("Left click on map to set the location.")},[m(f(G))],8,Fe),[[A,!w.value]])]),C(e("div",null,[m(R,{modelValue:o.value,"onUpdate:modelValue":l[2]||(l[2]=y=>o.value=y),onEditLocation:l[3]||(l[3]=y=>a([o.value]))},null,8,["modelValue"])],512),[[A,!w.value]])])])]),e("div",He,[e("div",ze,[e("div",null,[e("label",{onClick:l[4]||(l[4]=y=>L.value=!L.value)},[C(e("span",Oe,"▼",512),[[A,!L.value]]),C(e("span",Be,"▶",512),[[A,L.value]]),m(f(Q),{class:"me-1"}),e("span",{innerHTML:n.value},null,8,Ee),C(e("abbr",{title:f($)("Press shift and click on map to set the object location.")},[m(f(G))],8,Ue),[[A,!L.value]])]),C(e("div",null,[m(R,{modelValue:_.value,"onUpdate:modelValue":l[5]||(l[5]=y=>_.value=y),onEditLocation:l[6]||(l[6]=y=>a([_.value]))},null,8,["modelValue"])],512),[[A,!L.value]])])])]),k.value?(u(),d("div",Ne,[m(f(X),{class:"me-1"}),e("span",null,T(i.value),1)])):j("",!0),e("div",Pe,[e("h5",Ie,[e("strong",null,T(t.file.file),1),l[7]||(l[7]=P(" "+T(" ")+" ")),t.file.url?(u(),d("small",Re,[e("a",{href:t.file.url,target:"_blank"},[m(f(fe))],8,Ge)])):j("",!0)]),e("div",Ke,[m(ve,{file:t.file},null,8,["file"])])])],64)}}}),We=`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-fill" viewBox="0 0 16 16">
  <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z"/>
  <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z"/>
</svg>`,Xe=z({__name:"ltMap",props:{coordinates:{required:!0},coordinatesModifiers:{},objectLocation:{required:!0},objectLocationModifiers:{}},emits:U(["mapViewChanged"],["update:coordinates","update:objectLocation"]),setup(b){const o=q(b,"coordinates"),_=q(b,"objectLocation"),h=x(null);K(()=>{const{map:n}=pe(h);n.on("click",i=>w(i)),E(o,k(n),{immediate:!0}),E(_,k(n),{immediate:!0})});function k(n){let i;return a=>{const{lat:t,lng:l}=a;if(a.isDefined&&i)n.setView({lat:t,lng:l}),i.setLatLng({lat:t,lng:l});else if(a.isDefined){n.setView({lat:t,lng:l});const p=I.divIcon({className:"b-0",html:`<div title="Object location" style="color: red">${We}</div>`,iconAnchor:[6,6],iconSize:[12,12]});i=I.marker({lat:t,lng:l},a.type==="Location"?{draggable:!0}:{draggable:!0,icon:p}).on("moveend",g=>L(g,a)).addTo(n)}else i&&(i.remove(),i=void 0)}}function w(n){const{latlng:{lat:i,lng:a},originalEvent:{shiftKey:t}}=n;!i||!a||r(t?"Object location":"Location",i,a)}function L(n,i){const{lat:a,lng:t}=n.target.getLatLng();!a||!t||r(i.type,a,t)}function r(n,i,a){n==="Object location"?_.value=_.value.withLatLng(i,a).roundToPrecision():o.value=o.value.withLatLng(i,a).roundToPrecision()}return(n,i)=>(u(),d("div",{ref_key:"mapRef",ref:h,class:"map fill",style:{"min-height":"300px"}},null,512))}}),Qe={xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",fill:"currentColor",class:"bi bi-search",viewBox:"0 0 16 16"};function Ye(b,o){return u(),d("svg",Qe,o[0]||(o[0]=[e("path",{d:"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"},null,-1)]))}const Ze={key:0,class:"row mt-3"},et={class:"col-sm-12"},tt={class:"jumbotron"},ot={key:1,class:"row mt-3"},lt={class:"col-sm-12"},st={class:"alert alert-warning"},at=["innerHTML"],nt=["innerHTML"],it={key:2,class:"row flex-grow-1 mt-3",style:{"--bs-gutter-x":"0.5rem"}},rt={class:"col-lg-3 col-xl-2 mt-3 mt-lg-0 fill col-lg-h40",style:{"overflow-y":"scroll","overflow-x":"hidden"}},ct={class:"progress"},ut={class:"form-group"},dt={class:"checkbox"},vt={class:"input-group"},ft={class:"input-group-text"},mt={class:"list-group"},pt=["onClick"],gt={key:0,title:"Location ✔"},ht={key:1,title:"Object location ✔"},bt={key:0,class:"col-lg-9 col-xl-3 mt-3 mt-lg-0 fill col-lg-h40",style:{"overflow-y":"scroll","overflow-x":"hidden"}},_t={class:"row"},wt={class:"col-lg-5 col-xl-12"},Lt={class:"col-lg-7 col-xl-12 mt-2"},yt={key:1,class:"col-lg-12 col-xl-7 mt-3 mt-lg-0 fill col-lg-h60"},Vt=z({__name:"ltGeolocate",setup(b){const o=ae(),_=o.query.category,h=o.query.user,k=x(),w=x(""),L=x(!1),r=x(void 0),n=x(void 0),i=x(!1);ge(he(),$("Geolocate files")),K(()=>{const s=re(o.query),c=s.then(M=>ce(M)).then(M=>{n.value=M.sort((S,V)=>S.file.localeCompare(V.file)),L.value=n.value.length<=5,r.value=t.value[0]});i.value=!0,Promise.all([s,c]).finally(()=>i.value=!1)}),E(r,s=>s&&y(s));function a(s){return s.coordinates.isDefinedAndSaved||s.objectLocation.isDefinedAndSaved}const t=D(()=>{let s=n.value||[];return s=L.value?s:s.filter(c=>!a(c)),s=s.filter(c=>JSON.stringify(c).includes(w.value)),s}),l=D(()=>n.value?n.value.filter(s=>a(s)):[]),p=D(()=>100*l.value.length/(n.value||[]).length);function g(s){const c=t.value,M=F(s);if(M===void 0||r.value===void 0)return;const S=c.indexOf(r.value),V=M+S;if(V>=0&&c[V]){r.value=c[V];const v=s.target;window.requestAnimationFrame(()=>{var O,H,N;return(N=(H=(O=v.querySelectorAll(".list-group-item"))==null?void 0:O[V])==null?void 0:H.scrollIntoView)==null?void 0:N.call(H,{block:"center"})})}}function y(s){k.value=void 0,s!=null&&s.pageid&&ue(s.pageid).then(c=>{Object.assign(s,c)})}function F(s){if(s&&s.key)switch(s.key){case"Right":case"ArrowRight":case"Down":case"ArrowDown":return s.preventDefault(),1;case"Left":case"ArrowLeft":case"Up":case"ArrowUp":return s.preventDefault(),-1}}const Y=D(()=>$("Fetched 0 files for category <code>{{$ctrl.category}}</code>!").replace("{{$ctrl.category}}",_)),Z=D(()=>$("Fetched 0 files for user <code>{{$ctrl.user}}</code>!").replace("{{$ctrl.user}}",h));return(s,c)=>{var M,S,V;return u(),d(B,null,[i.value?(u(),d("div",Ze,[e("div",et,[e("div",tt,[e("p",null,T(f($)("Loading file details …")),1),m(de)])])])):j("",!0),!i.value&&!((M=n.value)!=null&&M.length)?(u(),d("div",ot,[e("div",lt,[e("div",st,[m(f(X),{class:"me-1"}),f(_)?(u(),d("span",{key:0,innerHTML:Y.value},null,8,at)):j("",!0),f(h)?(u(),d("span",{key:1,innerHTML:Z.value},null,8,nt)):j("",!0)])])])):j("",!0),!i.value&&((S=n.value)!=null&&S.length)?(u(),d("div",it,[e("div",rt,[e("div",ct,[e("div",{class:"progress-bar",role:"progressbar",style:te({width:p.value+"%"})},T(l.value.length)+" / "+T((V=n.value)==null?void 0:V.length),5)]),e("div",ut,[e("div",dt,[e("label",null,[C(e("input",{"onUpdate:modelValue":c[0]||(c[0]=v=>L.value=v),type:"checkbox"},null,512),[[oe,L.value]]),e("span",null,T(f($)("Also show geolocated files")),1)])])]),e("div",vt,[e("div",ft,[m(f(Ye))]),C(e("input",{"onUpdate:modelValue":c[1]||(c[1]=v=>w.value=v),class:"form-control",type:"text"},null,512),[[le,w.value]])]),e("div",{tabindex:"1",onKeydown:c[2]||(c[2]=v=>g(v))},[e("ul",mt,[(u(!0),d(B,null,se(t.value,v=>(u(),d("li",{key:v.file,class:ne(["list-group-item py-1 px-2 text-truncate",{"list-group-item-info":r.value===v}]),role:"button",onClick:O=>r.value=v},[v.coordinates.isDefinedAndSaved?(u(),d("abbr",gt,[m(f(W),{class:"me-1"})])):j("",!0),v.objectLocation.isDefinedAndSaved?(u(),d("abbr",ht,[m(f(Q),{class:"me-1"})])):j("",!0),e("span",null,T(v.file),1)],10,pt))),128))])],32)]),r.value?(u(),d("div",bt,[e("div",_t,[e("div",wt,[m(Je,{coordinates:r.value.coordinates,"onUpdate:coordinates":c[3]||(c[3]=v=>r.value.coordinates=v),"object-location":r.value.objectLocation,"onUpdate:objectLocation":c[4]||(c[4]=v=>r.value.objectLocation=v),file:r.value},null,8,["coordinates","object-location","file"])]),e("div",Lt,[m(me,{file:r.value},null,8,["file"])])])])):j("",!0),r.value?(u(),d("div",yt,[m(Xe,{coordinates:r.value.coordinates,"onUpdate:coordinates":c[5]||(c[5]=v=>r.value.coordinates=v),"object-location":r.value.objectLocation,"onUpdate:objectLocation":c[6]||(c[6]=v=>r.value.objectLocation=v)},null,8,["coordinates","object-location"])])):j("",!0)])):j("",!0)],64)}}});export{Vt as default};
//# sourceMappingURL=B_rcMgyyRTAJwSXZdKN.js.map