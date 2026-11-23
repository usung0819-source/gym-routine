// 요일별 운동 알림 발송 (GitHub Actions에서 10분마다 실행). 외부 패키지 없이 Node 내장 기능만 사용.
// 필요: 저장소 Secret FCM_SA = Firebase 서비스 계정 키(JSON 전체).
// 공개 저장소라 실행 기록이 공개되므로, 로그에는 개인 정보(UID·운동 이름·시간)를 남기지 않고 개수만 남긴다.
"use strict";
const crypto = require("crypto");
const APP_URL = "https://usung0819-source.github.io/gym-routine/?from=push";
const WINDOW_MIN = 120; // 정한 시각 이후 이 시간(분) 안에만 보냄 (GitHub 예약 실행 지연 대비)

function b64u(x){return Buffer.from(x).toString("base64url");}
async function accessToken(sa, fetchFn){
  const iat=Math.floor(Date.now()/1000);
  const head=b64u(JSON.stringify({alg:"RS256",typ:"JWT"}));
  const claim=b64u(JSON.stringify({iss:sa.client_email,scope:"https://www.googleapis.com/auth/cloud-platform",aud:"https://oauth2.googleapis.com/token",iat,exp:iat+3600}));
  const sig=crypto.createSign("RSA-SHA256").update(head+"."+claim).sign(sa.private_key,"base64url");
  const r=await fetchFn("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type="+encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")+"&assertion="+head+"."+claim+"."+sig});
  const j=await r.json(); if(!j.access_token) throw new Error("토큰 발급 실패: "+(j.error||r.status));
  return j.access_token;
}
// Firestore REST 값 → JS 값
function dec(v){
  if(!v) return null;
  if("stringValue" in v) return v.stringValue;
  if("integerValue" in v) return Number(v.integerValue);
  if("doubleValue" in v) return v.doubleValue;
  if("booleanValue" in v) return v.booleanValue;
  if("nullValue" in v) return null;
  if("timestampValue" in v) return Date.parse(v.timestampValue);
  if("arrayValue" in v) return (v.arrayValue.values||[]).map(dec);
  if("mapValue" in v){const o={};const f=v.mapValue.fields||{};for(const k in f)o[k]=dec(f[k]);return o;}
  return null;
}
function enc(x){
  if(x===null||x===undefined) return {nullValue:null};
  if(Array.isArray(x)) return {arrayValue:{values:x.map(enc)}};
  if(typeof x==="string") return {stringValue:x};
  if(typeof x==="boolean") return {booleanValue:x};
  if(typeof x==="number") return Number.isInteger(x)?{integerValue:String(x)}:{doubleValue:x};
  if(typeof x==="object"){const f={};for(const k in x)f[k]=enc(x[k]);return {mapValue:{fields:f}};}
  return {nullValue:null};
}
async function listAll(base, col, tok, fetchFn){
  const out={};let page="";
  do{
    const r=await fetchFn(base+"/"+col+"?pageSize=300"+(page?"&pageToken="+encodeURIComponent(page):""),{headers:{Authorization:"Bearer "+tok}});
    const j=await r.json(); if(j.error) throw new Error(col+" 읽기 실패: "+j.error.status);
    (j.documents||[]).forEach(d=>{const id=d.name.split("/").pop();out[id]=dec({mapValue:{fields:d.fields||{}}});});
    page=j.nextPageToken||"";
  }while(page);
  return out;
}
async function patch(base, path, obj, tok, fetchFn){
  const mask=Object.keys(obj).map(k=>"updateMask.fieldPaths="+encodeURIComponent(k)).join("&");
  const f={};for(const k in obj)f[k]=enc(obj[k]);
  const r=await fetchFn(base+"/"+path+"?"+mask,{method:"PATCH",headers:{Authorization:"Bearer "+tok,"Content-Type":"application/json"},body:JSON.stringify({fields:f})});
  if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error("쓰기 실패: "+((j.error&&j.error.status)||r.status));}
}
async function sendOne(pid, token, msg, tok, fetchFn){
  const r=await fetchFn("https://fcm.googleapis.com/v1/projects/"+pid+"/messages:send",{method:"POST",headers:{Authorization:"Bearer "+tok,"Content-Type":"application/json"},
    body:JSON.stringify({message:{token,data:{title:msg.title,body:msg.body,url:APP_URL,tag:msg.tag},webpush:{headers:{TTL:"7200",Urgency:"high"}}}})});
  if(r.ok) return "ok";
  const j=await r.json().catch(()=>({}));const st=(j.error&&j.error.status)||"";
  const det=JSON.stringify(j.error&&j.error.details||[]);
  if(r.status===404||st==="NOT_FOUND"||det.indexOf("UNREGISTERED")>=0||(st==="INVALID_ARGUMENT"&&det.indexOf("token")>=0)) return "gone";
  return "fail:"+(st||r.status);
}
// 한국 시간 기준 오늘 날짜·요일·분
function kstNow(ms){const k=new Date(ms+9*3600e3);return {date:k.toISOString().slice(0,10),wd:["sun","mon","tue","wed","thu","fri","sat"][k.getUTCDay()],min:k.getUTCHours()*60+k.getUTCMinutes()};}
function toMin(t){const m=/^(\d{1,2}):(\d{2})$/.exec(t||"");return m?(+m[1])*60+(+m[2]):-1;}
// 한 사용자에게 지금 보낼 알림을 정한다 (순수 함수: 테스트용)
function decide(doc, log, now, nowMs){
  const out={send:[],logUpd:{}};
  if(!doc||!doc.on||!Array.isArray(doc.tokens)||!doc.tokens.length) return out;
  log=log||{};
  if(doc.test&&doc.test>(log.lastTest||0)&&nowMs-doc.test<2*3600e3){
    out.send.push({title:"알림 테스트",body:"서버 알림이 정상으로 도착했습니다. 정한 요일·시간에 이렇게 알려드립니다.",tag:"gym-test"});
    out.logUpd.lastTest=doc.test;
  }
  const tm=toMin(doc.times&&doc.times[now.wd]);
  if(tm<0||now.min<tm||now.min-tm>WINDOW_MIN||log.last===now.date) return out;
  const e=doc.days&&doc.days[now.date];
  if(e&&e.t!=="s"){out.logUpd.last=now.date;return out;}           // 술약속·회복일·쉬는 날: 보내지 않음
  const ti=e?e.ti:(doc.wk&&doc.wk[now.wd]);
  if(!ti){out.logUpd.last=now.date;return out;}                    // 운동 없는 요일
  out.send.push({title:"오늘 운동: "+ti,body:(e&&e.m?"약 "+e.m+"분 · ":"")+"준비운동부터 천천히 시작하세요.",tag:"gym-"+now.date});
  out.logUpd.last=now.date;
  return out;
}
async function main(fetchFn, env, nowMs){
  fetchFn=fetchFn||fetch;env=env||process.env;nowMs=nowMs||Date.now();
  if(!env.FCM_SA){console.log("FCM_SA Secret이 없어 건너뜁니다.");return {skipped:true};}
  const sa=JSON.parse(env.FCM_SA),pid=sa.project_id;
  const tok=await accessToken(sa,fetchFn);
  const base="https://firestore.googleapis.com/v1/projects/"+pid+"/databases/(default)/documents";
  const [docs,logs]=await Promise.all([listAll(base,"push",tok,fetchFn),listAll(base,"pushlog",tok,fetchFn)]);
  const now=kstNow(nowMs);let users=0,sent=0,gone=0,fail=0;
  for(const uid of Object.keys(docs)){
    const doc=docs[uid],d=decide(doc,logs[uid],now,nowMs);
    if(doc&&doc.on)users++;
    const bad=new Set();
    for(const m of d.send)for(const t of doc.tokens){const r=await sendOne(pid,t,m,tok,fetchFn);if(r==="ok")sent++;else if(r==="gone"){gone++;bad.add(t);}else fail++;}
    if(bad.size)await patch(base,"push/"+uid,{tokens:doc.tokens.filter(t=>!bad.has(t))},tok,fetchFn);
    if(Object.keys(d.logUpd).length)await patch(base,"pushlog/"+uid,d.logUpd,tok,fetchFn);
  }
  console.log("알림 켠 사용자 "+users+"명, 보냄 "+sent+", 만료 토큰 정리 "+gone+", 실패 "+fail);
  return {users,sent,gone,fail};
}
module.exports={decide,kstNow,toMin,dec,enc,main};
if(require.main===module)main().catch(e=>{console.error("오류: "+e.message);process.exit(1);});
