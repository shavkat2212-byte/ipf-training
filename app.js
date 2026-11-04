// ИПФ — обучение сотрудников (М Булак). Bump VERSION (and ?v= in index.html) after adding/changing lessons.
const VERSION = "12";
const T = {
  ru:{brand:"ИПФ — обучение сотрудников",sub:"Исламское окно М Булак · 5 недель, 1 урок в неделю",week:"Неделя",soon:"Скоро",done:"Пройден",best:"Лучший результат",goal:"Цель урока",theses:"Учебный материал",kTheory:"Теория",kSteps:"Шаги",kExample:"Пример",test:"Пройти тест",back:"← К урокам",q:"Вопрос",of:"из",next:"Далее",finish:"Результат",res:"Результат теста",pass:"Урок пройден ✅",fail:"Нужно 80% и выше. Перечитайте учебный материал и попробуйте ещё раз.",retry:"Пройти ещё раз",toLesson:"К материалу урока",books:"Книги",noBooks:"Книги скоро появятся.",dl:"Скачать PDF",qs:"Вопросы",qsIntro:"Задайте вопрос по ИПФ — ответ придёт на почту, а частые вопросы опубликуем здесь.",qName:"Ваше имя (необязательно)",qText:"Ваш вопрос",qSend:"Отправить вопрос",qMail:"Если письмо не открылось, напишите на",qEmpty:"Ответы появятся здесь.",qAns:"Ответы на вопросы",load:"Загрузка…",err:"Не удалось загрузить. Проверьте интернет."},
  ky:{brand:"ИПФ — кызматкерлерди окутуу",sub:"М Булактын Исламдык терезеси · 5 жума, жумасына 1 сабак",week:"Жума",soon:"Жакында",done:"Өттү",best:"Эң жакшы жыйынтык",goal:"Сабактын максаты",theses:"Материал сабагы",kTheory:"Теория",kSteps:"Кадамдар",kExample:"Мисал",test:"Тест тапшыруу",back:"← Сабактарга",q:"Суроо",of:"ичинен",next:"Кийинки",finish:"Жыйынтык",res:"Тесттин жыйынтыгы",pass:"Сабак өттү ✅",fail:"80% жана андан жогору керек. Сабактын материалын кайра окуп, дагы аракет кылыңыз.",retry:"Кайра тапшыруу",toLesson:"Сабактын материалына",books:"Китептер",noBooks:"Китептер жакында кошулат.",dl:"PDF жүктөп алуу",qs:"Суроолор",qsIntro:"ИПФ боюнча суроо бериңиз — жооп почтага келет, ал эми көп берилген суроолорду бул жерге жарыялайбыз.",qName:"Атыңыз (милдеттүү эмес)",qText:"Сурооңуз",qSend:"Суроо жөнөтүү",qMail:"Эгер кат ачылбаса, бул дарекке жазыңыз:",qEmpty:"Жооптор бул жерде пайда болот.",qAns:"Суроолорго жооптор",load:"Жүктөлүүдө…",err:"Жүктөлгөн жок. Интернетти текшериңиз."}
};
const LS="ipf_progress_v1";
let lang=localStorage.getItem("ipf_lang")||"ru";
const prog=()=>JSON.parse(localStorage.getItem(LS)||'{"done":{},"best":{}}');
const saveProg=p=>localStorage.setItem(LS,JSON.stringify(p));
const t=k=>T[lang][k], L=o=>o?(o[lang]||o.ru):"";
const MAIL="sh.tashhodjaev@mbulak.kg";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cache={};
const getJSON=url=>cache[url]||(cache[url]=fetch(url+"?v="+VERSION,{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error(url);return r.json()}).catch(e=>{delete cache[url];throw e}));
const app=document.getElementById("app");
let quiz=null;

function setLang(l){lang=l;localStorage.setItem("ipf_lang",l);document.documentElement.lang=l==="ky"?"ky":"ru";
  document.querySelectorAll(".lang button").forEach(b=>b.classList.toggle("on",b.dataset.l===l));
  document.getElementById("brand").textContent=t("brand");quiz?renderQuiz():route();}
document.querySelectorAll(".lang button").forEach(b=>b.onclick=()=>setLang(b.dataset.l));

