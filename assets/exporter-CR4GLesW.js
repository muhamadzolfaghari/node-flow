const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/jszip.min-CG2W26fe.js","assets/vendor-react-CuR4BcWE.js","assets/vendor-ui-Df4SqoBz.js"])))=>i.map(i=>d[i]);
import{j as h,aK as X,aL as H,aM as N,X as W,aN as G,aO as Y,aP as q,aQ as V,aR as J,aS as Z,aT as Q,aU as K,aV as tt,aW as et,aX as nt}from"./vendor-react-CuR4BcWE.js";import{c as $}from"./index-PhlqTsi8.js";import{a as ot}from"./ui-CeDa3Ppl.js";import{_ as M}from"./vendor-mermaid-De2Sn5hg.js";import{embedSourceInSvg as at}from"./svg-metadata-DemCTHvq.js";function gt({...d}){return h.jsx(X,{"data-slot":"dialog",...d})}function it({...d}){return h.jsx(q,{"data-slot":"dialog-portal",...d})}function st({className:d,...t}){return h.jsx(V,{"data-slot":"dialog-overlay",className:$("fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",d),...t})}function ft({className:d,children:t,showCloseButton:e=!0,...n}){return h.jsxs(it,{"data-slot":"dialog-portal",children:[h.jsx(st,{}),h.jsxs(H,{"data-slot":"dialog-content",className:$("fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg",d),...n,children:[t,e&&h.jsxs(N,{"data-slot":"dialog-close",className:"absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",children:[h.jsx(W,{}),h.jsx("span",{className:"sr-only",children:"Close"})]})]})]})}function ht({className:d,...t}){return h.jsx("div",{"data-slot":"dialog-header",className:$("flex flex-col gap-2 text-center sm:text-left",d),...t})}function ut({className:d,showCloseButton:t=!1,children:e,...n}){return h.jsxs("div",{"data-slot":"dialog-footer",className:$("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",d),...n,children:[e,t&&h.jsx(N,{asChild:!0,children:h.jsx(ot,{variant:"outline",children:"Close"})})]})}function xt({className:d,...t}){return h.jsx(G,{"data-slot":"dialog-title",className:$("text-lg leading-none font-semibold",d),...t})}function bt({className:d,...t}){return h.jsx(Y,{"data-slot":"dialog-description",className:$("text-sm text-muted-foreground",d),...t})}function yt({...d}){return h.jsx(Z,{"data-slot":"dropdown-menu",...d})}function vt({...d}){return h.jsx(Q,{"data-slot":"dropdown-menu-trigger",...d})}function wt({className:d,sideOffset:t=4,...e}){return h.jsx(K,{children:h.jsx(tt,{"data-slot":"dropdown-menu-content",sideOffset:t,className:$("z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",d),...e})})}function St({className:d,inset:t,variant:e="default",...n}){return h.jsx(nt,{"data-slot":"dropdown-menu-item","data-inset":t,"data-variant":e,className:$("relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!",d),...n})}function kt({className:d,inset:t,...e}){return h.jsx(et,{"data-slot":"dropdown-menu-label","data-inset":t,className:$("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",d),...e})}function Bt({className:d,...t}){return h.jsx(J,{"data-slot":"dropdown-menu-separator",className:$("-mx-1 my-1 h-px bg-border",d),...t})}function Tt({className:d,...t}){return h.jsx("span",{"data-slot":"dropdown-menu-shortcut",className:$("ml-auto text-xs tracking-widest text-muted-foreground",d),...t})}const rt=`
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
`;class $t{static sanitizeFilename(t){return(t||"diagram").toLowerCase().replace(/[^a-z0-9_-]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")||"mermaid-diagram"}static downloadBlob(t,e){const n=URL.createObjectURL(t),o=document.createElement("a");o.href=n,o.download=e,document.body.appendChild(o),o.click(),document.body.removeChild(o),setTimeout(()=>URL.revokeObjectURL(n),600)}static downloadSource(t,e="diagram"){const n=`${this.sanitizeFilename(e)}.mmd`,o=new Blob([t],{type:"text/vnd.mermaid;charset=utf-8"});this.downloadBlob(o,n)}static getCleanSvgString(t,e={}){var y;if(!t)return null;const{background:n="transparent",padding:o=0}=e,a=t.cloneNode(!0);a.getAttribute("xmlns")||a.setAttribute("xmlns","http://www.w3.org/2000/svg"),a.getAttribute("xmlns:xlink")||a.setAttribute("xmlns:xlink","http://www.w3.org/1999/xlink");let l=a.querySelector("defs");l||(l=document.createElementNS("http://www.w3.org/2000/svg","defs"),a.insertBefore(l,a.firstChild));const r=document.createElementNS("http://www.w3.org/2000/svg","style");r.textContent=rt,l.appendChild(r);const i=(y=t.viewBox)==null?void 0:y.baseVal;let f=(i==null?void 0:i.width)||t.clientWidth||1200,m=(i==null?void 0:i.height)||t.clientHeight||800;if(o>0){const v=((i==null?void 0:i.x)||0)-o,k=((i==null?void 0:i.y)||0)-o,u=f+o*2,c=m+o*2;if(a.setAttribute("viewBox",`${v} ${k} ${u} ${c}`),a.setAttribute("width",`${u}`),a.setAttribute("height",`${c}`),n&&n!=="transparent"){const s=document.createElementNS("http://www.w3.org/2000/svg","rect");s.setAttribute("x",`${v}`),s.setAttribute("y",`${k}`),s.setAttribute("width",`${u}`),s.setAttribute("height",`${c}`),s.setAttribute("fill",n),a.insertBefore(s,a.firstChild)}}else if(n&&n!=="transparent"){const v=(i==null?void 0:i.x)||0,k=(i==null?void 0:i.y)||0,u=document.createElementNS("http://www.w3.org/2000/svg","rect");u.setAttribute("x",`${v}`),u.setAttribute("y",`${k}`),u.setAttribute("width",`${f}`),u.setAttribute("height",`${m}`),u.setAttribute("fill",n),a.insertBefore(u,a.firstChild)}let g=new XMLSerializer().serializeToString(a);return g.startsWith("<?xml")||(g=`<?xml version="1.0" encoding="UTF-8"?>
`+g),e.source&&(g=at(g,e.source,e.format||"mermaid")),g}static async renderToCanvas(t,e={}){var v;const{scale:n=2,background:o="#080c14",padding:a=32}=e,l=t.querySelector("svg");if(!l)throw new Error("No diagram found to render.");const r=this.getCleanSvgString(l,{background:"transparent",padding:a}),i=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`,f=(v=l.viewBox)==null?void 0:v.baseVal;let m=(f==null?void 0:f.width)||l.clientWidth||1200,b=(f==null?void 0:f.height)||l.clientHeight||800;t.classList.contains("is-gantt")&&(m=Math.max(m,2400));const g=m+a*2,y=b+a*2;return new Promise((k,u)=>{const c=new Image;c.onload=()=>{try{const s=document.createElement("canvas");s.width=Math.round(g*n),s.height=Math.round(y*n);const p=s.getContext("2d");if(!p){u(new Error("Canvas 2D context not available"));return}if(p.imageSmoothingEnabled=!0,p.imageSmoothingQuality="high",o&&o!=="transparent"){if(o==="#080c14"||o==="studio-dark"){const x=p.createLinearGradient(0,0,s.width,s.height);x.addColorStop(0,"#0f172a"),x.addColorStop(.5,"#0a0f1d"),x.addColorStop(1,"#050811"),p.fillStyle=x}else p.fillStyle=o;p.fillRect(0,0,s.width,s.height)}else p.clearRect(0,0,s.width,s.height);p.scale(n,n),p.drawImage(c,0,0,g,y),k({canvas:s,width:s.width,height:s.height})}catch(s){u(s)}},c.onerror=()=>{u(new Error("Failed to rasterize diagram SVG into canvas."))},c.src=i})}static async renderToBlob(t,e={}){const{format:n="image/png",quality:o=.95}=e,{canvas:a,width:l,height:r}=await this.renderToCanvas(t,e);return new Promise((i,f)=>{a.toBlob(m=>{m?i({blob:m,width:l,height:r}):f(new Error(`Failed to encode canvas as ${n}`))},n,o)})}static async downloadPng(t,e="diagram",n={}){const o=typeof n=="number"?{scale:n}:n,{blob:a}=await this.renderToBlob(t,{scale:2,background:"#080c14",padding:32,...o,format:"image/png"}),l=`${this.sanitizeFilename(e)}.png`;this.downloadBlob(a,l)}static async downloadWebp(t,e="diagram",n={}){const{blob:o}=await this.renderToBlob(t,{scale:2,background:"#080c14",padding:32,...n,format:"image/webp"}),a=`${this.sanitizeFilename(e)}.webp`;this.downloadBlob(o,a)}static async downloadJpeg(t,e="diagram",n={}){const{blob:o}=await this.renderToBlob(t,{scale:2,background:"#ffffff",padding:32,...n,format:"image/jpeg",quality:.95}),a=`${this.sanitizeFilename(e)}.jpg`;this.downloadBlob(o,a)}static downloadSvg(t,e="diagram",n={}){const o=t.querySelector("svg");if(!o)throw new Error("No diagram found to export.");const a=this.getCleanSvgString(o,n),l=new Blob([a],{type:"image/svg+xml;charset=utf-8"}),r=`${this.sanitizeFilename(e)}.svg`;this.downloadBlob(l,r)}static async copyImageToClipboard(t,e={}){if(typeof navigator>"u"||!navigator.clipboard||typeof ClipboardItem>"u")throw new Error("Direct image clipboard copying is not supported in this browser.");const{blob:n}=await this.renderToBlob(t,{scale:2,background:"#080c14",padding:24,...e,format:"image/png"}),o=new ClipboardItem({"image/png":n});return await navigator.clipboard.write([o]),!0}static async downloadPdf(t,e="diagram",n={}){const{pageSize:o="fit",background:a="#ffffff",padding:l=32}=n,{blob:r,width:i,height:f}=await this.renderToBlob(t,{scale:3,background:a,padding:l,format:"image/jpeg",quality:.96}),m=await r.arrayBuffer(),b=new Uint8Array(m),g=this.synthesizePdfFromJpeg(b,i,f,{pageSize:o,title:e}),y=new Blob([g],{type:"application/pdf"}),v=`${this.sanitizeFilename(e)}.pdf`;this.downloadBlob(y,v)}static async downloadPptx(t,e="diagram",n={}){const{background:o="#ffffff",padding:a=32}=n,{blob:l,width:r,height:i}=await this.renderToBlob(t,{scale:3,background:o,padding:a,format:"image/png"}),f=(await M(async()=>{const{default:w}=await import("./jszip.min-CG2W26fe.js").then(T=>T.j);return{default:w}},__vite__mapDeps([0,1,2]))).default,m=new f,b=12192e3,g=6858e3,y=b-1219200,v=g-1219200,k=Math.min(y/r,v/i),u=Math.round(r*k),c=Math.round(i*k),s=Math.round((b-u)/2),p=Math.round((g-c)/2);m.file("[Content_Types].xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`),m.file("_rels/.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`),m.file("ppt/_rels/presentation.xml.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>`),m.file("ppt/presentation.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst/>
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
  </p:sldIdLst>
  <p:sldSz cx="${b}" cy="${g}" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`),m.file("ppt/slides/_rels/slide1.xml.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/>
</Relationships>`),m.file("ppt/slides/slide1.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
          <p:cNvPr id="2" name="${this.sanitizeFilename(e)}"/>
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
            <a:off x="${s}" y="${p}"/>
            <a:ext cx="${u}" cy="${c}"/>
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
</p:sld>`),m.file("ppt/media/image1.png",l);const x=await m.generateAsync({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.presentationml.presentation"});this.downloadBlob(x,`${this.sanitizeFilename(e)}.pptx`)}static async downloadProjectDeckPptx(t,e="Project Presentation",n={}){const{background:o="#ffffff",padding:a=32}=n,l=(await M(async()=>{const{default:c}=await import("./jszip.min-CG2W26fe.js").then(s=>s.j);return{default:c}},__vite__mapDeps([0,1,2]))).default,r=new l,i=12192e3,f=6858e3,m=i-1219200,b=f-1219200,g=[];for(let c=0;c<t.length;c++){const s=t[c];let p=s.blob,x=s.width,w=s.height;if(!p&&s.container)try{const T=await this.renderToBlob(s.container,{scale:3,background:o,padding:a,format:"image/png"});p=T.blob,x=T.width,w=T.height}catch(T){console.warn(`Could not render slide ${c+1}:`,T)}p&&x&&w&&g.push({title:s.title||`Slide ${c+1}`,blob:p,width:x,height:w})}if(g.length===0)throw new Error("No valid slides available to generate presentation deck.");let y=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
`,v=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
`,k=`<p:sldIdLst>
`;r.file("_rels/.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`),g.forEach((c,s)=>{const p=s+1,x=`rId${p}`;y+=`  <Override PartName="/ppt/slides/slide${p}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
`,v+=`  <Relationship Id="${x}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${p}.xml"/>
`,k+=`    <p:sldId id="${256+s}" r:id="${x}"/>
`;const w=Math.min(m/c.width,b/c.height),T=Math.round(c.width*w),B=Math.round(c.height*w),P=Math.round((i-T)/2),D=Math.round((f-B)/2);r.file(`ppt/slides/_rels/slide${p}.xml.rels`,`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${p}.png"/>
</Relationships>`),r.file(`ppt/slides/slide${p}.xml`,`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
            <a:off x="${P}" y="${D}"/>
            <a:ext cx="${T}" cy="${B}"/>
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
</p:sld>`),r.file(`ppt/media/image${p}.png`,c.blob)}),y+="</Types>",v+="</Relationships>",k+="  </p:sldIdLst>",r.file("[Content_Types].xml",y),r.file("ppt/_rels/presentation.xml.rels",v),r.file("ppt/presentation.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst/>
  ${k}
  <p:sldSz cx="${i}" cy="${f}" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`);const u=await r.generateAsync({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.presentationml.presentation"});this.downloadBlob(u,`${this.sanitizeFilename(e)}_presentation_deck.pptx`)}static downloadIllustratorSvg(t,e,n={}){const o=t==null?void 0:t.querySelector("svg");if(!o)return;let l=this.getCleanSvgString(o,n);l.includes("xmlns:i=")||(l=l.replace("<svg ",'<svg xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" xmlns:x="http://ns.adobe.com/Extensibility/1.0/" '));const r=new Blob([l],{type:"image/svg+xml;charset=utf-8"});this.downloadBlob(r,`${this.sanitizeFilename(e)}_illustrator.svg`)}static synthesizePdfFromJpeg(t,e,n,o={}){const{pageSize:a="fit",title:l="Mermaid Diagram"}=o;let r,i,f,m,b,g;const y={"a4-landscape":{w:841.89,h:595.28},"a4-portrait":{w:595.28,h:841.89},"letter-landscape":{w:792,h:612},"letter-portrait":{w:612,h:792}};if(y[a]){r=y[a].w,i=y[a].h;const S=36,C=r-S*2,E=i-S*2,I=e/n;C/E>I?(g=E,b=E*I):(b=C,g=C/I),f=(r-b)/2,m=(i-g)/2}else b=Math.max(200,e*.48),g=Math.max(150,n*.48),r=b+48,i=g+48,f=24,m=24;const v=r.toFixed(2),k=i.toFixed(2),u=f.toFixed(2),c=m.toFixed(2),s=b.toFixed(2),p=g.toFixed(2),x=[],w=[],T=new TextEncoder;function B(S){x.push(T.encode(S))}function P(S){x.push(S)}function D(){return x.reduce((S,C)=>S+C.length,0)}B(`%PDF-1.4
%âãÏÓ
`),w[1]=D(),B(`1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
`),w[2]=D(),B(`2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
`),w[3]=D(),B(`3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${v} ${k}] /Resources << /XObject << /Im1 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>
endobj
`),w[4]=D(),B(`4 0 obj
<< /Type /XObject /Subtype /Image /Width ${e} /Height ${n} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${t.length} >>
stream
`),P(t),B(`
endstream
endobj
`),w[5]=D();const F=`q
${s} 0 0 ${p} ${u} ${c} cm
/Im1 Do
Q
`,_=T.encode(F);B(`5 0 obj
<< /Length ${_.length} >>
stream
${F}endstream
endobj
`),w[6]=D();const L=(l||"Mermaid Diagram").replace(/[()\\]/g,""),O=new Date().toISOString().replace(/[-:T]/g,"").slice(0,14);B(`6 0 obj
<< /Title (${L}) /Creator (NodeFlow) /Producer (NodeFlow PDF Engine) /CreationDate (D:${O}Z) >>
endobj
`);const A=D();B(`xref
0 7
0000000000 65535 f 
`);for(let S=1;S<=6;S++){const C=String(w[S]).padStart(10,"0");B(`${C} 00000 n 
`)}B(`trailer
<< /Size 7 /Root 1 0 R /Info 6 0 R >>
startxref
${A}
%%EOF
`);const U=D(),R=new Uint8Array(U);let j=0;for(const S of x)R.set(S,j),j+=S.length;return R}static downloadStandaloneHtml(t,e,n="diagram"){const o=t.querySelector("svg");if(!o)throw new Error("No diagram found to export.");const a=this.getCleanSvgString(o,{background:"transparent"}),l=n||"Mermaid Diagram",r=`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${z(l)} — Interactive NodeFlow View</title>
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
      <span>${z(l)}</span>
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
    <pre><code>${z(e)}</code></pre>
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
        navigator.clipboard.writeText(${JSON.stringify(e)});
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
</html>`,i=new Blob([r],{type:"text/html;charset=utf-8"}),f=`${this.sanitizeFilename(n)}.html`;this.downloadBlob(i,f)}static generateEmbedSnippets(t,e,n="diagram"){const o="```mermaid\n"+t.trim()+"\n```",a=`<pre class="mermaid">
${t.trim()}
</pre>
<script type="module">import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"; mermaid.initialize({ startOnLoad: true });<\/script>`;let l="",r="";const i=e.querySelector("svg");return i&&(r=this.getCleanSvgString(i),l=`data:image/svg+xml;utf8,${encodeURIComponent(r)}`),{markdown:o,html:a,dataUri:l,svg:r}}static async copySvg(t){const e=t.querySelector("svg");if(!e)throw new Error("No diagram found to copy.");const n=this.getCleanSvgString(e);await navigator.clipboard.writeText(n)}static async copyMarkdown(t){const e="```mermaid\n"+t.trim()+"\n```";await navigator.clipboard.writeText(e)}}function z(d){return String(d||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}export{Tt as D,$t as E,Bt as a,yt as b,vt as c,wt as d,kt as e,gt as f,ft as g,ht as h,xt as i,bt as j,ut as k,St as l};
//# sourceMappingURL=exporter-CR4GLesW.js.map
