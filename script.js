import { containsProfanity } from './profanityfilter.js';
import { generateSentence } from './sentence.js';
 
const Cell=2, Gap=3, Shrink=0.94, MinFont=7, Attempts=300, MaxWords=1500, Seed=12345;
const MaxWordsInverted=3000;   // inverted mode fills the (much larger) space around the letters
let inverted=false;
let resizeTimer;               // debounces layout() after the stage resizes or the menu toggles            // false: words fill the letters. true: words fill the space around them
const LogoLines=["BE","YOND","THE","FRAME"];
const SAMPLE=["BEYOND","THE","FRAME","DESIGN","CREATE","IDEAS","VISION","BOLD","FUTURE","STUDIO","ART","MAKE","SHAPE","MOTION","LIGHT","SPACE","COLOR","STORY","CRAFT","DREAM","BUILD"];
const SKIP=new Set("ccmp locl mark mkmk kern rlig rclt curs dist abvm blwm abvs blws calt liga clig init medi fina isol rphf pref half akhn nukt abvf blwf cjct haln pres psts vatu cfar rvrn".split(" "));
const AXIS_NAMES={wght:"Weight",wdth:"Width",slnt:"Slant",ital:"Italic",opsz:"Optical size"};
 
const CanvasPassword="H@ckathon";   // password asked for by the Undo and Clear Canvas buttons - change it here
 
const DEFAULT_FONT={family:'"Arial Black","Segoe UI Black",Arial,sans-serif',weight:900,vs:"normal",fs:"normal"};
let font={...DEFAULT_FONT};
let words=[];
let loaded=null;   // {buf, axes, feats, name, face, fam}
let famCounter=0;
 
const $=id=>document.getElementById(id);
const stage=$("stage"), ctx0=document.createElement("canvas").getContext("2d");
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const N=d=>(+d.toFixed(3)).toString();
const fontCss=size=>`${font.weight} ${size}px ${font.family}`;
 
function rngFor(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
 
function setFontCss(){
  $("fontcss").textContent=`#stage text,.label,#marquee .marquee-item{font-family:${font.family};font-weight:${font.weight};font-variation-settings:${font.vs};font-feature-settings:${font.fs}}`;
  renderMarquee();   // text widths change with the font, so rebuild the loop
}
 
/* ---------- font file parsing (fvar axes, GSUB/GPOS feature tags) ---------- */
async function readTables(buf){
  const dv=new DataView(buf), sig=dv.getUint32(0), out={};
  const tag=o=>String.fromCharCode(dv.getUint8(o),dv.getUint8(o+1),dv.getUint8(o+2),dv.getUint8(o+3));
  const want=["fvar","GSUB","GPOS"];
  if(sig===0x774F4632) return out;                      // woff2: needs brotli, skip inspection
  if(sig===0x774F4646){                                 // woff
    const n=dv.getUint16(12);
    for(let i=0;i<n;i++){
      const o=44+i*20, t=tag(o); if(!want.includes(t)) continue;
      const off=dv.getUint32(o+4), cl=dv.getUint32(o+8), ol=dv.getUint32(o+12);
      let bytes=new Uint8Array(buf,off,cl);
      if(cl<ol){
        const s=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));
        bytes=new Uint8Array(await new Response(s).arrayBuffer());
      }
      out[t]=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    }
  }else{                                                // ttf / otf
    const n=dv.getUint16(4);
    for(let i=0;i<n;i++){
      const o=12+i*16, t=tag(o); if(!want.includes(t)) continue;
      out[t]=new DataView(buf,dv.getUint32(o+8),dv.getUint32(o+12));
    }
  }
  return out;
}
function parseAxes(t){
  if(!t) return [];
  const ao=t.getUint16(4), n=t.getUint16(8), sz=t.getUint16(10), axes=[];
  for(let i=0;i<n;i++){
    const o=ao+i*sz;
    const tag=String.fromCharCode(t.getUint8(o),t.getUint8(o+1),t.getUint8(o+2),t.getUint8(o+3));
    axes.push({tag,min:t.getInt32(o+4)/65536,def:t.getInt32(o+8)/65536,max:t.getInt32(o+12)/65536});
  }
  return axes;
}
function parseFeatures(...tables){
  const set=new Set();
  for(const t of tables){
    if(!t) continue;
    const fl=t.getUint16(6), n=t.getUint16(fl);
    for(let i=0;i<n;i++){
      const o=fl+2+i*6;
      set.add(String.fromCharCode(t.getUint8(o),t.getUint8(o+1),t.getUint8(o+2),t.getUint8(o+3)));
    }
  }
  return [...set].filter(f=>!SKIP.has(f)).sort();
}
 
