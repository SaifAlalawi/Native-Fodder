'use strict';
const $  = (s, r=document)=> r.querySelector(s);
const $$ = (s, r=document)=> Array.from(r.querySelectorAll(s));

/* ===== ملء الشاشة + شعار + رجوع ===== */
function setFSClass(){ document.body.classList.toggle('is-fs', !!document.fullscreenElement); }
document.addEventListener('fullscreenchange', setFSClass);

$('#fsBtn')?.addEventListener('click', ()=>{
  if(!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
});

/* شعار: ضغطة ترجع للرئيسية — ضغط مطوّل 1 ثانية للخروج من ملء الشاشة */
let logoHoldT=null;
$('#topLogo')?.addEventListener('click', ()=>{ navStack.length=0; showScreen('home', false); });
function startLogoHold(){ clearTimeout(logoHoldT); logoHoldT=setTimeout(()=>{ if(document.fullscreenElement) document.exitFullscreen?.(); }, 1000); }
function endLogoHold(){ clearTimeout(logoHoldT); }
$('#topLogo')?.addEventListener('mousedown', startLogoHold);
$('#topLogo')?.addEventListener('touchstart', startLogoHold, {passive:true});
['mouseup','mouseleave','touchend','touchcancel'].forEach(ev=> $('#topLogo')?.addEventListener(ev, endLogoHold));

/* زر رجوع */
const navStack=[];
$('#backBtn')?.addEventListener('click', (e)=>{ e.preventDefault(); if(navStack.length) showScreen(navStack.pop(), false); else showScreen('home', false); });

/* ===== شاشات ===== */
let currentScreen = 'home';
function showScreen(id, push=true){
  if(id===currentScreen) return;
  const next = document.getElementById(id), prev = document.getElementById(currentScreen);
  if(prev){ prev.classList.remove('active'); prev.setAttribute('hidden',''); }
  if(next){ next.classList.add('active'); next.removeAttribute('hidden'); }
  if(push && currentScreen) navStack.push(currentScreen);
  currentScreen = id;
  document.body.classList.toggle('home-bg', id==='home');
  window.scrollTo(0,0);
}

/* تفعيل زر "ابدأ" + تفويض data-go */
(function activateStartAndNav(){
  const btn = document.getElementById('startBtn');
  if(btn){
    const go = (e)=>{ e.preventDefault?.(); showScreen('pick'); };
    ['pointerup','click','touchend'].forEach(ev=> btn.addEventListener(ev, go, {passive:false}));
  }
  window.addEventListener('click', (e)=>{
    const t = e.target.closest?.('[data-go]');
    if(!t) return;
    e.preventDefault?.();
    showScreen(t.getAttribute('data-go'));
  }, {capture:true});
})();

/* ===== الدروس كبطاقات ===== */
const LESSONS = [
  { id:"intro", title:"المقدمة", sub:"لماذا التغذية المتوازنة مهمة؟",
    points:[
      "تقوي المناعة وترفع النشاط والإنتاج وتقلل الحاجة للأدوية.",
      "سوء التغذية أو الإفراط يسبب مشاكل مزمنة ومصاريف علاجية."
    ]
  },
  { id:"issues", title:"الأمراض المرتبطة بالتغذية", sub:"أمثلة مختصرة",
    points:[
      "أمراض الكبد والكُلى عند الإفراط بالبروتين/الأملاح.",
      "تسمم غذائي من أعلاف ملوثة/متعفنة، وضعف عظام لنقص الكالسيوم."
    ]
  },
  { id:"basics", title:"أساسيات تغذية الإبل", sub:"الاحتياجات حسب الفئة",
    points:[
      "الصغار: بروتين أعلى للنمو.",
      "السبوق: طاقة أعلى مع ضبط الهضم.",
      "الحوامل: توازن + معادن (Ca/P)."
    ]
  },
  { id:"types", title:"أنواع الأعلاف", sub:"خضراء • جافة • مركزة • مخلفات",
    points:[
      "الخضراء: فيتامينات وماء؛ الإفراط يسبب انتفاخ.",
      "الجافة: ألياف تنظّم الهضم لكنها منخفضة الطاقة.",
      "المركزة: طاقة/بروتين عالية؛ الإفراط يسبب سمنة ومشاكل هضمية.",
      "مخلفات (كالتمر): اقتصادية بشرط النظافة."
    ]
  },
  { id:"local", title:"الأعلاف المحلية", sub:"الغاف • المورينجا • الشوع • سبوروبولس",
    points:[
      "محلية واقتصادية وتتحمل الظروف وتقلل الحاجة للأدوية.",
      "الغاف: بروتين + ألياف؛ الإفراط قد يسبب اضطراب هضم.",
      "المورينجا/الشوع: غنيتان بالبروتين والفيتامينات؛ التدرّج مهم.",
      "سبوروبولس: ألياف عالية وقليل الطاقة — قاعدة خشونة جيدة."
    ]
  },
  { id:"mix", title:"الدمج الذكي", sub:"خطوات عملية",
    points:[
      "لا تتجاوز 20–30% من نوع محلي واحد يوميًا.",
      "ارفع الألياف عند زيادة الحبوب، وبدّل تدريجيًا خلال أيام.",
      "راقب الوزن والبراز واستجب بالتعديل."
    ]
  },
  { id:"end", title:"الخلاصة", sub:"هدفنا صحة أفضل وتكلفة أقل",
    points:[
      "التغذية السليمة تقلل الأمراض المزمنة وترفع الأداء."
    ]
  }
];
function buildLessons(){
  const box = $("#lessonGrid"); if(!box) return;
  box.innerHTML = LESSONS.map(L=>`
    <div class="l-card">
      <h3 class="title">${L.title}</h3>
      <div class="sub">${L.sub}</div>
      <button class="btn flat sm more" data-lesson="${L.id}">المزيد</button>
    </div>
  `).join("");
  $$("#lessonGrid [data-lesson]").forEach(btn=>{
    btn.onclick = ()=>{
      const L = LESSONS.find(x=>x.id===btn.dataset.lesson);
      $("#lmTitle").textContent = L.title;
      $("#lmPoints").innerHTML = L.points.map(p=>`<li>${p.replace(/^[•\s]+/,'')}</li>`).join("");
      $("#lessonModal").classList.remove("hidden");
    };
  });
}
$$("#lessonModal [data-close]").forEach(b=> b.onclick = ()=> $("#lessonModal").classList.add("hidden"));
$("#lessonModal")?.addEventListener("click", (e)=>{ if(e.target===e.currentTarget) e.currentTarget.classList.add("hidden"); });

/* ===== الأعلاف ===== */
const FEEDS = [
  { id:"alfalfa", img:"Clover.png",   name:"برسيم (الجت)",              latin:"Medicago sativa", local:true,  protein:17, fiber:28, energy:2.2,
    benefits:["فيتامينات وماء، يدعم الهضم","ألياف منظِّمة للكرش"],
    risks:["الإكثار قد يسبب انتفاخ","ارتفاع الكالسيوم قد يخلّ بتوازن الفوسفور"],
    info:["زراعة محلية ممكنة بإدارة مياه"],
    science:["Ca ~1.2–1.5% • P ~0.2–0.3% • نسبة Ca:P ≈ 4–6:1","NDF 35–45% حسب العمر/القطع"],
    dose:["يمكن أن يشكّل 30–60% من مادة العلف الخشنة","راقب الوزن وحالة البراز"] },
  { id:"barley",  img:"Barley.png",   name:"شعير مجروش",                latin:"Hordeum vulgare", local:false, protein:12, fiber:5,  energy:3.0,
    benefits:["يرفع الطاقة للسبوق","قابلية هضم نشا جيدة"],
    risks:["قلة الألياف + كثرة الحبوب = حموضة","غبار الحبوب قد يهيّج التنفّس"],
    info:["غالبًا مستورد"],
    science:["نشا 55–60% • ألياف منخفضة","فضّل الجرش/التبخير"],
    dose:["عادة 10–25% من المادة الجافة","لا تتجاوز 0.5% من وزن الجسم/وجبة"] },
  { id:"corn",    img:"Corn.png",     name:"ذرة صفراء",                 latin:"Zea mays",        local:false, protein:9,  fiber:2.5,energy:3.4,
    benefits:["طاقة عالية لرفع الأداء"],
    risks:["تحتاج ألياف كافية لتجنب الحموضة","خطر سموم فطرية مع التخزين الرطب"],
    info:["مستورد غالبًا"],
    science:["نشا 65–70% • دهن 3–4%","ألياف منخفضة → أضِف خشونة"],
    dose:["10–20% من المادة الجافة","تدرّج 5–7 أيام"] },
  { id:"bran",    img:"Wheat.png",    name:"نخالة قمح",                 latin:"Wheat bran",      local:false, protein:15, fiber:12, energy:2.5,
    benefits:["ترفع الألياف وتحسّن حركة الهضم","مصدر فوسفور جيّد"],
    risks:["طاقة/بروتين غير كافيين وحدها","نسبة Ca:P منخفضة"],
    info:["أثر بيئي منخفض نسبيًا"],
    science:["P ~1% • Ca منخفض • NDF متوسط","فيتات قد تقلل امتصاص معادن"],
    dose:["5–15% من الخلطة","وازنها مع مصدر كالسيوم"] },
  { id:"dates",   img:"Date-Seed.png",name:"بقايا/نوى تمر مُعالج",      latin:"Phoenix dactylifera (pits)", local:true, protein:6, fiber:18, energy:2.4,
    benefits:["خيار اقتصادي محلي مع ألياف","طاقة معتدلة بعد المعالجة"],
    risks:["يُستخدم باعتدال ضمن الخلطات","جودة/نظافة النوى أساسية"],
    info:["نظيف وخالٍ من العفن","الأفضل بعد الطحن/المعالجة"],
    science:["ليف/لجنين مرتفع • سكريات بعد المعالجة","تحسين التكسّر يرفع الاستفادة"],
    dose:["5–15% من الخلطة","تدرّج بطيء ومراقبة البراز"] },
  { id:"ghaf",    img:"Gaff.png",     name:"غاف",                       latin:"Prosopis cineraria", local:true, protein:13, fiber:16, energy:2.0,
    benefits:["بروتين + ألياف، يتحمل الجفاف","أوراق وقرون صالحة"],
    risks:["الإفراط قد يسبب مشاكل هضم"],
    info:["ينمو بالصحارى ويقلّل التكلفة"],
    science:["قرون الغاف: سكريات + ألياف قابلة للتخمر","تانينات منخفضة–متوسطة"],
    dose:["5–20% من الخلطة أو جزء الخشنة","أزِل الأشواك وراقب الجودة"] },
  { id:"moringa_p",img:"Moringa-P.png",name:"الشوع (مورينجا بيريجرينا)",latin:"Moringa peregrina", local:true, protein:22, fiber:12, energy:2.4,
    benefits:["يرفع البروتين والفيتامينات","نمو سريع في مناخ دافئ"],
    risks:["الزيادة قد تسبب إسهال"],
    info:["تحتاج مناخ دافئ"],
    science:["أوراق غنيّة بالبروتين والمعادن • مضادات أكسدة","ألياف متوسّطة ونسبة Ca ملحوظة"],
    dose:["5–10% كبودرة أوراق","ارفعها 1–2% أسبوعيًا"] },
  { id:"moringa_o",img:"Moringa-O.png",name:"مورينجا أوليفيرا",         latin:"Moringa oleifera", local:true, protein:27, fiber:14, energy:2.3,
    benefits:["معادن/فيتامينات عالية","تحسّن التقبّل عند مزجها"],
    risks:["الإكثار قد يسبب اضطراب هضم"],
    info:["سريعة النمو وسهلة الإنتاج"],
    science:["Ca ملحوظ • P أقل • فيتامينات A/E","مركّبات حيوية طبيعية"],
    dose:["5–12% كبودرة أوراق/سيلاج","لا تفرط لتجنّب الإسهال"] },
  { id:"sporobolus",img:"Sporobolus.png",name:"سبوروبولس",              latin:"Sporobolus spp.",  local:true, protein:9,  fiber:30, energy:1.8,
    benefits:["ألياف عالية تُحسّن الهضم","يتحمل الجفاف والتملّح"],
    risks:["إذا كان قديمًا تقل قيمته","خشونة عالية تتطلب توازن مع طاقة"],
    info:["ينمو بالرمال ويتحمل الجفاف"],
    science:["NDF مرتفع • بروتين منخفض/متوسط","قاعدة ألياف مع حبوب معتدلة"],
    dose:["15–40% من جزء الخشنة","راقب الوزن وعدّل الطاقة"] },
  { id:"soymeal", img:"Soybeans.png", name:"كسب صويا",                  latin:"Glycine max (meal)", local:false, protein:44, fiber:7,  energy:2.9,
    benefits:["يرفع البروتين بسرعة","يصحّح علائق منخفضة البروتين"],
    risks:["نِسَب صغيرة وبحذر","احتمال حساسية/طعم إن زادت"],
    info:["مستورد غالبًا"],
    science:["ليسين مرتفع • دهون منخفضة","يحتاج توازن Ca/P"],
    dose:["5–12% عادة، نادرًا 15% قصيرًا","قسّم على وجبتين"] },
];
function buildFeedGrid(){
  const cont=$("#feedGrid"); if(!cont) return;
  cont.innerHTML = FEEDS.map(f=>`
    <div class="feed-tile" data-id="${f.id}">
      <img src="Images/${f.img}" alt="${f.name}">
      <div class="name">${f.name}</div>
      <div class="mini">${f.latin}</div>
      <div class="mini">${f.local?"محلي":"مستورد"} • بروتين ${f.protein}% • ألياف ${f.fiber}%</div>
      <button class="btn flat sm more" data-id="${f.id}">المزيد من التفاصيل</button>
    </div>
  `).join("");
  $$("#feedGrid .more").forEach(b=> b.onclick=()=> openFeedModal(b.dataset.id));
}
function cleanBullet(t){ return (t||"").replace(/^[•\s]+/,''); }
function listHTML(arr){ return (arr||[]).map(x=>`<li>${cleanBullet(x)}</li>`).join("") || "<li>—</li>"; }
function openFeedModal(id){
  const f = FEEDS.find(x=>x.id===id); if(!f) return;
  $("#fdImg").src = `Images/${f.img}`; $("#fdImg").alt = f.name;
  $("#feedModalTitle").textContent = f.name;
  $("#fdLatin").textContent = f.latin;
  $("#fdTags").innerHTML = `<span class="chip">${f.local?"محلي":"مستورد"}</span>`;
  $("#fdSpecs").innerHTML = `
    <div class="spec"><span class="s">البروتين</span><span class="v">${f.protein}%</span></div>
    <div class="spec"><span class="s">الألياف</span><span class="v">${f.fiber}%</span></div>
    <div class="spec"><span class="s">الطاقة</span><span class="v">${f.energy}</span></div>
    <div class="spec"><span class="s">التصنيف</span><span class="v">${f.local?"محلي":"مستورد"}</span></div>`;
  $("#fdSci").innerHTML = listHTML(f.science);
  $("#fdDoseWrap").innerHTML = f.dose?.length? `<div class="section-title">نِسَب آمنة مقترحة</div><ul class="list">${listHTML(f.dose)}</ul>`:"";
  $("#fdBenefits").innerHTML = listHTML(f.benefits);
  $("#fdRisks").innerHTML = listHTML(f.risks);
  $("#fdInfo").innerHTML = listHTML(f.info);
  $("#feedModal").classList.remove("hidden");
}
$$("#feedModal [data-close]").forEach(b=> b.onclick = ()=> $("#feedModal").classList.add("hidden"));
$("#fdOk")?.addEventListener("click", ()=> $("#feedModal").classList.add("hidden"));
$("#feedModal")?.addEventListener("click", (e)=>{ if(e.target.id==="feedModal") $("#feedModal").classList.add("hidden"); });

/* ===== المصمّم ===== */
const GUIDE_CAMELS = { protein:[10,16], fiberMin:18, energy:[2.0,3.0] };
const state = { selected:{} };

function renderPalette(){
  const box=$("#paletteList"); if(!box) return; box.innerHTML="";
  FEEDS.forEach(f=>{
    const el=document.createElement('div');
    el.className='p-card';
    el.innerHTML=`
      <div class="pc-media">
        <img src="Images/${f.img}" alt="${f.name}">
        <button class="plus" data-add="${f.id}" title="إضافة">＋</button>
      </div>
      <div class="pc-body">
        <div class="t">${f.name}</div>
        <div class="meta">بروتين ${f.protein}% • ألياف ${f.fiber}%</div>
      </div>
    `;
    box.appendChild(el);
  });
  $$("#paletteList [data-add]").forEach(b=> b.onclick=()=>{ addFeed(b.dataset.add); updateAll(); toast("تمت الإضافة","good"); });
}
function initMixer(){
  state.selected={};
  renderPalette();
  addFeed("alfalfa"); addFeed("barley");
  updateAll();
}
function addFeed(id){
  if(!(id in state.selected)){
    const keys=Object.keys(state.selected).concat([id]);
    const base=Math.floor(100/keys.length);
    keys.forEach(k=> state.selected[k]=base);
    const sum=Object.values(state.selected).reduce((a,b)=>a+b,0);
    const diff=100-sum;
    const first=Object.keys(state.selected)[0];
    if(first) state.selected[first]+=diff;
  }
}
function removeFeed(id){ delete state.selected[id]; }

function renderSelected(){
  const box=$("#selectedList"); if(!box) return; box.innerHTML="";
  const keys=Object.keys(state.selected);
  if(!keys.length){ $("#blendChart").innerHTML=""; $("#blendTotal").textContent="0%"; return; }
  keys.forEach(id=>{
    const f=FEEDS.find(x=>x.id===id);
    const row=document.createElement('div'); row.className='sel'; row.dataset.id=id;
    row.innerHTML = `
      <img class="sel-img" src="Images/${f.img}" alt="${f.name}">
      <div>
        <div class="name">${f.name}</div>
        <div class="meta">بروتين ${f.protein}% • ألياف ${f.fiber}%</div>
      </div>
      <input class="slider" type="range" min="0" max="100" step="1" value="${state.selected[id]}">
      <div class="row">
        <div class="pct">${state.selected[id]}%</div>
        <button class="rm" data-del="${id}">حذف</button>
      </div>`;
    box.appendChild(row);
  });

  $$("#selectedList .slider").forEach(sl=>{
    sl.addEventListener("input", ()=>{
      const holder=sl.closest(".sel"); const id = holder.dataset.id; let val= +sl.value;
      const others=Object.keys(state.selected).filter(k=>k!==id);
      const otherSum=others.reduce((s,k)=>s+state.selected[k],0);
      const newOtherSum=Math.max(0,100-val);
      if(others.length && otherSum>0){
        const ratio=newOtherSum/otherSum;
        others.forEach(k=> state.selected[k]=Math.max(0, Math.round(state.selected[k]*ratio)));
      }
      state.selected[id]=val;
      const sum=Object.values(state.selected).reduce((a,b)=>a+b,0);
      const diff=100-sum;
      const first=Object.keys(state.selected)[0]; if(first) state.selected[first]+=diff;
      holder.querySelector(".pct").textContent = state.selected[id] + "%";
      renderChart(); renderResult();
    }, {passive:true});
  });
  $$("#selectedList .rm").forEach(b=> b.onclick=()=>{ removeFeed(b.dataset.del); updateAll(); });
}
function renderChart(){
  const svg=$("#blendChart"); svg.innerHTML="";
  const keys=Object.keys(state.selected); if(!keys.length) return;
  const cx=120, cy=120, r=92, stroke=22; let start=0;
  keys.forEach((id,i)=>{
    const pct=state.selected[id]; if(pct<=0) return;
    const ang=pct/100*2*Math.PI;
    const x1=cx+r*Math.cos(start), y1=cy+r*Math.sin(start);
    const end=start+ang; const x2=cx+r*Math.cos(end), y2=cy+r*Math.sin(end);
    const path=document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("d",`M ${x1} ${y1} A ${r} ${r} 0 ${ang>Math.PI?1:0} 1 ${x2} ${y2}`);
    path.setAttribute("fill","none"); path.setAttribute("stroke", segmentColor(i));
    path.setAttribute("stroke-width", stroke); path.setAttribute("stroke-linecap","round");
    svg.appendChild(path); start=end;
  });
  const sum=Object.values(state.selected).reduce((a,b)=>a+b,0);
  $("#blendTotal").textContent=sum+"%";
}
function segmentColor(i){ const pal=["#0ea5a1","#d97757","#f59e0b","#8b5cf6","#22c55e","#06b6d4","#ef4444","#14b8a6"]; return pal[i%pal.length]; }
function computeBlend(){
  const keys=Object.keys(state.selected); if(!keys.length) return {protein:0,fiber:0,energy:0,localPct:0};
  let p=0,f=0,e=0,local=0;
  keys.forEach(id=>{ const w=state.selected[id]/100; const it=FEEDS.find(x=>x.id===id);
    p+=it.protein*w; f+=it.fiber*w; e+=it.energy*w; if(it.local) local+=state.selected[id];
  });
  return { protein:Math.round(p*10)/10, fiber:Math.round(f*10)/10, energy:Math.round(e*10)/10, localPct:Math.round(local) };
}
function renderResult(){
  const g=GUIDE_CAMELS, out=computeBlend();
  $("#outProtein").textContent=out.protein+"%";
  $("#outFiber").textContent=out.fiber+"%";
  $("#outEnergy").textContent=out.energy;
  $("#outLocal").textContent=out.localPct+"%";
  $("#protGuide").textContent=`الموصى: ${g.protein[0]}–${g.protein[1]}%`;
  $("#fiberGuide").textContent=`حد أدنى: ${g.fiberMin}%`;
  $("#energyGuide").textContent=`الموصى: ${g.energy[0]}–${g.energy[1]}`;
  const warns=[];
  if(out.protein>g.protein[1]) warns.push("بروتين مرتفع: خفّض صويا/مورينجا.");
  if(out.protein<g.protein[0]) warns.push("بروتين منخفض: زد صويا/مورينجا 3–5%.");
  if(out.fiber<g.fiberMin)     warns.push("ألياف منخفضة: زد سبوروبولس/نخالة/غاف.");
  if(out.energy>g.energy[1])   warns.push("طاقة مرتفعة: خفّض ذرة/شعير.");
  if(out.energy<g.energy[0])   warns.push("طاقة منخفضة: زد ذرة/شعير 2–4%.");
  warns.push(out.localPct>=50 ? "اعتماد محلي ممتاز." : "ارفع نسبة المحلي.");
  const ul=$("#warnings"); ul.innerHTML=""; warns.forEach(w=>{ const li=document.createElement("li"); li.textContent=w; if(w.includes("ممتاز")) li.classList.add("good"); ul.appendChild(li); });
}
function updateAll(){ renderSelected(); renderChart(); renderResult(); }
$("#resetBlend")?.addEventListener("click",()=>{ state.selected={}; updateAll(); renderPalette(); });
$("#tryBlend")?.addEventListener("click", ()=>{
  const g=GUIDE_CAMELS, out=computeBlend(); const tips=[]; let score=0;
  if(out.protein>=g.protein[0] && out.protein<=g.protein[1]) score+=2; else tips.push(out.protein<g.protein[0]?"زِد بروتين 3–5%.":"خفّض البروتين 3–5%.");
  if(out.fiber>=g.fiberMin) score+=2; else tips.push("الألياف قليلة؛ زد سبوروبولس/نخالة/غاف.");
  if(out.energy>=g.energy[0] && out.energy<=g.energy[1]) score+=2; else tips.push(out.energy<g.energy[0]?"الطاقة قليلة؛ زد شعير/ذرة.":"الطاقة عالية؛ خفّض شعير/ذرة.");
  if(out.localPct>=40) score+=1; else tips.push("ارفع المحلي قليلًا.");
  $("#tasteVerdict").textContent = `الحكم: ${score>=6?"ممتاز 👌": score<=2?"يحتاج تعديل":"جيد"}`;
  $("#tasteTips").innerHTML = tips.length? tips.map(x=>`<li>${x}</li>`).join("") : "<li>توازن ممتاز.</li>";
  $("#tasteModal").classList.remove("hidden");
});
$$("#tasteModal [data-close]").forEach(b=> b.onclick = ()=> $("#tasteModal").classList.add("hidden"));
$("#tasteOk")?.addEventListener("click", ()=> $("#tasteModal").classList.add("hidden"));
$("#tasteModal")?.addEventListener("click", (e)=>{ if(e.target===e.currentTarget) e.currentTarget.classList.add("hidden"); });

/* ===== إعداد السباق ===== */
const CAMEL_COLORS = [
  {id:"blue",img:"Blue-Camel.png"},{id:"light",img:"LightBlue-Camel.png"},
  {id:"green",img:"Green-Camel.png"},{id:"red",img:"Red-Camel.png"},
  {id:"purple",img:"Purple-Camel.png"},{id:"gray",img:"Gray-Camel.png"},
];
let player = {name:"برق", img:"Blue-Camel.png"};
function buildCamelColorPicker(){
  const box=$("#camelColors"); if(!box) return; box.innerHTML="";
  CAMEL_COLORS.forEach((c)=>{
    const el=document.createElement("button");
    el.className="pick"+(c.img===player.img?" active":"");
    el.innerHTML=`<img src="Images/${c.img}" alt="${c.id}">`;
    el.onclick=()=>{
      $$("#camelColors .pick").forEach(p=>p.classList.remove("active"));
      el.classList.add("active");
      player.img=c.img; $("#previewCamel").src=`Images/${c.img}`;
    };
    box.appendChild(el);
  });
  const name = $("#camelName");
  name.value = player.name;
  $("#previewCamel").src = `Images/${player.img}`;
  $("#previewName").textContent = player.name;
  name.oninput = ()=>{
    player.name = (name.value.trim()||"برق");
    $("#previewName").textContent = player.name;
  };
}
$("#startRace")?.addEventListener("click", ()=>{ setupRace(); showScreen("race"); });

/* ===== بنك الأسئلة ===== */
const QBANK = [
  { q:"ليش الألياف مهمة للإبل؟", opts:["تحسّن الهضم وتقلل اضطرابات الكرش","ترفع الحموضة","تزيد العطش"] },
  { q:"متى نرفع الطاقة؟", opts:["للإبل السبوق/المجهدة","للصغار فقط","دائمًا بدون قياس"] },
  { q:"الإفراط في الحبوب ممكن يسبب:", opts:["حموضة ومشاكل هضم","تحسّن دائم","زيادة عطش فقط"] },
  { q:"مكوّن محلي غني بالألياف:", opts:["سبوروبولس","ذرة","صويا"] },
  { q:"أفضل طريقة لتغيير العليقة:", opts:["تدرّج خلال أيام","تبديل مفاجئ","إيقاف الماء"] },
  { q:"علامة بروتين زائد:", opts:["إسهال/إجهاد كبدي على المدى الطويل","نشاط طبيعي","عطش أقل"] },
  { q:"رفع الذرة/الشعير يحتاج:", opts:["زيادة الألياف لتجنب الحموضة","تقليل الماء","إلغاء الخشونة"] },
  { q:"البرسيم يتميّز بـ:", opts:["نسبة كالسيوم مرتفعة نسبيًا","طاقة أعلى من الذرة","لا يحتاج ماء"] },
  { q:"أفضل استخدام لنخالة القمح:", opts:["تحسين الألياف والحركة","رفع الطاقة وحدها","بديل كامل للخشنة"] },
  { q:"الغاف مفيد لأنه:", opts:["مصدر بروتين + يتحمل الجفاف","خالي من الألياف","يُعطى بلا تدرّج"] },
  { q:"مورينجا أوليفيرا:", opts:["غنية بالمعادن والفيتامينات","طاقة أعلى من الذرة","تسبب سموم فطرية دائمًا"] },
  { q:"نوى التمر المُعالج:", opts:["يُستخدم بنِسب معتدلة داخل الخلطات","بديل كامل للألياف","لا يحتاج معالجة"] },
];
function pick6(){
  const pool=QBANK.slice(), out=[];
  while(out.length<6 && pool.length){ out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]); }
  return out.map(q=>{
    const meta=q.opts.map((t,i)=>({t,ok:i===0})).sort(()=>Math.random()-0.5);
    return { q:q.q, opts:meta.map(x=>x.t), a:meta.findIndex(x=>x.ok) };
  });
}

