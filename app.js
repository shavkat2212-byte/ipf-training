// ИПФ — обучение сотрудников (М Булак). Bump VERSION (and ?v= in index.html) after adding/changing lessons.
const VERSION = "3";
const T = {
  ru:{brand:"ИПФ — обучение сотрудников",sub:"Исламское окно М Булак · 5 недель, 1 урок в неделю",week:"Неделя",soon:"Скоро",done:"Пройден",best:"Лучший результат",goal:"Цель урока",theses:"Основные тезисы",test:"Пройти тест",back:"← К урокам",q:"Вопрос",of:"из",next:"Далее",finish:"Результат",res:"Результат теста",pass:"Урок пройден ✅",fail:"Нужно 80% и выше. Перечитайте тезисы и попробуйте ещё раз.",retry:"Пройти ещё раз",toLesson:"К тезисам",load:"Загрузка…",err:"Не удалось загрузить. Проверьте интернет."},
  ky:{brand:"ИПФ — кызматкерлерди окутуу",sub:"М Булактын Исламдык терезеси · 5 жума, жумасына 1 сабак",week:"Жума",soon:"Жакында",done:"Өттү",best:"Эң жакшы жыйынтык",goal:"Сабактын максаты",theses:"Негизги тезистер",test:"Тест тапшыруу",back:"← Сабактарга",q:"Суроо",of:"ичинен",next:"Кийинки",finish:"Жыйынтык",res:"Тесттин жыйынтыгы",pass:"Сабак өттү ✅",fail:"80% жана андан жогору керек. Тезистерди кайра окуп, дагы аракет кылыңыз.",retry:"Кайра тапшыруу",toLesson:"Тезистерге",load:"Жүктөлүүдө…",err:"Жүктөлгөн жок. Интернетти текшериңиз."}
};
const LS="ipf_progress_v1";
let lang=localStorage.getItem("ipf_lang")||"ru";
const prog=()=>JSON.parse(localStorage.getItem(LS)||'{"done":{},"best":{}}');
const saveProg=p=>localStorage.setItem(LS,JSON.stringify(p));
const t=k=>T[lang][k], L=o=>o?(o[lang]||o.ru):"";
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
  }).join("");
}
async function lesson(id){
  const l=await getJSON(`lessons/${id}.json`),p=prog();
  app.innerHTML=`<a href="#/" class="muted">${t("back")}</a><div class="wk" style="margin-top:10px">${t("week")} ${l.week}</div><h1>${esc(L(l.title))}</h1>${l.cover?`<img class="cover" src="${esc(l.cover)}" alt="">`:""}
  <div class="goal"><b>${t("goal")}:</b> ${esc(L(l.goal))}</div><h2>${t("theses")}</h2>`+
  l.theses.map((th,i)=>`<div class="card th${th.image?" has-img":""}">${th.image?`<img class="th-img" src="${esc(th.image)}" alt="" loading="lazy">`:""}<div class="num">${i+1}</div><div>${esc(L(th))}</div></div>`).join("")+
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