/* ---------- font controls ---------- */
function buildControls(){
  const ax=$("axes"), ft=$("features");
  ax.innerHTML=""; ft.innerHTML="";
  if(!loaded) return;
  for(const a of loaded.axes){
    const wrap=document.createElement("label"); wrap.className="axis";
    const step=(a.max-a.min)>20?1:0.01;
    wrap.innerHTML=`<span>${AXIS_NAMES[a.tag]||a.tag}</span><input type="range" min="${a.min}" max="${a.max}" step="${step}" value="${a.def}" data-tag="${a.tag}"><output>${a.def}</output>`;
    const r=wrap.querySelector("input"), o=wrap.querySelector("output");
    r.addEventListener("input",()=>{o.textContent=r.value;queueApply()});
    ax.appendChild(wrap);
  }
  for(const f of loaded.feats){
    const l=document.createElement("label"); l.className="chip";
    l.innerHTML=`<input type="checkbox" data-feat="${f}">${f}`;
    l.querySelector("input").addEventListener("change",queueApply);
    ft.appendChild(l);
  }
  if(!loaded.axes.length&&!loaded.feats.length){
    ft.textContent="No variable axes or optional OpenType features found in this font.";
  }
}
let applyTimer;
function queueApply(){clearTimeout(applyTimer);applyTimer=setTimeout(applyFont,120)}
 
async function applyFont(){
  if(!loaded) return;
  const vals={};
  document.querySelectorAll("#axes input").forEach(r=>vals[r.dataset.tag]=+r.value);
  const vs=Object.keys(vals).length?Object.entries(vals).map(([k,v])=>`"${k}" ${v}`).join(", "):"normal";
  const feats=[...document.querySelectorAll("#features input:checked")].map(c=>`"${c.dataset.feat}" 1`);
  const fs=feats.length?feats.join(", "):"normal";
  const w=loaded.axes.find(a=>a.tag==="wght");
  const fam="UF"+(++famCounter);
  const desc={featureSettings:fs};
  if(vs!=="normal") desc.variationSettings=vs;
  if(w) desc.weight=`${w.min} ${w.max}`;
  try{
    const face=new FontFace(fam,loaded.buf,desc);
    await face.load();
    if(loaded.face) document.fonts.delete(loaded.face);
    document.fonts.add(face); loaded.face=face;
    font={family:`"${fam}",sans-serif`,weight:w?vals.wght:400,vs,fs};
    setFontCss(); layout();
  }catch(e){ setStatus("This font could not be loaded: "+e.message); }
}
 
$("file").addEventListener("change",async e=>{
  const f=e.target.files[0]; if(!f) return;
  const buf=await f.arrayBuffer();
  let tables={}; try{tables=await readTables(buf)}catch(err){}
  loaded={buf,axes:parseAxes(tables.fvar),feats:parseFeatures(tables.GSUB,tables.GPOS),face:null};
  $("fontname").textContent=f.name+(/\.woff2$/i.test(f.name)?" (woff2: axes and features not listed)":"");
  $("reset").hidden=false;
  buildControls(); applyFont(); e.target.value="";
});
$("reset").addEventListener("click",()=>{
  if(loaded&&loaded.face) document.fonts.delete(loaded.face);
  loaded=null; font={...DEFAULT_FONT}; setFontCss(); buildControls();
  $("fontname").textContent="Using Arial Black"; $("reset").hidden=true; layout();
});
 
