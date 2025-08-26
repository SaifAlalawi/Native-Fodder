/* تعديلات إضافية:
   - مصمّم الخلطة: تحويل التخطيط إلى ٣ أعمدة (قائمة واحدة للمكوّنات + وسط المختارة + يمين الإحصاءات)
   - سباق الهجن: المضمار فوق السؤال + ثبات الارتفاعات
*/
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function setAppHeight(){
  const vh = window.innerHeight;
  document.documentElement.style.setProperty("--app-h", `${vh}px`);
}
window.addEventListener("resize", setAppHeight, {passive:true});
setAppHeight();

/* Toast */
function toast(msg, kind="info"){
  const el=$("#toast");
  el.textContent = msg;
  el.className = "toast show" + (kind==="good"?" good": kind==="bad"?" bad":"");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> el.classList.remove("show"), 2000);
}

/* Stepper + Screens */
function setStepActive(idx){ $$(".stepper .step").forEach((s,i)=> s.classList.toggle("active", i===idx)); }
function showScreen(id){
  const order=["home","pick","lesson","feeds","mixer","quiz"];
  $$(".screen").forEach(s=>s.classList.remove("active"));
  $("#"+id).classList.add("active");
  setStepActive(order.indexOf(id));
  window.scrollTo({top:0, behavior:"smooth"});
}

