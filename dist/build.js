!function(t){var e={};function r(a){if(e[a])return e[a].exports;var i=e[a]={i:a,l:!1,exports:{}};return t[a].call(i.exports,i,i.exports,r),i.l=!0,i.exports}r.m=t,r.c=e,r.d=function(t,e,a){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(r.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)r.d(a,i,function(e){return t[e]}.bind(null,i));return a},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=0)}([function(t,e,r){r(1)},function(t,e,r){if("undefined"==typeof AFRAME)throw new Error("Component attempted to register before AFRAME was available.");var a=r(2);AFRAME.registerComponent("aobake",{schema:{sampleRate:{type:"number",default:3},gamma:{type:"number",default:3},exposure:{type:"number",default:1},distance:{type:"number",default:5},autoApply:{type:"boolean",default:!0}},init:function(){this.baked=!1,this.data.autoApply&&this.el.setAttribute("visible",!1);var t=Array.from(this.el.querySelectorAll("*")),e=[];t.map(t=>{var r,a=t.components;for(r in a)a[r].hasOwnProperty("loader")&&e.push(new Promise(e=>{t.addEventListener("model-loaded",()=>{e()})}))}),Promise.all(e).then(()=>{this.el.emit("children-ready"),this.data.autoApply&&this.applyAO()})},applyAO:function(){this.baked||(new a(this.el.object3D,this.data.sampleRate,this.data.gamma,this.data.exposure,this.data.distance).applyAO(),this.data.autoApply&&this.el.setAttribute("visible",!0),this.el.emit("ao-baked"))}})},function(t,e,r){var a=r(3);const i=1e-10;t.exports=class{constructor(t,e=3,r=3,a=1,i=5){this.graphNode=t,this.sampleRate=e,this.gamma=r,this.exposure=a,this.distance=i,this.normalVector=new THREE.Vector3,this.positionVector=new THREE.Vector3,this.sampleRay=new THREE.Ray,this.sampleCache={},this.buildSamples()}buildSamples(){for(var t=[],e=1/this.sampleRate,r=0;r<=1;r+=e)for(var a=0;a<=1;a+=e){var i=2*(r-.5),s=2*(a-.5);t.push(new THREE.Vector3(i,s,1).normalize()),t.push(new THREE.Vector3(i,s,-1).normalize()),r>0&&r<1&&(t.push(new THREE.Vector3(i,1,s).normalize()),t.push(new THREE.Vector3(i,-1,s).normalize()),a>0&&a<1&&(t.push(new THREE.Vector3(1,i,s).normalize()),t.push(new THREE.Vector3(-1,i,s).normalize())))}this.samples=t}updateTransforms(){this.graphNode.traverse(t=>{t.updateMatrix(),t.updateWorldMatrix()})}getNormalOffset(t,e,r,a,i){return this.normalVector.set(t,e,r).applyMatrix3(a).multiplyScalar(-i)}getAdjustedPosition(t,e,r,a,i){return new THREE.Vector3(t,e,r).applyMatrix4(a).add(i)}scaleTriangle(t){var e=t.a,r=t.b,a=t.c,s=e.clone().add(r).add(a).multiplyScalar(1/3);return e.sub(s).multiplyScalar(1+10*i).add(s),r.sub(s).multiplyScalar(1+10*i).add(s),a.sub(s).multiplyScalar(1+10*i).add(s),t}buildOctree(){this.updateTransforms();var t,e,r,s,o,n,l,h=new a,u=i;this.graphNode.traverse(a=>{if("Mesh"==a.type){a.geometry.index&&(a.geometry=a.geometry.toNonIndexed()),a.material.vertexColors=THREE.VertexColors,t=a.geometry.attributes.position.array,e=a.geometry.attributes.normal.array,r=a.matrixWorld,s=(new THREE.Matrix3).getNormalMatrix(a.matrixWorld);for(let a=0;a<t.length;a+=9){var i=this.getNormalOffset(e[a],e[a+1],e[a+2],s,u);o=this.getAdjustedPosition(t[a],t[a+1],t[a+2],r,i),i=this.getNormalOffset(e[a+3],e[a+4],e[a+5],s,u),n=this.getAdjustedPosition(t[a+3],t[a+4],t[a+5],r,i),i=this.getNormalOffset(e[a+6],e[a+7],e[a+8],s,u),l=this.getAdjustedPosition(t[a+6],t[a+7],t[a+8],r,i),h.addTriangle(this.scaleTriangle(new THREE.Triangle(o,n,l)))}}}),h.build(),this.octree=h}sampleVertex(t,e){var r=JSON.stringify([t,e]),a=0,s=this.samples,o=1/this.samples.length,n=this.sampleRay,l=this.distance,h=this.octree;if(this.sampleCache[r])return this.sampleCache[r];t.add(e.clone().multiplyScalar(10*i));for(let r=0;r<s.length;r++)if(s[r].dot(e)<0)a+=o;else{n.set(t,s[r]);var u=h.rayIntersect(n);a+=u?o*Math.min(1,u*u/l):o}return a*=this.exposure,a=Math.pow(a,this.gamma),this.sampleCache[r]=a,a}applyAO(){this.buildOctree(),this.octree,this.graphNode.traverse(t=>{if("Mesh"==t.type){t.geometry=t.geometry.clone();var e=(new THREE.Matrix3).getNormalMatrix(t.matrixWorld),r=t.geometry.attributes.position.array,a=t.geometry.attributes.normal.array;t.geometry.addAttribute("color",new THREE.BufferAttribute(new Float32Array(r.length),3));var i=t.geometry.attributes.color;i.needsUpdate=!0;var s,o=this.positionVector,n=this.normalVector,l=t.matrixWorld;for(let t=0;t<r.length;t+=3)o.set(r[t],r[t+1],r[t+2]).applyMatrix4(l),n.set(a[t],a[t+1],a[t+2]).applyMatrix3(e),s=this.sampleVertex(o,n),i.array[t]=s,i.array[t+1]=s,i.array[t+2]=s}})}}},function(t,e){class r{constructor(t){this.triangles=[],this.box=t,this.bounds=new THREE.Box3,this.subTrees=[]}addTriangle(t){this.bounds.min.x=Math.min(this.bounds.min.x,t.a.x,t.b.x,t.c.x),this.bounds.min.y=Math.min(this.bounds.min.y,t.a.y,t.b.y,t.c.y),this.bounds.min.z=Math.min(this.bounds.min.z,t.a.z,t.b.z,t.c.z),this.bounds.max.x=Math.max(this.bounds.max.x,t.a.x,t.b.x,t.c.x),this.bounds.max.y=Math.max(this.bounds.max.y,t.a.y,t.b.y,t.c.y),this.bounds.max.z=Math.max(this.bounds.max.z,t.a.z,t.b.z,t.c.z),this.triangles.push(t),this.intersect=new THREE.Vector3}calcBox(){this.box=this.bounds.clone()}split(t){if(this.box){var e,a,i,s=[],o=this.box.max.clone().sub(this.box.min).multiplyScalar(.5);for(let t=0;t<2;t++)for(let i=0;i<2;i++)for(let n=0;n<2;n++)e=new THREE.Box3,a=new THREE.Vector3(t,i,n),e.min=this.box.min.clone().add(a.multiply(o)),e.max=e.min.clone().add(o),s.push(new r(e));for(;i=this.triangles.pop();)for(let t=0;t<s.length;t++)s[t].box.intersectsTriangle(i)&&s[t].addTriangle(i);for(let e=0;e<s.length;e++){var n=s[e].triangles.length;n>8&&t<16&&s[e].split(t+1),0!=n&&this.subTrees.push(s[e])}}}build(){this.calcBox(),this.split(0)}getRayTris(t,e){for(let a=0;a<this.subTrees.length;a++){var r=this.subTrees[a];if(t.intersectBox(r.box,this.intersect))if(r.triangles.length>0)for(let t=0;t<r.triangles.length;t++)-1==e.indexOf(r.triangles[t])&&e.push(r.triangles[t]);else r.getRayTris(t,e)}}rayIntersect(t){if(0!=t.direction.length()){var e,r=[],a=1e100;this.getRayTris(t,r);for(let i=0;i<r.length;i++)(e=t.intersectTriangle(r[i].a,r[i].b,r[i].c,!1,this.intersect))&&(a=Math.min(a,e.sub(t.origin).length()));return a<1e3&&a}}}t.exports=r}]);