/* ---------- logo shape ---------- */
function measure(text,size){
  ctx0.font=fontCss(size);
  const m=ctx0.measureText(text);
  return {L:m.actualBoundingBoxLeft,R:m.actualBoundingBoxRight,A:m.actualBoundingBoxAscent,D:m.actualBoundingBoxDescent,W:m.actualBoundingBoxLeft+m.actualBoundingBoxRight};
}
function buildLogo(w,h){
  const ms=LogoLines.map(t=>measure(t,100));
  const e=measure("E",100), cap=e.A+e.D, gap=cap*0.14;
  const fw=ms[3].W, totalH=4*cap+3*gap, margin=12;
  const s=Math.min((w-2*margin)/fw,(h-2*margin)/totalH);
  const ox=(w-fw*s)/2, oy=(h-totalH*s)/2, rowStep=(cap+gap)*s;
  const lines=LogoLines.map((text,i)=>({text,x:ox+ms[i].L*s,y:oy+i*rowStep+ms[i].A*s,fs:100*s}));
  const g=gap*s, rightX=ox+fw*s, capPx=cap*s;
  const x0=ox+ms[0].W*s+2*g, x2=ox+ms[2].W*s+2*g;
  return {lines,capPx,
    showcase:{x:x0,y:oy,w:Math.max(0,rightX-x0),h:capPx},
    year:{x:x2,y:oy+2*rowStep,w:Math.max(0,rightX-x2),h:capPx}};
}
// Grid of cells where words may go (1 = free). Normal mode: the cells inside the letters.
// Inverted mode: every cell outside the letters, minus a margin around them (so the letter shapes stay
// readable as empty silhouettes) and minus the SHOWCASE / 2026 badges, which sit outside the letters.
function buildMask(logo,gw,gh,inv){
  const c=document.createElement("canvas"); c.width=gw; c.height=gh;
  const cx=c.getContext("2d",{willReadFrequently:true});
  cx.scale(1/Cell,1/Cell); cx.fillStyle="#fff"; cx.strokeStyle="#fff";
  const margin=Math.max(Gap*2,logo.capPx*0.04);
  cx.lineWidth=margin*2; cx.lineJoin="round";
  for(const l of logo.lines){
    cx.font=fontCss(l.fs);
    if(inv) cx.strokeText(l.text,l.x,l.y);   // thickens the letters by `margin` on every side
    cx.fillText(l.text,l.x,l.y);
  }
  const px=cx.getImageData(0,0,gw,gh).data, free=new Uint8Array(gw*gh);
  for(let i=0;i<free.length;i++){
    const ink=px[i*4+3]>128;
    free[i]=(inv?!ink:ink)?1:0;
  }
  if(inv) for(const r of [logo.showcase,logo.year]) blockRect(free,gw,gh,r,margin);
  const btn=toggleRect(); if(btn) blockRect(free,gw,gh,btn,Gap*2);   // keep words out from under the Menu button
  return free;
}
// Where the floating menu button sits over the stage (stage coordinates), or null if it isn't over it.
function toggleRect(){
  const b=$("menutoggle").getBoundingClientRect(), s=stage.getBoundingClientRect();
  const r={x:b.left-s.left,y:b.top-s.top,w:b.width,h:b.height};
  return (r.x+r.w>0&&r.y+r.h>0&&r.x<s.width&&r.y<s.height)?r:null;
}
function blockRect(free,gw,gh,r,pad){
  if(r.w<=0||r.h<=0) return;
  const x0=Math.max(0,Math.floor((r.x-pad)/Cell)), x1=Math.min(gw,Math.ceil((r.x+r.w+pad)/Cell));
  const y0=Math.max(0,Math.floor((r.y-pad)/Cell)), y1=Math.min(gh,Math.ceil((r.y+r.h+pad)/Cell));
  for(let y=y0;y<y1;y++) free.fill(0,y*gw+x0,y*gw+x1);
}
 