async function home(){
  const idx=await getJSON("lessons/index.json"),p=prog();
  app.innerHTML=`<h1>${t("brand")}</h1><p class="muted">${t("sub")}</p>`+idx.lessons.map(x=>{
    const done=p.done[x.id],best=p.best[x.id];
    const badge=!x.ready?`<span class="badge">🔒 ${t("soon")}</span>`:done?`<span class="badge done">✓ ${t("done")}</span>`:best!=null?`<span class="badge">${best}%</span>`:"";
    const inner=`${badge}<div class="wk">${t("week")} ${x.week}</div><div><b>${esc(L(x.title))}</b></div>`;
    return x.ready?`<a class="card" href="#/lesson/${x.id}">${inner}</a>`:`<div class="card locked">${inner}</div>`;
  }).join("")+`<h2>📚 ${t("books")}</h2><div id="books" class="muted">${t("load")}</div>`+
  `<h2>❓ ${t("qs")}</h2><div class="card"><p class="muted">${t("qsIntro")}</p><input id="qn" class="inp" placeholder="${t("qName")}"><textarea id="qt" class="inp" rows="4" placeholder="${t("qText")}"></textarea><button class="btn" id="qsend">${t("qSend")}</button><p class="muted">${t("qMail")} <a href="mailto:${MAIL}">${MAIL}</a></p></div><h2>${t("qAns")}</h2><div id="ans" class="muted">${t("load")}</div>`;
  document.getElementById("qsend").onclick=()=>{const q=document.getElementById("qt").value.trim();if(!q)return;const n=document.getElementById("qn").value.trim();
    location.href=`mailto:${MAIL}?subject=${encodeURIComponent("[ИПФ вопрос]"+(n?" "+n:""))}&body=${encodeURIComponent((n?n+":\n":"")+q)}`;};
  getJSON("questions/answers.json").then(a=>{const el=document.getElementById("ans");if(!el)return;el.className="";
    el.innerHTML=a.items.length?a.items.map(x=>`<div class="card"><b>${esc(L(x.q))}</b><p>${esc(L(x.a))}</p></div>`).join(""):`<p class="muted">${t("qEmpty")}</p>`;}).catch(()=>{});
  getJSON("books/index.json").then(b=>{const el=document.getElementById("books");if(!el)return;
    el.className="";el.innerHTML=b.books.length?b.books.map(k=>`<a class="card" href="${esc(k.file)}" target="_blank" rel="noopener" download><div><b>${esc(L(k.title))}</b></div><div class="muted">${t("dl")}${k.size?" · "+esc(k.size):""}</div></a>`).join(""):`<p class="muted">${t("noBooks")}</p>`;
  }).catch(()=>{const el=document.getElementById("books");if(el)el.textContent=t("err")});
}
async function lesson(id){
  const l=await getJSON(`lessons/${id}.json`),p=prog();
  app.innerHTML=`<a href="#/" class="muted">${t("back")}</a><div class="wk" style="margin-top:10px">${t("week")} ${l.week}</div><h1>${esc(L(l.title))}</h1>${l.cover?`<img class="cover" src="${esc(l.cover)}" alt="">`:""}
  <div class="goal"><b>${t("goal")}:</b> ${esc(L(l.goal))}</div><h2>${t("theses")}</h2>`+
  (l.sections||[]).map(sec=>{const k=sec.kind||"theory",kl={theory:"kTheory",steps:"kSteps",example:"kExample"}[k]||"kTheory";
   return `<section class="card sec sec-${k}">${sec.image?`<img class="th-img" src="${esc(sec.image)}" alt="" loading="lazy">`:""}<span class="badge b-${k}">${t(kl)}</span><h3>${esc(L(sec.title))}</h3>`+
   (sec.body?L(sec.body).split(/\n\n+/).map(x=>`<p>${esc(x)}</p>`).join(""):"")+
   (sec.steps?`<ol class="steps">${sec.steps.map(x=>`<li>${esc(L(x))}</li>`).join("")}</ol>`:"")+`</section>`}).join("")+
  (l.theses||[]).map((th,i)=>`<div class="card th"><div class="num">${i+1}</div><div>${esc(L(th))}</div></div>`).join("")+
  (p.best[id]!=null?`<p class="muted center">${t("best")}: ${p.best[id]}%</p>`:"")+
  (l.quiz&&l.quiz.length?`<a class="btn" href="#/quiz/${id}">${t("test")}</a>`:"");
}
async function startQuiz(id){const l=await getJSON(`lessons/${id}.json`);quiz={id,l,i:0,score:0,picked:null};renderQuiz();}
function renderQuiz(){
  const {l,i}=quiz;
  if(i>=l.quiz.length)return result();
  const q=l.quiz[i],pk=quiz.picked;
  app.innerHTML=`<a href="#/lesson/${quiz.id}" class="muted">${t("toLesson")}</a>
  <p class="muted">${t("q")} ${i+1} ${t("of")} ${l.quiz.length}</p><div class="bar"><i style="width:${i/l.quiz.length*100}%"></i></div>
  <h2>${esc(L(q.q))}</h2>`+q.options.map((o,k)=>{
    let c="opt";if(pk!=null){if(k===q.correct)c+=" ok";else if(k===pk)c+=" bad";}
    return `<button class="${c}" data-k="${k}" ${pk!=null?"disabled":""}><b>${"ABCD"[k]})</b> ${esc(L(o))}</button>`}).join("")+
  (pk!=null?`<button class="btn" id="nx">${i+1<l.quiz.length?t("next"):t("finish")}</button>`:"");
  app.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{quiz.picked=+b.dataset.k;if(quiz.picked===q.correct)quiz.score++;renderQuiz();});
  const nx=document.getElementById("nx");if(nx)nx.onclick=()=>{quiz.i++;quiz.picked=null;renderQuiz();};
}
function result(){
  const {id,l,score}=quiz,n=l.quiz.length,pct=Math.round(score/n*100),ok=pct>=80,p=prog();
  if(ok)p.done[id]=true; p.best[id]=Math.max(p.best[id]||0,pct); saveProg(p);
  app.innerHTML=`<h2 class="center">${t("res")}</h2><div class="score">${score}/${n}</div><p class="center">${pct}%</p>
  <p class="center"><b>${ok?t("pass"):t("fail")}</b></p>
  <a class="btn" href="#/quiz/${id}" id="re">${t("retry")}</a><a class="btn sec" href="#/">${t("back")}</a>`;
  document.getElementById("re").onclick=e=>{e.preventDefault();startQuiz(id);};
}
async function route(){
  quiz=null;const h=location.hash.slice(2).split("/");
  app.innerHTML=`<p class="muted center">${t("load")}</p>`;
  try{ if(h[0]==="lesson")await lesson(h[1]); else if(h[0]==="quiz")await startQuiz(h[1]); else await home(); window.scrollTo(0,0);}
  catch(e){app.innerHTML=`<p class="center">${t("err")}</p>`;}
}
window.onhashchange=route;
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js?v="+VERSION).catch(()=>{});
setLang(lang);