/* ===== السباق + التحدي ===== */
let racers=[], raceRAF=0, lastTs=0, quizList=[], quizIndex=0, quizScore=0, raceActive=false, finished=false;

function setupRace(){
  buildCamelColorPicker();
  const colors = CAMEL_COLORS.slice();
  const pIdx = colors.findIndex(c=> c.img===player.img);
  if(pIdx>0){ const [p]=colors.splice(pIdx,1); colors.unshift(p); }
  const others = colors.slice(1,4);
  racers = [
    {name:player.name, img:player.img, pos:0, base:12, boost:0, isPlayer:true},
    ...others.map(c=>({name:"", img:c.img, pos:0, base:11+Math.random()*2.5, boost:0, isPlayer:false}))
  ];

  // رسم المسارات — اللاعب في الأسفل
  const lanes=$("#lanes"); lanes.innerHTML="";
  const ordered=[...racers.slice(1), racers[0]];
  ordered.forEach(r=>{
    const lane=document.createElement("div"); lane.className="lane";
    const camel=document.createElement("img"); camel.className="camel-sprite"; camel.src=`Images/${r.img}`;
    lane.appendChild(camel);
    if(r.isPlayer){
      const tag=document.createElement("div");
      tag.className="name-tag race-tag";
      tag.textContent=r.name;
      lane.appendChild(tag);
      r.badge=tag;
    }
    lanes.appendChild(lane); r.el=camel;
  });

  // الأسئلة
  quizList=pick6(); quizIndex=0; quizScore=0;
  $("#quizBox").classList.add("hidden");
  renderQuestion();

  raceActive=false; finished=false;
  $("#startChallenge").classList.remove("hidden");

  lastTs=performance.now();
  cancelAnimationFrame(raceRAF);
  raceRAF=requestAnimationFrame(raceLoop);
}