/* ---------- word stamps ---------- */
function makeStamp(word,size,vert){
  const m=measure(word,size), iw=m.W, ih=m.A+m.D;
  if(iw<=0||ih<=0) return null;
  const pad=Gap/2+1;
  const pw=(vert?ih:iw)+2*pad, ph=(vert?iw:ih)+2*pad;
  const ox=vert?pad+m.A:pad+m.L, oy=vert?pad+m.R:pad+m.A;
  const sw=Math.ceil(pw/Cell)+1, sh=Math.ceil(ph/Cell)+1;
  const c=document.createElement("canvas"); c.width=sw; c.height=sh;
  const cx=c.getContext("2d",{willReadFrequently:true});
  cx.scale(1/Cell,1/Cell); cx.translate(ox,oy);
  if(vert) cx.rotate(-Math.PI/2);
  cx.font=fontCss(size); cx.fillStyle="#fff"; cx.strokeStyle="#fff";
  cx.lineWidth=Gap; cx.lineJoin="round";
  cx.strokeText(word,0,0); cx.fillText(word,0,0);
  const px=cx.getImageData(0,0,sw,sh).data, dx=[], dy=[];
  for(let y=0;y<sh;y++)for(let x=0;x<sw;x++) if(px[(y*sw+x)*4+3]>40){dx.push(x);dy.push(y)}
  if(!dx.length) return null;
  return {word,size,vert,W:sw,H:sh,ox,oy,dx,dy};
}
function tryPlace(st,free,cells,gw,gh,rng,out){
  if(st.W>gw||st.H>gh) return false;
  for(let a=0;a<Attempts;a++){
    const cell=cells[Math.floor(rng()*cells.length)];
    if(!free[cell]) continue;
    const cx=cell%gw-(st.W>>1), cy=Math.floor(cell/gw)-(st.H>>1);
    if(cx<0||cy<0||cx+st.W>gw||cy+st.H>gh) continue;
    let ok=true;
    for(let i=0;i<st.dx.length;i++) if(!free[(cy+st.dy[i])*gw+cx+st.dx[i]]){ok=false;break}
    if(!ok) continue;
    for(let i=0;i<st.dx.length;i++) free[(cy+st.dy[i])*gw+cx+st.dx[i]]=0;
    out.push({st,x:cx*Cell+st.ox,y:cy*Cell+st.oy});
    return true;
  }
  return false;
}
 
/* ---------- layout + render ---------- */
// Works out where the words in `list` would go without drawing anything. `logo` is null when the
// stage is too small to lay out. layout() draws the real stage from this; the live "does it fit?"
// check on the input box uses it to test a word that has not been added yet.
function computeLayout(list){
  const placedWords=new Set();
  const w=stage.clientWidth, h=stage.clientHeight;
  if(w<100||h<100) return {placedWords,logo:null};
  const logo=buildLogo(w,h), placements=[];
 
  if(list.length){
    const gw=Math.ceil(w/Cell), gh=Math.ceil(h/Cell);
    const free=buildMask(logo,gw,gh,inverted);
    const cells=[]; for(let i=0;i<free.length;i++) if(free[i]) cells.push(i);
    if(cells.length){
      const rng=rngFor(Seed), cache=new Map();
      const start=logo.capPx*0.45;
      const maxK=start<=MinFont?0:Math.floor(Math.log(MinFont/start)/Math.log(Shrink));
      let k=0,fails=0,wi=0,count=0;
      const maxWords=inverted?MaxWordsInverted:MaxWords;
      while(count<maxWords&&fails<list.length){
        const word=list[wi++%list.length]; let placed=false;
        for(let kk=k;kk<=maxK&&!placed;kk++){
          const size=start*Math.pow(Shrink,kk), firstV=rng()<0.35;
          for(let o=0;o<2&&!placed;o++){
            const vert=o===0?firstV:!firstV, key=word+"|"+kk+"|"+vert;
            let st=cache.get(key);
            if(st===undefined){st=makeStamp(word,size,vert);cache.set(key,st)}
            if(st&&tryPlace(st,free,cells,gw,gh,rng,placements)){placed=true;k=kk}
          }
        }
        if(placed){fails=0;count++;placedWords.add(word)}else fails++;
      }
    }
  }
  return {placedWords,w,h,logo,placements};
}
function layout(){
  refreshCanvasButtons();
  const r=computeLayout(words);
  if(!r.logo) return r.placedWords;
  render(r.w,r.h,r.logo,r.placements);
  scheduleFitCheck();   // the stage (size, font, words) changed, so re-test what is in the input box
  return r.placedWords;
}
 