/* Fullscreen + Home */
$("#fsBtn")?.addEventListener("click", ()=>{
  if(!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
});
$("#homeBtn")?.addEventListener("click", ()=> showScreen("home"));
$$("[data-go='home']").forEach(b=> b.onclick = ()=> showScreen("home"));
$("#startBtn")?.addEventListener("click", ()=> showScreen("pick"));

/* Pick Animal */
let currentAnimal = "camels";
$("#pick-camel")?.addEventListener("click", ()=>{
  currentAnimal="camels";
  buildLessonSlides();
  showScreen("lesson");
});
$$("[data-go='pick']").forEach(b=> b.onclick = ()=> showScreen("pick"));

/* Lessons */
const LESSON_SLIDES = [
  { kicker:"مقدمة", title:"سلامة الإبل تبدأ من التغذية", lede:"توازن بسيط = مناعة أقوى ونشاط أفضل.", points:["بروتين كافٍ","ألياف كافية","طاقة بحسب الحاجة"] },
  { kicker:"مخاطر شائعة", title:"ماذا يحدث مع سوء التغذية؟", lede:"مشاكل هضم وكبد/كلية وسمنة.", points:["حموضة الكرش مع كثرة الحبوب وقلة الألياف","إجهاد كبدي/كلوي مع إفراط البروتين/الأملاح","نفاخ/تسمم من أعلاف متعفنة"] },
  { kicker:"احتياجات", title:"الاحتياج يختلف حسب الحالة", lede:"لكل فئة هدف.", points:["الصغار: بروتين أعلى للنمو","السبوق: طاقة أعلى ومراقبة الهضم","الحوامل: توازن + معادن (Ca/P)"] },
  { kicker:"أنواع الأعلاف", title:"خضراء • جافة • مركزة • محلية", lede:"كل نوع له دور، والمهم التوازن.", points:["الخضراء: فيتامينات وماء — باعتدال","الجافة: ألياف وتنظيم للهضم","المركزة: طاقة/بروتين — الإفراط مضر","المحلية: غاف/مورينجا/سبوروبولس للتكلفة"] },
  { kicker:"دمج ذكي", title:"كيف ندمج؟", lede:"بالتدرّج وتنوّع المصادر.", points:["لا تتجاوز 20–30% من نوع محلي واحد يوميًا","ارفع الألياف عند زيادة الحبوب","راقب الأداء وبدّل تدريجيًا"] },
  { kicker:"خلاصة", title:"جاهز للأعلاف؟", lede:"نشوف البطاقات ثم نصمّم الخلطة.", points:["فوائد + سلبيات لكل علف","مصمّم خلطة تفاعلي"] },
];
let currentSlide = 0;
function buildLessonSlides(){
  const track = $("#lessonTrack");
  track.innerHTML = LESSON_SLIDES.map(s=>`
    <section class="slide">
      <div class="kicker">${s.kicker}</div>
      <h3>${s.title}</h3>
      <div class="lede">${s.lede}</div>
      <div class="points">${s.points.map(p=>`<div>• ${p}</div>`).join("")}</div>
    </section>
  `).join("");
  buildDots(); goToSlide(0);
}
function buildDots(){
  const dots = $("#lessonDots");
  dots.innerHTML = LESSON_SLIDES.map((_,i)=>`<div class="dot${i===0?' active':''}" data-i="${i}"></div>`).join("");
  $$("#lessonDots .dot").forEach(d=> d.onclick = ()=> goToSlide(+d.dataset.i));
}
function goToSlide(i){
  currentSlide = Math.max(0, Math.min(LESSON_SLIDES.length-1, i));
  $("#lessonTrack").style.transform = `translateX(-${currentSlide*100}%)`;
  $$("#lessonDots .dot").forEach((d,idx)=> d.classList.toggle("active", idx===currentSlide));
}
$("#prevSlide")?.addEventListener("click", ()=> goToSlide(currentSlide-1));
$("#nextSlide")?.addEventListener("click", ()=> goToSlide(currentSlide+1));
$("#toFeeds")?.addEventListener("click", ()=>{ feedIndex = 0; renderFeedCard(); toast("نبدأ بطاقات الأعلاف","good"); showScreen("feeds"); });

/* Feeds (data) */
const FEEDS = [
  { id:"alfalfa", name:"برسيم (الجت)", latin:"Medicago sativa", local:true, protein:17, fiber:28, energy:2.2,
    benefits:["فيتامينات وماء، يدعم الهضم","ألياف منظِّمة للكرش"],
    risks:["الإكثار قد يسبب انتفاخ","ارتفاع الكالسيوم قد يخلّ بالتوازن مع الفوسفور"],
    info:["زراعة محلية ممكنة بإدارة مياه"],
    science:["Ca ~1.2–1.5% DM • P ~0.2–0.3% • نسبة Ca:P ≈ 4–6:1","NDF 35–45% حسب العمر/القطع"],
    dose:["يمكن أن يشكّل 30–60% من مادة العلف الخشنة","راقب الوزن وحالة البراز"] },
  { id:"barley", name:"شعير مجروش", latin:"Hordeum vulgare", local:false, protein:12, fiber:5, energy:3.0,
    benefits:["يرفع الطاقة للسبوق","قابلية هضم نشا جيدة"],
    risks:["قلة الألياف + كثرة الحبوب = حموضة","غبار الحبوب قد يهيّج التنفّس"],
    info:["غالبًا مستورد"],
    science:["نشا 55–60% • ألياف منخفضة","فضّل الجرش/التبخير"],
    dose:["عادة 10–25% من المادة الجافة","لا تتجاوز 0.5% من وزن الجسم/وجبة"] },
  { id:"corn", name:"ذرة صفراء", latin:"Zea mays", local:false, protein:9, fiber:2.5, energy:3.4,
    benefits:["طاقة عالية لرفع الأداء"],
    risks:["تحتاج ألياف كافية لتجنب الحموضة","خطر سموم فطرية مع التخزين الرطب"],
    info:["مستورد غالبًا"],
    science:["نشا 65–70% • دهن 3–4%","ألياف منخفضة → أضِف خشونة"],
    dose:["10–20% من المادة الجافة","تدرّج 5–7 أيام"] },
  { id:"bran", name:"نخالة قمح", latin:"Wheat bran", local:false, protein:15, fiber:12, energy:2.5,
    benefits:["ترفع الألياف وتحسّن حركة الهضم","مصدر فوسفور جيّد"],
    risks:["طاقة/بروتين غير كافيين وحدها","نسبة Ca:P منخفضة"],
    info:["أثر بيئي منخفض نسبيًا"],
    science:["P ~1% • Ca منخفض • NDF متوسط","فيتات قد تقلل امتصاص معادن"],
    dose:["5–15% من الخلطة","وازنها مع مصدر كالسيوم"] },
  { id:"dates", name:"بقايا/نوى تمر مُعالج", latin:"Phoenix dactylifera (pits)", local:true, protein:6, fiber:18, energy:2.4,
    benefits:["خيار اقتصادي محلي مع ألياف","طاقة معتدلة بعد المعالجة"],
    risks:["يُستخدم باعتدال ضمن الخلطات","جودة/نظافة النوى أساسية"],
    info:["نظيف وخالٍ من العفن","الأفضل بعد الطحن/المعالجة"],
    science:["ليف/لجنين مرتفع • سكريات بعد المعالجة","تحسين التكسّر يرفع الاستفادة"],
    dose:["5–15% من الخلطة","تدرّج بطيء ومراقبة البراز"] },
  { id:"ghaf", name:"غاف", latin:"Prosopis cineraria", local:true, protein:13, fiber:16, energy:2.0,
    benefits:["بروتين + ألياف، يتحمل الجفاف","أوراق وقرون صالحة"],
    risks:["الإفراط قد يسبب مشاكل هضم"],
    info:["ينمو بالصحارى ويقلّل التكلفة"],
    science:["قرون الغاف: سكريات + ألياف قابلة للتخمر","تانينات منخفضة–متوسطة"],
    dose:["5–20% من الخلطة أو جزء الخشنة","أزِل الأشواك وراقب الجودة"] },
  { id:"moringa_p", name:"الشوع (مورينجا بيريجرينا)", latin:"Moringa peregrina", local:true, protein:22, fiber:12, energy:2.4,
    benefits:["يرفع البروتين والفيتامينات","نمو سريع في مناخ دافئ"],
    risks:["الزيادة قد تسبب إسهال"],
    info:["تحتاج مناخ دافئ"],
    science:["أوراق غنيّة بالبروتين والمعادن • مضادات أكسدة","ألياف متوسّطة ونسبة Ca ملحوظة"],
    dose:["5–10% كبودرة أوراق","ارفعها 1–2% أسبوعيًا"] },
  { id:"moringa_o", name:"مورينجا أوليفيرا", latin:"Moringa oleifera", local:true, protein:27, fiber:14, energy:2.3,
    benefits:["معادن/فيتامينات عالية","تحسّن التقبّل عند مزجها"],
    risks:["الإكثار قد يسبب اضطراب هضم"],
    info:["سريعة النمو وسهلة الإنتاج"],
    science:["Ca ملحوظ • P أقل • فيتامينات A/E","مركّبات حيوية طبيعية"],
    dose:["5–12% كبودرة أوراق/سيلاج","لا تفرط لتجنّب الإسهال"] },
  { id:"sporobolus", name:"سبوروبولس", latin:"Sporobolus spp.", local:true, protein:9, fiber:30, energy:1.8,
    benefits:["ألياف عالية تُحسّن الهضم","يتحمل الجفاف والتملّح"],
    risks:["إذا كان قديمًا تقل قيمته","خشونة عالية تتطلب توازن مع طاقة"],
    info:["ينمو بالرمال ويتحمل الجفاف"],
    science:["NDF مرتفع • بروتين منخفض/متوسط","قاعدة ألياف مع حبوب معتدلة"],
    dose:["15–40% من جزء الخشنة","راقب الوزن وعدّل الطاقة"] },
  { id:"soymeal", name:"كسب صويا", latin:"Glycine max (meal)", local:false, protein:44, fiber:7, energy:2.9,
    benefits:["يرفع البروتين بسرعة","يصحّح علائق منخفضة البروتين"],
    risks:["نِسَب صغيرة وبحذر","احتمال حساسية/طعم إن زادت"],
    info:["مستورد غالبًا"],
    science:["ليسين مرتفع • دهون منخفضة","يحتاج توازن Ca/P"],
    dose:["5–12% عادة، نادرًا 15% قصيرًا","قسّم على وجبتين"] },
];

let feedIndex = 0;
function renderFeedCard(){
  const f = FEEDS[feedIndex];
  $("#feedCard").innerHTML = `
    <div class="head">
      <div class="name">${f.name}</div>
      <div class="latin">${f.latin}</div>
      <div class="badges"><span class="chip">${f.local?"محلي":"مستورد"}</span></div>
    </div>

    <div class="feed-grid">
      <div>
        <div class="section-title">المواصفات</div>
        <div class="specs">
          <div class="spec"><span class="s">البروتين</span><span class="v">${f.protein}%</span></div>
          <div class="spec"><span class="s">الألياف</span><span class="v">${f.fiber}%</span></div>
          <div class="spec"><span class="s">الطاقة</span><span class="v">${f.energy}</span></div>
          <div class="spec"><span class="s">التصنيف</span><span class="v">${f.local?"محلي":"مستورد"}</span></div>
        </div>
        <div class="science">
          <div class="section-title">مختصر علمي</div>
          <ul class="list">${(f.science||[]).map(x=>`<li>• ${x}</li>`).join("") || "<li>—</li>"}</ul>
          ${f.dose?.length ? `<div class="section-title">نِسَب آمنة مقترحة</div><ul class="list">${f.dose.map(x=>`<li>• ${x}</li>`).join("")}</ul>` : ""}
          <small>⚠️ قيم تقريبية؛ تختلف حسب الجودة والعمر والمعالجة. راقب الأداء وعدِّل بالتدرّج.</small>
        </div>
      </div>

      <div>
        <div class="section-title">فوائد</div>
        <ul class="list">${f.benefits.map(x=>`<li>• ${x}</li>`).join("")}</ul>
        <div class="section-title">سلبيات/محاذير</div>
        <ul class="list">${f.risks.map(x=>`<li class="bad">• ${x}</li>`).join("")}</ul>
        ${f.info?.length? `<div class="section-title">نصائح استخدام</div><ul class="list">${f.info.map(x=>`<li>• ${x}</li>`).join("")}</ul>` : ""}
      </div>
    </div>

    <div class="score sub" style="text-align:center; margin-top:.4em">علف ${feedIndex+1} من ${FEEDS.length}</div>
  `;
}
$("#prevFeed")?.addEventListener("click", ()=>{ if(feedIndex>0){ feedIndex--; renderFeedCard(); } else toast("أول بطاقة","bad"); });
$("#nextFeed")?.addEventListener("click", ()=>{ if(feedIndex<FEEDS.length-1){ feedIndex++; renderFeedCard(); } else toast("انتهت البطاقات — ننتقل للمصمم","good"); });
$("#toMixer")?.addEventListener("click", ()=>{ initMixer(); showScreen("mixer"); });

/* Mixer */
const GUIDE_CAMELS = { protein:[10,16], fiberMin:18, energy:[2.0,3.0] };
const state = { selected:{} };

function initMixer(){
  state.selected = {};
  renderPalette();
  addFeed("alfalfa"); addFeed("barley");
  updateAll();
  $("#feedSearch").oninput = ()=> renderPalette($("#feedSearch").value.trim());
}
function renderPalette(q=""){
  const box = $("#paletteList"); box.innerHTML="";
  FEEDS.filter(f=> !q || (f.name+f.latin).toLowerCase().includes(q.toLowerCase()))
       .forEach(f=>{
         const el = document.createElement("div");
         el.className="p-card";
         el.innerHTML = `
           <div class="pc-head">
             <span class="t">${f.name}</span>
             <button class="add-mini" data-add="${f.id}" title="إضافة">+</button>
           </div>
           <div class="meta">بروتين ${f.protein}% • ألياف ${f.fiber}%</div>
           <div class="actions"><button class="btn primary lg" data-add="${f.id}">إضافة</button></div>
         `;
         box.appendChild(el);
       });
  $$("#paletteList [data-add]").forEach(b=> b.onclick = ()=>{ addFeed(b.dataset.add); updateAll(); toast("تمت الإضافة","good"); });
}
function addFeed(id){
  if(!(id in state.selected)){
    const keys = Object.keys(state.selected).concat([id]);
    const base = Math.floor(100/keys.length);
    keys.forEach(k=> state.selected[k] = base);
    const sum = Object.values(state.selected).reduce((a,b)=>a+b,0);
    const diff = 100 - sum;
    const first = Object.keys(state.selected)[0];
    if(first) state.selected[first]+=diff;
  }
}
function removeFeed(id){ delete state.selected[id]; }

function renderSelected(){
  const box = $("#selectedList"); box.innerHTML="";
  const keys = Object.keys(state.selected);
  if(!keys.length){
    box.innerHTML = `<section class="slide"><div class="kicker">ابدأ</div><h3>أضف مكونات</h3><div class="lede">اختر من القائمة ثم عدّل النِّسَب حتى يصل المجموع 100%</div></section>`;
    $("#blendChart").innerHTML=""; $("#blendTotal").textContent="0%"; return;
  }
  keys.forEach(id=>{
    const f = FEEDS.find(x=>x.id===id);
    const row = document.createElement("div");
    row.className="sel";
    row.innerHTML = `
      <div class="name">${f.name}</div>
      <div class="meta">بروتين ${f.protein}% • ألياف ${f.fiber}%</div>
      <input type="range" min="0" max="100" step="1" value="${state.selected[id]}" data-id="${id}">
      <div class="row">
        <div class="pct">${state.selected[id]}%</div>
        <button class="rm" data-del="${id}">حذف</button>
      </div>
    `;
    box.appendChild(row);
  });
  $$("#selectedList input[type=range]").forEach(sl=>{
    sl.oninput = ()=>{
      const id = sl.dataset.id; let val = parseInt(sl.value,10);
      const others = Object.keys(state.selected).filter(k=>k!==id);
      const otherSum = others.reduce((s,k)=>s+state.selected[k],0);
      const newOtherSum = Math.max(0, 100 - val);
      if(others.length && otherSum>0){
        others.forEach(k=> state.selected[k] = Math.max(0, Math.round(state.selected[k] * (newOtherSum/otherSum))));
      }
      state.selected[id] = val;
      const sum = Object.values(state.selected).reduce((a,b)=>a+b,0);
      const diff = 100 - sum;
      const first = Object.keys(state.selected)[0];
      if(first) state.selected[first]+=diff;
      updateAll();
    };
  });
  $$("#selectedList [data-del]").forEach(b=> b.onclick = ()=>{ removeFeed(b.dataset.del); updateAll(); toast("تم الحذف"); });
}
function renderChart(){
  const svg = $("#blendChart"); svg.innerHTML="";
  const keys = Object.keys(state.selected);
  if(!keys.length) return;
  const cx=120, cy=120, r=92, stroke=24; let start=0;
  keys.forEach((id,i)=>{
    const pct = state.selected[id]; if(pct<=0) return;
    const angle = pct/100 * 2*Math.PI;
    const x1 = cx + r*Math.cos(start), y1 = cy + r*Math.sin(start);
    const end = start + angle; const x2 = cx + r*Math.cos(end), y2 = cy + r*Math.sin(end);
    const path = document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("d",`M ${x1} ${y1} A ${r} ${r} 0 ${angle>Math.PI?1:0} 1 ${x2} ${y2}`);
    path.setAttribute("fill","none"); path.setAttribute("stroke", segmentColor(i)); path.setAttribute("stroke-width", stroke); path.setAttribute("stroke-linecap","round");
    svg.appendChild(path); start = end;
  });
  const sum = Object.values(state.selected).reduce((a,b)=>a+b,0);
  $("#blendTotal").textContent = sum+"%";
}
function segmentColor(i){
  const pal = ["#0ea5a1","#d97757","#f59e0b","#8b5cf6","#22c55e","#06b6d4","#ef4444","#14b8a6"];
  return pal[i % pal.length];
}
function computeBlend(){
  const keys = Object.keys(state.selected);
  if(!keys.length) return {protein:0,fiber:0,energy:0,localPct:0};
  let p=0,f=0,e=0,local=0;
  keys.forEach(id=>{
    const w = state.selected[id]/100; const item = FEEDS.find(x=>x.id===id);
    p += item.protein*w; f += item.fiber*w; e += item.energy*w;
    if(item.local) local += state.selected[id];
  });
  return { protein: Math.round(p*10)/10, fiber: Math.round(f*10)/10, energy: Math.round(e*10)/10, localPct: Math.round(local) };
}
function renderResult(){
  const g=GUIDE_CAMELS, out=computeBlend();
  $("#outProtein").textContent = out.protein+"%";
  $("#outFiber").textContent   = out.fiber+"%";
  $("#outEnergy").textContent  = out.energy;
  $("#outLocal").textContent   = out.localPct+"%";
  $("#protGuide").textContent  = `الموصى: ${g.protein[0]}–${g.protein[1]}%`;
  $("#fiberGuide").textContent = `حد أدنى: ${g.fiberMin}%`;
  $("#energyGuide").textContent= `الموصى: ${g.energy[0]}–${g.energy[1]}`;
  const warns=[];
  if(out.protein>g.protein[1]) warns.push("⚠️ بروتين مرتفع: خفّض الصويا/المورينجا قليلًا.");
  if(out.protein<g.protein[0]) warns.push("⚠️ بروتين منخفض: زد صويا/مورينجا 3–5%.");
  if(out.fiber<g.fiberMin)     warns.push("⚠️ ألياف منخفضة: زد سبوروبولس/نخالة/غاف.");
  if(out.energy>g.energy[1])   warns.push("⚠️ طاقة مرتفعة: خفّض ذرة/شعير.");
  if(out.energy<g.energy[0])   warns.push("⚠️ طاقة منخفضة: زد ذرة/شعير 2–4%.");
  if(out.localPct>=50) warns.push("✅ اعتماد محلي ممتاز."); else warns.push("ℹ️ ارفع نسبة المحلي (غاف/مورينجا/سبوروبولس).");
  const ul=$("#warnings"); ul.innerHTML=""; warns.forEach(w=>{ const li=document.createElement("li"); li.textContent=w; if(w.startsWith("✅")) li.classList.add("good"); ul.appendChild(li); });
}
function updateAll(){ renderSelected(); renderChart(); renderResult(); }

/* Taste Modal */
const tasteModal = $("#tasteModal");
$("#closeTaste")?.addEventListener("click", ()=> tasteModal.classList.add("hidden"));
$("#tasteOk")?.addEventListener("click", ()=> tasteModal.classList.add("hidden"));
function tasteBlend(){
  const g=GUIDE_CAMELS, out=computeBlend(); const tips=[]; let score=0;
  if(out.protein>=g.protein[0] && out.protein<=g.protein[1]) score+=2; else tips.push(out.protein<g.protein[0]?"زِد بروتين 3–5% (مورينجا/صويا).":"خفّض البروتين 3–5%.");
  if(out.fiber>=g.fiberMin) score+=2; else tips.push("الألياف قليلة؛ زد سبوروبولس/نخالة/غاف.");
  if(out.energy>=g.energy[0] && out.energy<=g.energy[1]) score+=2; else tips.push(out.energy<g.energy[0]?"الطاقة قليلة؛ زد شعير/ذرة 2–4%.":"الطاقة عالية؛ خفّض شعير/ذرة 2–4%.");
  if(out.localPct>=40) score+=1; else tips.push("ارفع المكوّنات المحلية قليلًا للاستدامة.");
  let verdict="جيد"; if(score>=6) verdict="ممتاز 👌"; else if(score<=2) verdict="يحتاج تعديل";
  $("#tasteTitle").textContent = "الجمل يجرّب الخلطة…";
  $("#tasteVerdict").textContent = `الحكم: ${verdict}`;
  $("#tasteTips").innerHTML = tips.length? tips.map(x=>`<li>${x}</li>`).join("") : "<li>توازن ممتاز—استمر وراقب الأداء.</li>";
  tasteModal.classList.remove("hidden");
}
$("#tryBlend")?.addEventListener("click", tasteBlend);
$("#resetBlend")?.addEventListener("click", ()=>{ state.selected={}; updateAll(); toast("تمت إعادة الضبط"); });

/* Quiz */
const QUIZ = [
  { q:"ليش الألياف مهمة للإبل؟", opts:["تحسّن الهضم وتقلل اضطرابات الكرش","ترفع الحموضة","تزيد العطش"], a:0 },
  { q:"متى نرفع الطاقة؟", opts:["للإبل السبوق/المجهدة","للصغار فقط","دائمًا بدون قياس"], a:0 },
  { q:"الإفراط في الحبوب ممكن يسبب:", opts:["حموضة ومشاكل هضم","تحسّن دائم","زيادة عطش فقط"], a:0 },
  { q:"مكوّن محلي غني بالألياف:", opts:["سبوروبولس","ذرة","صويا"], a:0 },
  { q:"إشارة بروتين زائد:", opts:["إسهال/إجهاد كبدي على المدى الطويل","نشاط طبيعي","عطش أقل"], a:0 },
  { q:"أفضل طريقة لتغيير العليقة:", opts:["تدرّج خلال أيام","تبديل مفاجئ","إيقاف الماء"], a:0 },
];
let quizIndex=0, quizScore=0, camelPos=0, qStart=0;
const MAX_SCORE = 1000;
const PER_Q = Math.round(MAX_SCORE / QUIZ.length);

function startQuiz(){
  quizIndex=0; quizScore=0; camelPos=0;
  renderQuestion();
  moveCamel();
  $("#quizScore").textContent="";
}
function resetQuiz(){
  quizIndex=0; quizScore=0; camelPos=0;
  $("#quizBox").innerHTML="";
  $("#quizScore").textContent="";
  moveCamel();
}

function renderQuestion(){
  const box=$("#quizBox");
  if(quizIndex>=QUIZ.length){
    camelPos = 100; moveCamel();
    const final = Math.min(MAX_SCORE, Math.max(0, quizScore));
    box.innerHTML = `<section class="slide">
      <div class="kicker">النتيجة النهائية</div>
      <h3>${final} / ${MAX_SCORE}</h3>
      <div class="lede">عدد الأسئلة: ${QUIZ.length}</div>
      <div class="points"><div>أحسنت! جرّب مرة أخرى لنتيجة أعلى.</div></div>
    </section>`;
    return;
  }
  const q=QUIZ[quizIndex];
  box.innerHTML = `
    <div class="q">${q.q}</div>
    ${q.opts.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join("")}
  `;
  qStart = performance.now();
  $$("#quiz .opt").forEach(b=>{
    b.onclick = ()=>{
      const i=+b.dataset.i; const t=(performance.now()-qStart)/1000; const correct=(i===q.a);

      let mult = 0.6; if(t<=3) mult = 1.0; else if(t<=6) mult = 0.8;
      const gained = correct ? Math.round(PER_Q * mult) : Math.round(PER_Q * 0.2);
      quizScore += gained;

      const progressPerQ = 100 / QUIZ.length;
      const speedAdj = correct ? (t<=3?1.25:(t<=6?1.05:0.9)) : 0.7;
      camelPos = Math.min(100, camelPos + progressPerQ * speedAdj);
      moveCamel();

      toast(correct ? "صحيح!" : "إجابة غير دقيقة", correct ? "good" : "bad");
      quizIndex++; renderQuestion();
      $("#quizScore").textContent = `النقاط الحالية: ${quizScore} / ${MAX_SCORE}`;
    };
  });
}
function moveCamel(){
  // الجمل يبدأ من اليمين ويتجه يسارًا نحو العلم
  const track = $(".track");
  const camel = $("#camel");
  const margin = 16;
  const maxRight = Math.max(0, track.clientWidth - camel.clientWidth - margin*2);
  const px = Math.max(0, Math.min(maxRight, Math.round(maxRight * (camelPos/100))));
  camel.style.right = (margin + px) + "px";
}

/* Navigation */
$$("[data-go='feeds']").forEach(b=> b.onclick = ()=>{ feedIndex=0; renderFeedCard(); showScreen("feeds"); });
$$("[data-go='mixer']").forEach(b=> b.onclick = ()=>{ initMixer(); showScreen("mixer"); });
$$("[data-go='quiz']").forEach(b=> b.onclick = ()=>{ showScreen("quiz"); });

/* Bind quiz buttons */
$("#startQuiz")?.addEventListener("click", startQuiz);
$("#resetQuiz")?.addEventListener("click", resetQuiz);

/* Init */
function init(){ showScreen("home"); }
init();