function raceLoop(ts){
  const dt=Math.min(0.05,(ts-lastTs)/1000); lastTs=ts;
  if(raceActive && !finished){
    racers.forEach(r=>{
      const v = r.base + r.boost;
      r.pos = Math.min(100, r.pos + (v*dt)/2.8);
      if(r.boost>0) r.boost = Math.max(0, r.boost - 10*dt);
      const trackW = ($(".track.race-bg").clientWidth-140);
      const px = Math.round(trackW * (r.pos/100));
      r.el.style.right = (16 + px) + "px";
      if(r.badge) r.badge.style.right = (16 + px) + "px";
    });

    const someoneFinished = racers.some(r=> r.pos>=100);
    if(someoneFinished && quizIndex>=quizList.length){
      finished=true; showRaceResult(); cancelAnimationFrame(raceRAF); return;
    }
  }
  raceRAF=requestAnimationFrame(raceLoop);
}

$("#startChallenge")?.addEventListener("click", (e)=>{
  e.currentTarget.classList.add("hidden");
  $("#quizBox").classList.remove("hidden");
  raceActive=true;
  lastTs=performance.now();
});

$("#resetQuiz")?.addEventListener("click", ()=>{ setupRace(); });

function renderQuestion(){
  const box=$("#quizBox");
  if(quizIndex>=quizList.length){
    box.innerHTML = `<div class="q">انتهت الأسئلة — تابع السباق حتى خط النهاية…</div>`;
    return;
  }
  const q=quizList[quizIndex];
  box.innerHTML = `
    <div class="q">${q.q}</div>
    ${q.opts.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join("")}
  `;
  const start = performance.now();
  $$("#race .opt").forEach(btn=>{
    btn.onclick = ()=>{
      const t=(performance.now()-start)/1000;
      const correct=(+btn.dataset.i===q.a);
      const PER = 200; let mult = t<=3?1 : t<=6?0.8 : 0.6;
      const gained = correct ? Math.round(PER*mult) : 0;
      quizScore += gained;

      const me = racers.find(r=>r.isPlayer);
      if(me && correct){ me.boost = 24; }

      quizIndex++; renderQuestion();
    };
  });
}

function showRaceResult(){
  const sorted = racers.slice().sort((a,b)=> b.pos - a.pos);
  const rank = sorted.findIndex(r=> r.isPlayer) + 1;
  const places=["الأول","الثاني","الثالث","الرابع"];
  $("#quizBox").innerHTML = `
    <div class="q">انتهى السباق!</div>
    <div class="q">مركزك: <strong>${places[rank-1]||rank}</strong> — نقاطك: <strong>${quizScore}</strong></div>
  `;
  toast(`مركزك: ${places[rank-1]||rank}`, "good");
}

/* ===== توست ===== */
function toast(msg, kind="info"){
  const el=$("#toast"); if(!el) return;
  el.textContent=msg; el.className="toast show "+kind;
  clearTimeout(toast._t); toast._t=setTimeout(()=> el.classList.remove("show"), 1700);
}

/* ===== تهيئة ===== */
function init(){
  buildLessons();
  buildFeedGrid();
  renderPalette();
  buildCamelColorPicker();
  $("#toMixer")?.addEventListener("click", ()=> initMixer());
}
window.addEventListener('load', init);