function labelHtml(r,text,inv){
  if(r.w<20||r.h<10) return "";
  const pad=r.h*0.08, iw=r.w-4-2*pad, ih=r.h-4-2*pad;
  if(iw<=0||ih<=0) return "";
  ctx0.font=fontCss(100);
  const m=ctx0.measureText(text);
  const lh=(m.fontBoundingBoxAscent+m.fontBoundingBoxDescent)||100;
  const fs=100*Math.min(iw/m.width,ih/lh);
  return `<div class="label${inv?" inv":""}" style="left:${N(r.x)}px;top:${N(r.y)}px;width:${N(r.w)}px;height:${N(r.h)}px;padding:${N(pad)}px;font-size:${N(fs)}px">${text}</div>`;
}
 
function render(w,h,logo,placements){
  let svg=`<svg width="${N(w)}" height="${N(h)}" viewBox="0 0 ${N(w)} ${N(h)}">`;
  if(!placements.length){
    svg+=`<g fill="#262626">`+logo.lines.map(l=>`<text x="${N(l.x)}" y="${N(l.y)}" font-size="${N(l.fs)}">${l.text}</text>`).join("")+`</g>`;
  }else{
    // inverted: a faint copy of the letters sits behind the words so the shape reads even when sparse
    if(inverted) svg+=`<g fill="#1c1c1c">`+logo.lines.map(l=>`<text x="${N(l.x)}" y="${N(l.y)}" font-size="${N(l.fs)}">${l.text}</text>`).join("")+`</g>`;
    svg+=`<g fill="#fff">`+placements.map(p=>{
      const t=`translate(${N(p.x)} ${N(p.y)})`+(p.st.vert?" rotate(-90)":"");
      return `<text transform="${t}" font-size="${N(p.st.size)}">${esc(p.st.word)}</text>`;
    }).join("")+`</g>`;
  }
  svg+="</svg>";
  stage.innerHTML=svg+labelHtml(logo.showcase,"SHOWCASE",false)+labelHtml(logo.year,"2026",true);
}
 
/* ---------- UI ---------- */
const TOO_LONG="That text is too long to fit inside the letters.";
const statusEl=$("status"), inputEl=$("input");
function setStatus(t){statusEl.textContent=t}
 
// Live "does it fit?" check. The limit is not a fixed number of characters: it depends on the stage
// size and the loaded font, so this runs the same layout the OK button runs, on the words already
// on the stage plus the text in the box (nothing is drawn). Over the limit, the text turns red and
// the existing error message is shown. It covers typing and voice input alike, because voice
// results are written into this same box.
let fitTimer;
function showFit(over){
  inputEl.classList.toggle("over",over);
  inputEl.setAttribute("aria-invalid",String(over));
  if(over) setStatus(TOO_LONG);
  else if(statusEl.textContent===TOO_LONG) setStatus("");
}
function updateFit(){
  clearTimeout(fitTimer);
  const text=inputEl.value.trim().toUpperCase();
  let over=false;
  if(text){
    const r=computeLayout([...words,text]);
    over=!!r.logo&&!r.placedWords.has(text);
  }
  showFit(over);
}
function scheduleFitCheck(){clearTimeout(fitTimer);fitTimer=setTimeout(updateFit,150)}
// Editing the text makes any other old message (e.g. the profanity one) stale. The too-long message
// is left for the fit check to remove, so it doesn't flicker while typing.
function clearStaleStatus(){ if(statusEl.textContent!==TOO_LONG) setStatus(""); }
inputEl.addEventListener("input",()=>{clearStaleStatus(); scheduleFitCheck();});
 
