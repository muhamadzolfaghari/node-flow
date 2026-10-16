const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/jszip.min--hjbIGBr.js","assets/vendor-react-Kq6GtrIj.js","assets/vendor-ui-Df4SqoBz.js"])))=>i.map(i=>d[i]);
import{j as $,O as X,Q as W,V as _,X as G,Y as H,Z as Y,_ as q,$ as V}from"./vendor-react-Kq6GtrIj.js";import{c as C,_ as M}from"./index-CwU2eSk_.js";import{B as Z}from"./ui-DANgGdYj.js";import{embedSourceInSvg as J}from"./svg-metadata-DemCTHvq.js";function it({...u}){return $.jsx(X,{"data-slot":"dialog",...u})}function Q({...u}){return $.jsx(q,{"data-slot":"dialog-portal",...u})}function K({className:u,...t}){return $.jsx(V,{"data-slot":"dialog-overlay",className:C("fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",u),...t})}function st({className:u,children:t,showCloseButton:n=!0,...e}){return $.jsxs(Q,{"data-slot":"dialog-portal",children:[$.jsx(K,{}),$.jsxs(W,{"data-slot":"dialog-content",className:C("fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg",u),...e,children:[t,n&&$.jsxs(_,{"data-slot":"dialog-close",className:"absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",children:[$.jsx(G,{}),$.jsx("span",{className:"sr-only",children:"Close"})]})]})]})}function rt({className:u,...t}){return $.jsx("div",{"data-slot":"dialog-header",className:C("flex flex-col gap-2 text-center sm:text-left",u),...t})}function lt({className:u,showCloseButton:t=!1,children:n,...e}){return $.jsxs("div",{"data-slot":"dialog-footer",className:C("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",u),...e,children:[n,t&&$.jsx(_,{asChild:!0,children:$.jsx(Z,{variant:"outline",children:"Close"})})]})}function dt({className:u,...t}){return $.jsx(H,{"data-slot":"dialog-title",className:C("text-lg leading-none font-semibold",u),...t})}function ct({className:u,...t}){return $.jsx(Y,{"data-slot":"dialog-description",className:C("text-sm text-muted-foreground",u),...t})}const tt=`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  text, .node text, .label text {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    letter-spacing: -0.01em !important;
  }
  .node text, .node .label {
    font-weight: 600 !important;
    font-size: 13.5px !important;
  }
  g.node rect, g.node polygon, g.node circle, g.node ellipse, .label-container {
    rx: 10px !important;
    ry: 10px !important;
    stroke-width: 1.75px !important;
  }
  g.nodes > g.node:nth-of-type(6n+1):not([style*="fill"]) rect,
  g.nodes > g.node:nth-of-type(6n+1):not([style*="fill"]) polygon,
  g.nodes > g.node:nth-of-type(6n+1):not([style*="fill"]) circle,
  g.nodes > g.node:nth-of-type(6n+1):not([style*="fill"]) .label-container {
    fill: #0c1e33 !important;
    stroke: #38bdf8 !important;
  }
  g.nodes > g.node:nth-of-type(6n+2):not([style*="fill"]) rect,
  g.nodes > g.node:nth-of-type(6n+2):not([style*="fill"]) polygon,
  g.nodes > g.node:nth-of-type(6n+2):not([style*="fill"]) circle,
  g.nodes > g.node:nth-of-type(6n+2):not([style*="fill"]) .label-container {
    fill: #1a1638 !important;
    stroke: #818cf8 !important;
  }
  g.nodes > g.node:nth-of-type(6n+3):not([style*="fill"]) rect,
  g.nodes > g.node:nth-of-type(6n+3):not([style*="fill"]) polygon,
  g.nodes > g.node:nth-of-type(6n+3):not([style*="fill"]) circle,
  g.nodes > g.node:nth-of-type(6n+3):not([style*="fill"]) .label-container {
    fill: #08241b !important;
    stroke: #34d399 !important;
  }
  g.nodes > g.node:nth-of-type(6n+4):not([style*="fill"]) rect,
  g.nodes > g.node:nth-of-type(6n+4):not([style*="fill"]) polygon,
  g.nodes > g.node:nth-of-type(6n+4):not([style*="fill"]) circle,
  g.nodes > g.node:nth-of-type(6n+4):not([style*="fill"]) .label-container {
    fill: #261908 !important;
    stroke: #fbbf24 !important;
  }
  g.nodes > g.node:nth-of-type(6n+5):not([style*="fill"]) rect,
  g.nodes > g.node:nth-of-type(6n+5):not([style*="fill"]) polygon,
  g.nodes > g.node:nth-of-type(6n+5):not([style*="fill"]) circle,
  g.nodes > g.node:nth-of-type(6n+5):not([style*="fill"]) .label-container {
    fill: #280e1c !important;
    stroke: #fb7185 !important;
  }
  g.nodes > g.node:nth-of-type(6n+6):not([style*="fill"]) rect,
  g.nodes > g.node:nth-of-type(6n+6):not([style*="fill"]) polygon,
  g.nodes > g.node:nth-of-type(6n+6):not([style*="fill"]) circle,
  g.nodes > g.node:nth-of-type(6n+6):not([style*="fill"]) .label-container {
    fill: #0a2530 !important;
    stroke: #22d3ee !important;
  }
  g.node path:not(.flowchart-link) {
    stroke-width: 1.75px !important;
    stroke: #818cf8 !important;
    fill: #1a1638 !important;
  }
  path.flowchart-link, .edgePath path, .messageLine0, .messageLine1 {
    stroke: #38bdf8 !important;
    stroke-width: 2px !important;
    stroke-linecap: round !important;
    stroke-linejoin: round !important;
  }
  marker path, marker polygon {
    fill: #38bdf8 !important;
    stroke: #38bdf8 !important;
  }
  .edgeLabel {
    background-color: #0f172a !important;
    border-radius: 9999px !important;
    padding: 3px 10px !important;
    border: 1px solid rgba(56, 189, 248, 0.4) !important;
    color: #e0f2fe !important;
    font-size: 11px !important;
    font-weight: 600 !important;
  }
  .mindmap-node rect, .mindmap-node circle, g.classGroup rect {
    rx: 10px !important;
    ry: 10px !important;
    stroke-width: 1.75px !important;
  }
  .actor {
    rx: 10px !important;
    ry: 10px !important;
    stroke: #818cf8 !important;
    fill: #161c33 !important;
  }
  .note {
    rx: 8px !important;
    ry: 8px !important;
    stroke: #fbbf24 !important;
    fill: #261908 !important;
  }
  g.cluster rect {
    rx: 14px !important;
    ry: 14px !important;
    stroke-width: 1.5px !important;
    stroke: #38bdf866 !important;
    fill-opacity: 0.14 !important;
  }
`;class pt{static sanitizeFilename(t){return(t||"diagram").toLowerCase().replace(/[^a-z0-9_-]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")||"mermaid-diagram"}static downloadBlob(t,n){const e=URL.createObjectURL(t),o=document.createElement("a");o.href=e,o.download=n,document.body.appendChild(o),o.click(),document.body.removeChild(o),setTimeout(()=>URL.revokeObjectURL(e),600)}static downloadSource(t,n="diagram"){const e=`${this.sanitizeFilename(n)}.mmd`,o=new Blob([t],{type:"text/vnd.mermaid;charset=utf-8"});this.downloadBlob(o,e)}static getCleanSvgString(t,n={}){var v;if(!t)return null;const{background:e="transparent",padding:o=0}=n,a=t.cloneNode(!0);a.getAttribute("xmlns")||a.setAttribute("xmlns","http://www.w3.org/2000/svg"),a.getAttribute("xmlns:xlink")||a.setAttribute("xmlns:xlink","http://www.w3.org/1999/xlink");let l=a.querySelector("defs");l||(l=document.createElementNS("http://www.w3.org/2000/svg","defs"),a.insertBefore(l,a.firstChild));const r=document.createElementNS("http://www.w3.org/2000/svg","style");r.textContent=tt,l.appendChild(r);const i=(v=t.viewBox)==null?void 0:v.baseVal;let g=(i==null?void 0:i.width)||t.clientWidth||1200,p=(i==null?void 0:i.height)||t.clientHeight||800;if(o>0){const w=((i==null?void 0:i.x)||0)-o,k=((i==null?void 0:i.y)||0)-o,h=g+o*2,c=p+o*2;if(a.setAttribute("viewBox",`${w} ${k} ${h} ${c}`),a.setAttribute("width",`${h}`),a.setAttribute("height",`${c}`),e&&e!=="transparent"){const s=document.createElementNS("http://www.w3.org/2000/svg","rect");s.setAttribute("x",`${w}`),s.setAttribute("y",`${k}`),s.setAttribute("width",`${h}`),s.setAttribute("height",`${c}`);const d=typeof e=="string"&&(e.startsWith("radial")||e.startsWith("linear"))?"#080c14":e;s.setAttribute("fill",d),a.insertBefore(s,a.firstChild)}}else if(e&&e!=="transparent"){const w=(i==null?void 0:i.x)||0,k=(i==null?void 0:i.y)||0,h=document.createElementNS("http://www.w3.org/2000/svg","rect");h.setAttribute("x",`${w}`),h.setAttribute("y",`${k}`),h.setAttribute("width",`${g}`),h.setAttribute("height",`${p}`);const c=typeof e=="string"&&(e.startsWith("radial")||e.startsWith("linear"))?"#080c14":e;h.setAttribute("fill",c),a.insertBefore(h,a.firstChild)}let m=new XMLSerializer().serializeToString(a);return m.startsWith("<?xml")||(m=`<?xml version="1.0" encoding="UTF-8"?>
`+m),n.source&&(m=J(m,n.source,n.format||"mermaid")),m}static async renderToCanvas(t,n={}){var w;const{scale:e=2,background:o="#080c14",padding:a=32}=n,l=t.querySelector("svg");if(!l)throw new Error("No diagram found to render.");const r=this.getCleanSvgString(l,{background:"transparent",padding:a}),i=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`,g=(w=l.viewBox)==null?void 0:w.baseVal;let p=(g==null?void 0:g.width)||l.clientWidth||1200,y=(g==null?void 0:g.height)||l.clientHeight||800;t.classList.contains("is-gantt")&&(p=Math.max(p,2400));const m=p+a*2,v=y+a*2;return new Promise((k,h)=>{const c=new Image;c.onload=()=>{try{const s=document.createElement("canvas");s.width=Math.round(m*e),s.height=Math.round(v*e);const d=s.getContext("2d");if(!d){h(new Error("Canvas 2D context not available"));return}if(d.imageSmoothingEnabled=!0,d.imageSmoothingQuality="high",o&&o!=="transparent"){if(o==="#080c14"||o==="studio-dark"){const f=d.createLinearGradient(0,0,s.width,s.height);f.addColorStop(0,"#0f172a"),f.addColorStop(.5,"#0a0f1d"),f.addColorStop(1,"#050811"),d.fillStyle=f}else if(o==="ambient"||typeof o=="string"&&o.startsWith("radial")){const f=s.width/2,x=s.height/2,B=Math.max(f,x),b=d.createRadialGradient(f,x,0,f,x,B);b.addColorStop(0,"#172554"),b.addColorStop(1,"#030712"),d.fillStyle=b}else try{d.fillStyle=o}catch{d.fillStyle="#080c14"}d.fillRect(0,0,s.width,s.height)}else d.clearRect(0,0,s.width,s.height);d.scale(e,e),d.drawImage(c,0,0,m,v),k({canvas:s,width:s.width,height:s.height})}catch(s){h(s)}},c.onerror=()=>{h(new Error("Failed to rasterize diagram SVG into canvas."))},c.src=i})}static async renderToBlob(t,n={}){const{format:e="image/png",quality:o=.95}=n,{canvas:a,width:l,height:r}=await this.renderToCanvas(t,n);return new Promise((i,g)=>{a.toBlob(p=>{p?i({blob:p,width:l,height:r}):g(new Error(`Failed to encode canvas as ${e}`))},e,o)})}static async downloadPng(t,n="diagram",e={}){const o=typeof e=="number"?{scale:e}:e,{blob:a}=await this.renderToBlob(t,{scale:2,background:"#080c14",padding:32,...o,format:"image/png"}),l=`${this.sanitizeFilename(n)}.png`;this.downloadBlob(a,l)}static async downloadWebp(t,n="diagram",e={}){const{blob:o}=await this.renderToBlob(t,{scale:2,background:"#080c14",padding:32,...e,format:"image/webp"}),a=`${this.sanitizeFilename(n)}.webp`;this.downloadBlob(o,a)}static async downloadJpeg(t,n="diagram",e={}){const{blob:o}=await this.renderToBlob(t,{scale:2,background:"#ffffff",padding:32,...e,format:"image/jpeg",quality:.95}),a=`${this.sanitizeFilename(n)}.jpg`;this.downloadBlob(o,a)}static downloadSvg(t,n="diagram",e={}){const o=t.querySelector("svg");if(!o)throw new Error("No diagram found to export.");const a=this.getCleanSvgString(o,e),l=new Blob([a],{type:"image/svg+xml;charset=utf-8"}),r=`${this.sanitizeFilename(n)}.svg`;this.downloadBlob(l,r)}static async copyImageToClipboard(t,n={}){if(typeof navigator>"u"||!navigator.clipboard||typeof ClipboardItem>"u")throw new Error("Direct image clipboard copying is not supported in this browser.");const{blob:e}=await this.renderToBlob(t,{scale:2,background:"#080c14",padding:24,...n,format:"image/png"}),o=new ClipboardItem({"image/png":e});return await navigator.clipboard.write([o]),!0}static async downloadPdf(t,n="diagram",e={}){const{pageSize:o="fit",background:a="#ffffff",padding:l=32}=e,{blob:r,width:i,height:g}=await this.renderToBlob(t,{scale:3,background:a,padding:l,format:"image/jpeg",quality:.96}),p=await r.arrayBuffer(),y=new Uint8Array(p),m=this.synthesizePdfFromJpeg(y,i,g,{pageSize:o,title:n}),v=new Blob([m],{type:"application/pdf"}),w=`${this.sanitizeFilename(n)}.pdf`;this.downloadBlob(v,w)}static async downloadPptx(t,n="diagram",e={}){const{background:o="#ffffff",padding:a=32}=e,{blob:l,width:r,height:i}=await this.renderToBlob(t,{scale:3,background:o,padding:a,format:"image/png"}),g=(await M(async()=>{const{default:x}=await import("./jszip.min--hjbIGBr.js").then(B=>B.j);return{default:x}},__vite__mapDeps([0,1,2]))).default,p=new g,y=12192e3,m=6858e3,v=y-1219200,w=m-1219200,k=Math.min(v/r,w/i),h=Math.round(r*k),c=Math.round(i*k),s=Math.round((y-h)/2),d=Math.round((m-c)/2);p.file("[Content_Types].xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`),p.file("_rels/.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`),p.file("ppt/_rels/presentation.xml.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>`),p.file("ppt/presentation.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst/>
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
  </p:sldIdLst>
  <p:sldSz cx="${y}" cy="${m}" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`),p.file("ppt/slides/_rels/slide1.xml.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/>
</Relationships>`),p.file("ppt/slides/slide1.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="2" name="${this.sanitizeFilename(n)}"/>
          <p:cNvPicPr>
            <a:picLocks noChangeAspect="1"/>
          </p:cNvPicPr>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="rId1"/>
          <a:stretch>
            <a:fillRect/>
          </a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm>
            <a:off x="${s}" y="${d}"/>
            <a:ext cx="${h}" cy="${c}"/>
          </a:xfrm>
          <a:prstGeom prst="rect">
            <a:avLst/>
          </a:prstGeom>
        </p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`),p.file("ppt/media/image1.png",l);const f=await p.generateAsync({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.presentationml.presentation"});this.downloadBlob(f,`${this.sanitizeFilename(n)}.pptx`)}static async downloadProjectDeckPptx(t,n="Project Presentation",e={}){const{background:o="#ffffff",padding:a=32}=e,l=(await M(async()=>{const{default:c}=await import("./jszip.min--hjbIGBr.js").then(s=>s.j);return{default:c}},__vite__mapDeps([0,1,2]))).default,r=new l,i=12192e3,g=6858e3,p=i-1219200,y=g-1219200,m=[];for(let c=0;c<t.length;c++){const s=t[c];let d=s.blob,f=s.width,x=s.height;if(!d&&s.container)try{const B=await this.renderToBlob(s.container,{scale:3,background:o,padding:a,format:"image/png"});d=B.blob,f=B.width,x=B.height}catch(B){console.warn(`Could not render slide ${c+1}:`,B)}d&&f&&x&&m.push({title:s.title||`Slide ${c+1}`,blob:d,width:f,height:x})}if(m.length===0)throw new Error("No valid slides available to generate presentation deck.");let v=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
`,w=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
`,k=`<p:sldIdLst>
`;r.file("_rels/.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`),m.forEach((c,s)=>{const d=s+1,f=`rId${d}`;v+=`  <Override PartName="/ppt/slides/slide${d}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
`,w+=`  <Relationship Id="${f}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${d}.xml"/>
`,k+=`    <p:sldId id="${256+s}" r:id="${f}"/>
`;const x=Math.min(p/c.width,y/c.height),B=Math.round(c.width*x),b=Math.round(c.height*x),P=Math.round((i-B)/2),T=Math.round((g-b)/2);r.file(`ppt/slides/_rels/slide${d}.xml.rels`,`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${d}.png"/>
</Relationships>`),r.file(`ppt/slides/slide${d}.xml`,`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="2" name="${this.sanitizeFilename(c.title)}"/>
          <p:cNvPicPr>
            <a:picLocks noChangeAspect="1"/>
          </p:cNvPicPr>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="rId1"/>
          <a:stretch>
            <a:fillRect/>
          </a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm>
            <a:off x="${P}" y="${T}"/>
            <a:ext cx="${B}" cy="${b}"/>
          </a:xfrm>
          <a:prstGeom prst="rect">
            <a:avLst/>
          </a:prstGeom>
        </p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`),r.file(`ppt/media/image${d}.png`,c.blob)}),v+="</Types>",w+="</Relationships>",k+="  </p:sldIdLst>",r.file("[Content_Types].xml",v),r.file("ppt/_rels/presentation.xml.rels",w),r.file("ppt/presentation.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst/>
  ${k}
  <p:sldSz cx="${i}" cy="${g}" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`);const h=await r.generateAsync({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.presentationml.presentation"});this.downloadBlob(h,`${this.sanitizeFilename(n)}_presentation_deck.pptx`)}static downloadIllustratorSvg(t,n,e={}){const o=t==null?void 0:t.querySelector("svg");if(!o)return;let l=this.getCleanSvgString(o,e);l.includes("xmlns:i=")||(l=l.replace("<svg ",'<svg xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" xmlns:x="http://ns.adobe.com/Extensibility/1.0/" '));const r=new Blob([l],{type:"image/svg+xml;charset=utf-8"});this.downloadBlob(r,`${this.sanitizeFilename(n)}_illustrator.svg`)}static synthesizePdfFromJpeg(t,n,e,o={}){const{pageSize:a="fit",title:l="Mermaid Diagram"}=o;let r,i,g,p,y,m;const v={"a4-landscape":{w:841.89,h:595.28},"a4-portrait":{w:595.28,h:841.89},"letter-landscape":{w:792,h:612},"letter-portrait":{w:612,h:792}};if(v[a]){r=v[a].w,i=v[a].h;const S=36,D=r-S*2,E=i-S*2,I=n/e;D/E>I?(m=E,y=E*I):(y=D,m=D/I),g=(r-y)/2,p=(i-m)/2}else y=Math.max(200,n*.48),m=Math.max(150,e*.48),r=y+48,i=m+48,g=24,p=24;const w=r.toFixed(2),k=i.toFixed(2),h=g.toFixed(2),c=p.toFixed(2),s=y.toFixed(2),d=m.toFixed(2),f=[],x=[],B=new TextEncoder;function b(S){f.push(B.encode(S))}function P(S){f.push(S)}function T(){return f.reduce((S,D)=>S+D.length,0)}b(`%PDF-1.4
%âãÏÓ
`),x[1]=T(),b(`1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
`),x[2]=T(),b(`2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
`),x[3]=T(),b(`3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${k}] /Resources << /XObject << /Im1 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>
endobj
`),x[4]=T(),b(`4 0 obj
<< /Type /XObject /Subtype /Image /Width ${n} /Height ${e} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${t.length} >>
stream
`),P(t),b(`
endstream
endobj
`),x[5]=T();const z=`q
${s} 0 0 ${d} ${h} ${c} cm
/Im1 Do
Q
`,N=B.encode(z);b(`5 0 obj
<< /Length ${N.length} >>
stream
${z}endstream
endobj
`),x[6]=T();const L=(l||"Mermaid Diagram").replace(/[()\\]/g,""),O=new Date().toISOString().replace(/[-:T]/g,"").slice(0,14);b(`6 0 obj
<< /Title (${L}) /Creator (NodeFlow) /Producer (NodeFlow PDF Engine) /CreationDate (D:${O}Z) >>
endobj
`);const A=T();b(`xref
0 7
0000000000 65535 f 
`);for(let S=1;S<=6;S++){const D=String(x[S]).padStart(10,"0");b(`${D} 00000 n 
`)}b(`trailer
<< /Size 7 /Root 1 0 R /Info 6 0 R >>
startxref
${A}
%%EOF
`);const U=T(),R=new Uint8Array(U);let j=0;for(const S of f)R.set(S,j),j+=S.length;return R}static downloadStandaloneHtml(t,n,e="diagram"){const o=t.querySelector("svg");if(!o)throw new Error("No diagram found to export.");const a=this.getCleanSvgString(o,{background:"transparent"}),l=e||"Mermaid Diagram",r=`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${F(l)} — Interactive NodeFlow View</title>
  <style>
    :root {
      --bg: #080c14;
      --surface: #0e1626;
      --surface-hover: #1f3252;
      --border: #22324b;
      --text: #f0f6fc;
      --text-muted: #94a3b8;
      --primary: #6366f1;
    }
    body.light {
      --bg: #f8fafc;
      --surface: #ffffff;
      --surface-hover: #f1f5f9;
      --border: #cbd5e1;
      --text: #0f172a;
      --text-muted: #64748b;
      --primary: #4f46e5;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #header { position: fixed; top: 0; left: 0; right: 0; height: 50px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 20; backdrop-filter: blur(8px); }
    .title-row { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; }
    .badge { font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
    .nav-actions { display: flex; align-items: center; gap: 8px; }
    button { background: var(--surface); border: 1px solid var(--border); color: var(--text); border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s ease; }
    button:hover { background: var(--surface-hover); border-color: var(--primary); }
    #viewport { width: 100vw; height: calc(100vh - 50px); margin-top: 50px; overflow: hidden; position: relative; cursor: grab; background-image: radial-gradient(var(--border) 1px, transparent 1px); background-size: 24px 24px; }
    #viewport:active { cursor: grabbing; }
    #canvas { position: absolute; transform-origin: 0 0; will-change: transform; user-select: none; }
    #canvas svg { display: block; overflow: visible; }
    #dock { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 6px 10px; display: flex; gap: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); z-index: 30; }
    #sourceDrawer { position: fixed; bottom: 0; left: 0; right: 0; max-height: 40vh; background: var(--surface); border-top: 1px solid var(--border); padding: 16px; display: none; z-index: 40; box-shadow: 0 -8px 32px rgba(0,0,0,0.5); }
    #sourceDrawer.open { display: flex; flex-direction: column; }
    #sourceDrawer pre { background: var(--bg); border: 1px solid var(--border); padding: 12px; border-radius: 8px; overflow: auto; font-family: monospace; font-size: 12px; flex: 1; margin-top: 8px; }
  </style>
</head>
<body>
  <header id="header">
    <div class="title-row">
      <span>${F(l)}</span>
      <span class="badge">NodeFlow Standalone</span>
    </div>
    <div class="nav-actions">
      <button id="toggleThemeBtn" type="button">🌓 Theme</button>
      <button id="toggleSourceBtn" type="button">📄 Mermaid Source</button>
      <button id="fullscreenBtn" type="button">⛶ Fullscreen</button>
    </div>
  </header>

  <div id="viewport">
    <div id="canvas">
      ${a}
    </div>
  </div>

  <div id="dock">
    <button id="zoomOutBtn" type="button" title="Zoom Out ( - )">−</button>
    <button id="zoomResetBtn" type="button" title="Reset Zoom ( 0 )">100%</button>
    <button id="zoomInBtn" type="button" title="Zoom In ( + )">+</button>
    <button id="fitBtn" type="button" title="Fit to Viewport ( F )">Fit</button>
    <button id="centerBtn" type="button" title="Center ( C )">Center</button>
  </div>

  <div id="sourceDrawer">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <strong style="font-size: 13px;">Mermaid Diagram Definition</strong>
      <div style="display: flex; gap: 8px;">
        <button id="copySourceBtn" type="button">📋 Copy Code</button>
        <button id="closeSourceBtn" type="button">✕ Close</button>
      </div>
    </div>
    <pre><code>${F(n)}</code></pre>
  </div>

  <script>
    (function() {
      const viewport = document.getElementById('viewport');
      const canvas = document.getElementById('canvas');
      const svg = canvas.querySelector('svg');
      let x = 40, y = 40, scale = 1;
      let isDragging = false, startX = 0, startY = 0;

      function update() {
        canvas.style.transform = \`translate(\${x}px, \${y}px) scale(\${scale})\`;
        document.getElementById('zoomResetBtn').textContent = Math.round(scale * 100) + '%';
      }

      function fit() {
        if (!svg) return;
        const vw = viewport.clientWidth;
        const vh = viewport.clientHeight;
        const box = svg.getBBox();
        if (box.width === 0 || box.height === 0) return;
        const scaleX = (vw - 80) / box.width;
        const scaleY = (vh - 80) / box.height;
        scale = Math.min(scaleX, scaleY, 2.5);
        scale = Math.max(scale, 0.15);
        x = (vw - box.width * scale) / 2 - box.x * scale;
        y = (vh - box.height * scale) / 2 - box.y * scale;
        update();
      }

      viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('#dock, #sourceDrawer, #header')) return;
        isDragging = true;
        startX = e.clientX - x;
        startY = e.clientY - y;
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        x = e.clientX - startX;
        y = e.clientY - startY;
        update();
      });

      window.addEventListener('mouseup', () => { isDragging = false; });

      viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.15 : 0.85;
        const newScale = Math.min(Math.max(scale * factor, 0.1), 5);
        const rect = viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        x = mouseX - (mouseX - x) * (newScale / scale);
        y = mouseY - (mouseY - y) * (newScale / scale);
        scale = newScale;
        update();
      }, { passive: false });

      document.getElementById('zoomInBtn').onclick = () => { scale = Math.min(scale * 1.2, 5); update(); };
      document.getElementById('zoomOutBtn').onclick = () => { scale = Math.max(scale / 1.2, 0.1); update(); };
      document.getElementById('zoomResetBtn').onclick = () => { scale = 1; update(); };
      document.getElementById('fitBtn').onclick = fit;
      document.getElementById('centerBtn').onclick = () => {
        if (!svg) return;
        const box = svg.getBBox();
        x = (viewport.clientWidth - box.width * scale) / 2;
        y = (viewport.clientHeight - box.height * scale) / 2;
        update();
      };

      document.getElementById('toggleThemeBtn').onclick = () => {
        document.body.classList.toggle('light');
      };

      const drawer = document.getElementById('sourceDrawer');
      document.getElementById('toggleSourceBtn').onclick = () => {
        drawer.classList.toggle('open');
      };
      document.getElementById('closeSourceBtn').onclick = () => {
        drawer.classList.remove('open');
      };
      document.getElementById('copySourceBtn').onclick = () => {
        navigator.clipboard.writeText(${JSON.stringify(n)});
        alert('Mermaid syntax copied to clipboard!');
      };

      document.getElementById('fullscreenBtn').onclick = () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      };

      setTimeout(fit, 60);
      window.addEventListener('resize', fit);
    })();
  <\/script>
</body>
</html>`,i=new Blob([r],{type:"text/html;charset=utf-8"}),g=`${this.sanitizeFilename(e)}.html`;this.downloadBlob(i,g)}static generateEmbedSnippets(t,n,e="diagram"){const o="```mermaid\n"+t.trim()+"\n```",a=`<pre class="mermaid">
${t.trim()}
</pre>
<script type="module">import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"; mermaid.initialize({ startOnLoad: true });<\/script>`;let l="",r="";const i=n.querySelector("svg");return i&&(r=this.getCleanSvgString(i),l=`data:image/svg+xml;utf8,${encodeURIComponent(r)}`),{markdown:o,html:a,dataUri:l,svg:r}}static async copySvg(t){const n=t.querySelector("svg");if(!n)throw new Error("No diagram found to copy.");const e=this.getCleanSvgString(n);await navigator.clipboard.writeText(e)}static async copyMarkdown(t){const n="```mermaid\n"+t.trim()+"\n```";await navigator.clipboard.writeText(n)}}function F(u){return String(u||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}export{it as D,pt as E,st as a,rt as b,dt as c,ct as d,lt as e};