$("ok").addEventListener("click",()=>{
  const text=inputEl.value.trim().toUpperCase();
  if(!text) return;
 
  if(containsProfanity(text)) {
    setStatus("Please enter a valid word without profanity.");
    inputEl.focus();
    return;
  }
 
  words.push(text);
  if(layout().has(text)){ inputEl.value=""; setStatus(""); showFit(false); }
  else{ words.pop(); layout(); showFit(true); }
  inputEl.focus();
});
inputEl.addEventListener("keydown",e=>{if(e.key==="Enter")$("ok").click()});
$("sample").addEventListener("click",()=>{words=SAMPLE.slice();setStatus("");layout()});
 
// Invert: switch between words inside the letters and words around them. The word list is kept,
// so toggling back and forth just re-lays out the same words.
$("invert").addEventListener("click",()=>{
  inverted=!inverted;
  $("invert").setAttribute("aria-pressed",String(inverted));
  $("invert").textContent=inverted?"Inverted":"Invert";
  layout();
});
 
/* ---------- menu show / hide ---------- */
// Hiding the menu removes the sidebar from the layout, so the stage grows to the full window. The stage's
// ResizeObserver (bottom of the file) re-runs layout() after the size change, so the words re-flow.
// Narrow screens start with the menu hidden, because there it slides over the canvas.
function setMenu(open){
  document.body.classList.toggle("menu-hidden",!open);
  const btn=$("menutoggle");
  btn.setAttribute("aria-expanded",String(open));
  btn.title=open?"Hide the menu":"Show the menu";
  $("menutogglelabel").textContent=open?"Hide menu":"Menu";
  // The button changes width and may now cover the stage; the ResizeObserver catches the stage
  // resize, but on narrow screens the stage size doesn't change, so re-lay out explicitly too.
  clearTimeout(resizeTimer); resizeTimer=setTimeout(layout,150);
}
$("menutoggle").addEventListener("click",()=>setMenu(document.body.classList.contains("menu-hidden")));
setMenu(!window.matchMedia("(max-width: 900px)").matches);
 
function clearStage(){words=[];setStatus("");layout()}
function undoWord(){words.pop();layout()}   // removes the most recently added word
 
// Undo is only useful when there is a word to remove.
function refreshCanvasButtons(){ $("undo").disabled=!words.length; }
refreshCanvasButtons();
 
// Undo and Clear Canvas both ask for the password first, using one shared dialog. The box is a plain
// text field on purpose (not type="password"), so what is typed stays readable instead of dots.
const pwDialog=$("pwdialog"), pwInput=$("pwinput"), pwError=$("pwerror");
let pwAction=null;   // what to do once the right password has been entered
function askPassword({title,message,confirm,onSuccess}){
  pwAction=onSuccess;
  $("pwtitle").textContent=title; $("pwmsg").textContent=message; $("pwok").textContent=confirm;
  pwInput.value=""; pwError.textContent="";
  pwDialog.showModal();
  pwInput.focus();
}
$("clear").addEventListener("click",()=>askPassword({
  title:"Clear Canvas",
  message:"Enter the password to remove every word from the canvas.",
  confirm:"Clear Canvas",
  onSuccess:clearStage
}));
$("undo").addEventListener("click",()=>{
  if(!words.length) return;
  askPassword({
    title:"Undo",
    message:"Enter the password to remove the most recent word (\u201c"+words[words.length-1]+"\u201d) from the canvas.",
    confirm:"Undo",
    onSuccess:undoWord
  });
});
$("pwform").addEventListener("submit",e=>{
  e.preventDefault();
  if(pwInput.value.trim()===CanvasPassword){
    const action=pwAction; pwAction=null;
    pwDialog.close();
    if(action) action();
  }
  else{ pwError.textContent="Incorrect password. Try again."; pwInput.focus(); pwInput.select(); }
});
$("pwcancel").addEventListener("click",()=>pwDialog.close());
pwDialog.addEventListener("close",()=>{ pwAction=null; });   // Cancel / Esc: forget the pending action
 
$("clearinput").addEventListener("click",()=>{
  inputEl.value=""; setStatus(""); $("voiceStatus").textContent="";
  showFit(false);
  inputEl.focus();
});
 
/* ---------- voice input (Web Speech API, no libraries) ---------- */
// The browser captures the microphone and does the speech-to-text itself. The result is only ever put
// into the normal input box (never straight onto the stage), so the live too-long check above and the
// OK button's uppercasing, profanity check and fit check all still apply.
//
// The API has no setting for how long a pause ends the recording, and in its default mode Chrome ends
// the session after a short pause. So it runs in continuous mode (Chrome keeps listening) and our own
// timer stops it once nothing new has been heard for SilenceMs. Raise this number to allow longer pauses.
(function voiceInput(){
  const SilenceMs=4000;     // pause (in milliseconds) after your last word before recording stops
  const mic=$("mic"), label=$("miclabel"), voiceStatus=$("voiceStatus");
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const setVoice=(t,isError)=>{voiceStatus.textContent=t; voiceStatus.classList.toggle("error",!!isError)};
 
  if(!SR){
    mic.disabled=true; $("voicelang").disabled=true;
    setVoice("Voice input isn't supported in this browser. Try Chrome, Edge or Safari.",true);
    return;
  }
 
  let rec=null, listening=false, gotResult=false, silenceTimer=null;
  const ERRORS={
    "not-allowed":"Microphone access was blocked. Allow it in the browser's site settings.",
    "service-not-allowed":"Microphone access was blocked. Allow it in the browser's site settings.",
    "no-speech":"Didn't catch anything. Try again.",
    "audio-capture":"No microphone was found.",
    "network":"Speech recognition needs an internet connection.",
    "language-not-supported":"That language isn't supported by this browser."
  };
 
  function setListening(on){
    listening=on;
    mic.classList.toggle("listening",on);
    mic.setAttribute("aria-pressed",String(on));
    label.textContent=on?"Stop":"Speak";
  }
 
  // (Re)start the countdown. Called every time the browser reports new speech, interim or final.
  function armSilenceTimer(){
    clearTimeout(silenceTimer);
    silenceTimer=setTimeout(()=>{ if(rec) rec.stop(); },SilenceMs);
  }
 
  function start(){
    rec=new SR();
    rec.lang=$("voicelang").value;
    rec.interimResults=true;    // show the words live as they are recognised
    rec.continuous=true;        // keep listening through pauses; our timer decides when to stop
    rec.maxAlternatives=1;
    gotResult=false;
 
    rec.onstart=()=>{setListening(true); setVoice("Listening…"); setStatus(""); updateFit();};
    rec.onresult=e=>{
      // in continuous mode e.results holds every phrase heard since start, so rebuild the whole text
      const parts=[];
      let final=false;
      for(let i=0;i<e.results.length;i++){
        parts.push(e.results[i][0].transcript.trim());
        final=e.results[i].isFinal;
      }
      gotResult=true;
      $("input").value=parts.join(" ").replace(/\s+/g," ").trim().replace(/[.,!?;:]+$/,"");
      clearStaleStatus(); scheduleFitCheck();
      setVoice(final?"Heard: \u201c"+$("input").value+"\u201d":"Listening…");
      armSilenceTimer();
    };
    rec.onerror=e=>{ if(e.error!=="aborted") setVoice(ERRORS[e.error]||"Voice input error: "+e.error,true); };
    rec.onend=()=>{
      clearTimeout(silenceTimer);
      setListening(false);
      if(gotResult&&$("input").value.trim()){
        setVoice("Heard: \u201c"+$("input").value+"\u201d");
        updateFit();            // check the final text straight away, no waiting for the delay
        $("input").focus();
      }
      rec=null;
    };
 
    try{ rec.start(); }catch(err){ setVoice("Couldn't start the microphone.",true); rec=null; }
  }
 
  mic.addEventListener("click",()=>{
    if(listening&&rec) rec.stop();   // stop() still delivers what was heard so far
    else if(!listening) start();
  });
 
  // changing language mid-listen would be ignored, so just end the current session
  $("voicelang").addEventListener("change",()=>{ if(rec) rec.abort(); });
})();
 
/* ---------- random sentence + marquee ---------- */
const MarqueeSpeed=70;          // pixels per second
const addedSentences=[];        // sentences in the marquee, in the order they were added
const addedKeys=new Set();      // normalised copies, used for the duplicate check
let currentSentence="";
 
const sentenceKey=s=>s.trim().replace(/\s+/g," ").toLowerCase();
function setSentenceStatus(t,isError){const el=$("sentenceStatus"); el.textContent=t; el.classList.toggle("error",!!isError)}
 
// The Add button is disabled whenever the displayed sentence is already in the marquee.
function refreshAddState(msg){
  const dup=addedKeys.has(sentenceKey(currentSentence));
  $("add").disabled=!currentSentence||dup;
  if(msg) setSentenceStatus(msg);
  else if(dup) setSentenceStatus("This sentence is already in the marquee.",true);
  else setSentenceStatus("");
}
function showNewSentence(){
  currentSentence=generateSentence();
  $("sentence").textContent=currentSentence;
  refreshAddState();
}
 
// Seamless infinite loop: the sentences are laid out as one group, repeated until the group is at
// least as wide as the footer, and two identical groups sit side by side. The track slides left by
// exactly one group width and jumps back, so the join is invisible. Each sentence is only stored
// once; the repeats are visual copies (hidden from screen readers).
let marqueeAnim=null, marqueeGroupW=0;
 
function makeGroup(repeats){
  const g=document.createElement("div"); g.className="marquee-group";
  for(let r=0;r<repeats;r++) for(const s of addedSentences){
    const el=document.createElement("span"); el.className="marquee-item"; el.textContent=s;
    g.appendChild(el);
  }
  return g;
}
function renderMarquee(){
  const box=$("marquee"), track=$("marqueeTrack");
 
  // remember how far the strip had scrolled (in pixels) so rebuilding doesn't make it jump back
  let offsetPx=0;
  if(marqueeAnim&&marqueeGroupW){
    const dur=marqueeAnim.effect.getTiming().duration;
    offsetPx=((marqueeAnim.currentTime%dur)/dur)*marqueeGroupW;
  }
  if(marqueeAnim){ marqueeAnim.cancel(); marqueeAnim=null; }
  track.innerHTML="";
  if(!addedSentences.length){ marqueeGroupW=0; return; }
 
  const probe=makeGroup(1); track.appendChild(probe);
  const oneW=probe.getBoundingClientRect().width;
  const repeats=Math.max(1,Math.ceil(box.clientWidth/oneW));
  track.innerHTML="";
  const g1=makeGroup(repeats), g2=g1.cloneNode(true);
  g2.setAttribute("aria-hidden","true");
  track.append(g1,g2);
 
  marqueeGroupW=g1.getBoundingClientRect().width;
  const duration=(marqueeGroupW/MarqueeSpeed)*1000;
  marqueeAnim=track.animate(
    [{transform:"translateX(0)"},{transform:"translateX(-50%)"}],
    {duration,iterations:Infinity,easing:"linear"}
  );
  marqueeAnim.currentTime=((offsetPx%marqueeGroupW)/marqueeGroupW)*duration;
}
 
$("generate").addEventListener("click",showNewSentence);
$("add").addEventListener("click",()=>{
  if(!currentSentence) return;
  const key=sentenceKey(currentSentence);
  if(addedKeys.has(key)){ refreshAddState(); return; }
  addedKeys.add(key); addedSentences.push(currentSentence);
  renderMarquee();
  refreshAddState("Added to the marquee.");
});
 
let marqueeWidth=0;
new ResizeObserver(()=>{
  const w=$("marquee").clientWidth;
  if(w!==marqueeWidth){ marqueeWidth=w; renderMarquee(); }
}).observe($("marquee"));
 
showNewSentence();   // start with one generated sentence displayed, marquee empty
 
new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(layout,150)}).observe(stage);
setFontCss();
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(layout);