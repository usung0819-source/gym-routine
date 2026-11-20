/* 운동 그림 (사람 모양 + 기구), 시작↔끝 자세 애니메이션 */
/* 사람 그림 그리기: 관절 각도(화면 기준, 0=오른쪽, 90=아래) → 옷 입은 사람 모양 SVG */
var FIG=(function(){
  var L={torso:38,neck:7,ua:21,fa:19,th:30,sh:28,ft:11};
  function pt(p,a,l){var r=a*Math.PI/180;return [p[0]+Math.cos(r)*l,p[1]+Math.sin(r)*l];}
  function lerp(a,b,t){return a+(b-a)*t;}
  function lerpA(a,b,t){var d=((b-a+540)%360)-180;return a+d*t;}
  function mix(A,B,t){
    var o={},k;for(k in A){var a=A[k],b=B[k]===undefined?a:B[k];
      if(Array.isArray(a))o[k]=[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
      else if(typeof a==="number")o[k]=(k==="x"||k==="y")?lerp(a,b,t):lerpA(a,b,t);else o[k]=a;}
    return o;
  }
  function joints(P){
    var hip=P.hip,neck=pt(hip,P.t,L.torso),head=pt(neck,P.hd===undefined?P.t:P.hd,L.neck+8);
    var sh=pt(hip,P.t,L.torso-4);
    var e1=pt(sh,P.ua,L.ua),h1=pt(e1,P.fa,L.fa),e2=pt(sh,P.ua2===undefined?P.ua:P.ua2,L.ua),h2=pt(e2,P.fa2===undefined?P.fa:P.fa2,L.fa);
    var k1=pt(hip,P.th,L.th),a1=pt(k1,P.sh,L.sh),f1=pt(a1,P.ft===undefined?0:P.ft,L.ft);
    var k2=pt(hip,P.th2===undefined?P.th:P.th2,L.th),a2=pt(k2,P.sh2===undefined?P.sh:P.sh2,L.sh),f2=pt(a2,P.ft2===undefined?(P.ft===undefined?0:P.ft):P.ft2,L.ft);
    return {hip:hip,neck:neck,head:head,sh:sh,e1:e1,h1:h1,e2:e2,h2:h2,k1:k1,a1:a1,f1:f1,k2:k2,a2:a2,f2:f2};
  }
  function ln(a,b,w,c,cls){return '<line x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+b[0].toFixed(1)+'" y2="'+b[1].toFixed(1)+'" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"'+(cls?' class="'+cls+'"':'')+'/>';}
  var C={shirt:"var(--fig-shirt,#2F5BFF)",shirt2:"var(--fig-shirt2,#2448CC)",skin:"#F1C3A0",skin2:"#D9A27E",pants:"#1E2A4A",pants2:"#141C33",shoe:"#33384A",hair:"#2B2321"};
  function person(P){
    var J=joints(P),s="";
    // 먼 쪽 팔다리 (어둡게)
    s+=ln(J.hip,J.k2,13,C.pants2)+ln(J.k2,J.a2,9.5,C.skin2)+ln(J.a2,J.f2,6.5,C.shoe);
    s+=ln(J.sh,J.e2,9,C.shirt2)+ln(J.e2,J.h2,7,C.skin2)+'<circle cx="'+J.h2[0].toFixed(1)+'" cy="'+J.h2[1].toFixed(1)+'" r="4" fill="'+C.skin2+'"/>';
    // 몸통
    s+=ln(J.hip,J.sh,19,C.shirt)+ln(J.hip,pt(J.hip,P.t,6),17,C.pants);
    s+=ln(J.sh,J.neck,6,C.skin);
    // 가까운 쪽 다리
    s+=ln(J.hip,J.k1,13.5,C.pants)+ln(J.k1,J.a1,10,C.skin)+ln(J.a1,J.f1,7,C.shoe);
    // 머리
    var hr=9;s+='<circle cx="'+J.head[0].toFixed(1)+'" cy="'+J.head[1].toFixed(1)+'" r="'+hr+'" fill="'+C.skin+'"/>';
    var f=P.face||1,ang=((P.hd===undefined?P.t:P.hd)+90)*Math.PI/180,vx=-f*3.6,vy=-3.2;
    var back=[J.head[0]+vx*Math.cos(ang)-vy*Math.sin(ang),J.head[1]+vx*Math.sin(ang)+vy*Math.cos(ang)];
    s+='<circle cx="'+back[0].toFixed(1)+'" cy="'+back[1].toFixed(1)+'" r="7.6" fill="'+C.hair+'"/><circle cx="'+(J.head[0]+f*1.2*Math.cos(ang)).toFixed(1)+'" cy="'+(J.head[1]+f*1.2*Math.sin(ang)+1.5).toFixed(1)+'" r="7.4" fill="'+C.skin+'"/>';
    // 가까운 쪽 팔
    s+=ln(J.sh,J.e1,9.5,C.shirt)+ln(J.e1,J.h1,7.5,C.skin)+'<circle cx="'+J.h1[0].toFixed(1)+'" cy="'+J.h1[1].toFixed(1)+'" r="4.3" fill="'+C.skin+'"/>';
    return {svg:s,J:J};
  }
  return {person:person,mix:mix,joints:joints,pt:pt,C:C};
})();
/* 정면 사람 (펙덱·리어델트용) */
FIG.front=function(P){
  var C=FIG.C,pt=FIG.pt,hip=P.hip,s="",x=hip[0],y=hip[1];
  function ln(a,b,w,c){return '<line x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+b[0].toFixed(1)+'" y2="'+b[1].toFixed(1)+'" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"/>';}
  var shY=y-34,shL=[x-13,shY],shR=[x+13,shY],hL=[x-7,y],hR=[x+7,y];
  // 다리 (앉은 자세면 짧게)
  var kL=P.seated?[x-12,y+8]:[x-8,y+30],kR=P.seated?[x+12,y+8]:[x+8,y+30],aL=[kL[0]-1,kL[1]+28],aR=[kR[0]+1,kR[1]+28];
  s+=ln(hL,kL,13,C.pants)+ln(hR,kR,13,C.pants)+ln(kL,aL,9.5,C.skin)+ln(kR,aR,9.5,C.skin)+ln(aL,[aL[0]-5,aL[1]+2],7,C.shoe)+ln(aR,[aR[0]+5,aR[1]+2],7,C.shoe);
  s+='<rect x="'+(x-15)+'" y="'+(y-8)+'" width="30" height="12" rx="5" fill="'+C.pants+'"/>';
  s+='<path d="M'+(x-17)+' '+(shY-3)+' Q'+x+' '+(shY-7)+' '+(x+17)+' '+(shY-3)+' L'+(x+14)+' '+(y-2)+' L'+(x-14)+' '+(y-2)+' Z" fill="'+C.shirt+'"/>';
  var eL=pt(shL,P.uaL,L2.ua),wL=pt(eL,P.faL,L2.fa),eR=pt(shR,P.uaR,L2.ua),wR=pt(eR,P.faR,L2.fa);
  s+=ln(shL,eL,9.5,C.shirt)+ln(eL,wL,7.5,C.skin)+'<circle cx="'+wL[0].toFixed(1)+'" cy="'+wL[1].toFixed(1)+'" r="4.3" fill="'+C.skin+'"/>';
  s+=ln(shR,eR,9.5,C.shirt)+ln(eR,wR,7.5,C.skin)+'<circle cx="'+wR[0].toFixed(1)+'" cy="'+wR[1].toFixed(1)+'" r="4.3" fill="'+C.skin+'"/>';
  s+=ln([x,shY-2],[x,shY-8],7,C.skin);
  if(P.back)s+='<circle cx="'+x+'" cy="'+(shY-17)+'" r="9.5" fill="'+C.hair+'"/>';
  else s+='<circle cx="'+x+'" cy="'+(shY-17)+'" r="9" fill="'+C.skin+'"/><path d="M'+(x-9.3)+' '+(shY-18)+' A9.5 9.5 0 0 1 '+(x+9.3)+' '+(shY-18)+' Q'+x+' '+(shY-24)+' '+(x-9.3)+' '+(shY-18)+'Z" fill="'+C.hair+'"/>';
  return {svg:s,J:{shL:shL,shR:shR,wL:wL,wR:wR,eL:eL,eR:eR,hip:hip}};
};
var L2={ua:21,fa:19};
FIG.mixF=function(A,B,t){var o={},k;for(k in A){var a=A[k],b=B[k];if(Array.isArray(a))o[k]=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];else if(typeof a==="number")o[k]=a+(((b-a+540)%360)-180)*t;else o[k]=a;}return o;};

/* 운동별 자세 2장(시작/끝) + 기구 그림 */
var MC="#AEB6C6",MD="#6B7489",MP="#3A4256";
function R(x,y,w,h,c,rx){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(rx===undefined?2:rx)+'" fill="'+(c||MC)+'"/>';}
function Ln(a,b,w,c){return '<line x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+b[0].toFixed(1)+'" y2="'+b[1].toFixed(1)+'" stroke="'+(c||MD)+'" stroke-width="'+(w||3)+'" stroke-linecap="round"/>';}
function Ci(p,r,c){return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+r+'" fill="'+(c||MD)+'"/>';}
var FLOOR=R(0,128,200,12,"#DCE3F1",0);
var MAT=R(18,126,164,4,"#7FB3A0",2)+FLOOR;
var POSES={
 chairsquat:{inv:1,bg:FLOOR,m:function(){return R(48,94,36,6,MD)+R(50,100,4,28,MP)+R(78,100,4,28,MP)+R(48,52,5,46,MD);},
  f:[{hip:[100,67],t:-90,ua:-5,fa:-5,th:90,sh:90,ft:0,face:1},{hip:[82,93],t:-55,ua:-15,fa:-10,th:8,sh:98,ft:0,face:1}]},
 wallpush:{inv:1,bg:FLOOR,m:function(){return R(168,0,32,128,"#C9D1E0",0)+R(168,0,3,128,MC,0);},
  f:[{hip:[114.8,70.5],t:-70,ua:8,fa:8,th:110,sh:110,ft:0,face:1},{hip:[127,77],t:-56,ua:42,fa:-88,th:118,sh:118,ft:0,face:1}]},
 birddog:{bg:MAT,f:[
  {hip:[70,95],t:-15,ua:90,fa:90,ua2:90,fa2:90,th:90,sh:180,ft:170,th2:90,sh2:180,ft2:170,face:1},
  {hip:[70,95],t:-15,ua:-12,fa:-12,ua2:90,fa2:90,th:90,sh:180,ft:170,th2:178,sh2:178,ft2:178,face:1}]},
 deadbug:{bg:MAT,f:[
  {hip:[78,117],t:0,hd:2,ua:-90,fa:-90,th:-90,sh:180,ft:180,face:1,lie:1},
  {hip:[78,117],t:0,hd:2,ua:-20,fa:-15,ua2:-90,fa2:-90,th:-90,sh:180,ft:180,th2:178,sh2:180,ft2:200,face:1,lie:1}]},
 sideplank:{bg:MAT,f:[
  {hip:[90,119],t:-25,ua:90,fa:0,th:172,sh:205,ft:180,face:1},
  {hip:[88.5,110],t:-18,ua:90,fa:0,th:162,sh:205,ft:180,face:1}]},
 curlup:{bg:MAT,f:[
  {hip:[70,117],t:0,hd:2,ua:170,fa:178,th:-120,sh:100,ft:180,th2:180,sh2:180,ft2:-100,face:1,lie:1},
  {hip:[70,117],t:-10,hd:-14,ua:172,fa:180,th:-120,sh:100,ft:180,th2:180,sh2:180,ft2:-100,face:1,lie:1}]},
 pallof:{bg:FLOOR,m:function(J){return R(22,8,10,120,MD)+R(18,124,18,4,MP)+Ln([32,J.h1[1]],J.h1,1.5,"#333")+R(27,J.h1[1]-3,8,6,MP);},
  fg:function(J){return R(J.h1[0]-2,J.h1[1]-5,5,10,MP);},
  f:[{hip:[110,67],t:-90,ua:75,fa:-115,ua2:75,fa2:-115,th:88,sh:90,th2:93,sh2:90,ft:0,face:1},{hip:[110,67],t:-90,ua:0,fa:0,ua2:0,fa2:0,th:88,sh:90,th2:93,sh2:90,ft:0,face:1}]},
 pulldown:{bg:FLOOR,
  m:function(J){var hx=(J.h1[0]+J.h2[0])/2,hy=J.h1[1];return R(150,4,8,124,MD)+R(80,2,78,6,MD)+Ci([96,8],5,MP)+Ln([96,8],[hx,hy-3],1.5,"#333")+R(72,98,40,6,MD)+R(88,104,6,24,MP)+R(80,124,24,4,MP)+R(108,78,16,7,MP,3)+R(112,85,5,14,MD)+R(140,60,12,50,MC);},
  fg:function(J){return R(J.h1[0]-22,J.h1[1]-3,44,5,MP,2);},
  f:[{hip:[90,93],t:-98,ua:-78,fa:-82,th:0,sh:90,ft:0,face:1},{hip:[90,93],t:-104,ua:102,fa:-58,th:0,sh:90,ft:0,face:1}]},
 row:{bg:FLOOR,
  m:function(J){return R(60,98,40,6,MD)+R(76,104,6,24,MP)+R(66,124,26,4,MP)+R(150,10,8,118,MD)+R(130,124,40,4,MP)+R(118,52,10,36,MP,4)+R(122,86,4,40,MD)+Ln([150,30],[J.h1[0]+4,J.h1[1]],5,MC);},
  fg:function(J){return R(J.h1[0]-2,J.h1[1]-7,6,14,MP,2);},
  f:[{hip:[80,95],t:-78,ua:5,fa:3,th:2,sh:88,ft:0,face:1},{hip:[80,95],t:-80,ua:165,fa:5,th:2,sh:88,ft:0,face:1}]},
 calfraise:{bg:FLOOR,m:function(){return R(150,0,50,128,"#C9D1E0",0);},
  f:[{hip:[110,67],t:-90,ua:-20,fa:-10,ua2:80,fa2:90,th:90,sh:90,ft:0,face:1},{hip:[110,59],t:-90,ua:-8,fa:-3,ua2:80,fa2:90,th:90,sh:90,ft:47,face:1}]},
 march:{bg:FLOOR,f:[
  {hip:[100,67],t:-90,ua:60,fa:-30,ua2:110,fa2:100,th:-5,sh:90,ft:0,th2:92,sh2:90,ft2:0,face:1},
  {hip:[100,67],t:-90,ua:110,fa:100,ua2:60,fa2:-30,th:92,sh:90,ft:0,th2:-5,sh2:90,ft2:0,face:1}]},
 bike:{bg:FLOOR,
  m:function(J){return R(46,96,44,7,MD)+R(36,50,10,52,MD,3)+R(60,103,8,25,MP)+R(40,124,100,4,MP)+R(126,84,10,44,MD)+Ci([131,92],11,MC)+Ci([131,92],4,MP)+Ln([131,92],J.a1,3,MP)+Ln([131,92],J.a2,3,MP);},
  f:[{hip:[66,92],t:-118,ua:30,fa:20,th:-8,sh:30,ft:-60,th2:5,sh2:75,ft2:-30,face:1},{hip:[66,92],t:-118,ua:30,fa:20,th:5,sh:75,ft:-30,th2:-8,sh2:30,ft2:-60,face:1}]},
 treadmill:{bg:FLOOR,
  m:function(){return R(30,118,140,8,MD,3)+R(150,40,6,82,MP)+R(140,38,24,8,MD,3)+R(120,62,40,4,MC);},
  f:[{hip:[96,58],t:-88,ua:115,fa:70,ua2:65,fa2:-20,th:70,sh:110,ft:0,th2:110,sh2:95,ft2:0,face:1},{hip:[96,58],t:-88,ua:65,fa:-20,ua2:115,fa2:70,th:110,sh:95,ft:0,th2:70,sh2:110,ft2:0,face:1}]},
 run:{bg:FLOOR,
  m:function(){return R(30,118,140,8,MD,3)+R(150,40,6,82,MP)+R(140,38,24,8,MD,3);},
  f:[{hip:[96,60],t:-80,ua:120,fa:40,ua2:60,fa2:-60,th:55,sh:120,ft:10,th2:115,sh2:150,ft2:-10,face:1},{hip:[96,62],t:-80,ua:60,fa:-60,ua2:120,fa2:40,th:115,sh:150,ft:-10,th2:55,sh2:120,ft2:10,face:1}]},
 elliptical:{bg:FLOOR,
  m:function(J){return R(30,120,140,6,MD,3)+R(150,30,8,94,MP)+Ln([150,40],J.h1,4,MC)+Ln([150,40],J.h2,4,MC)+R(J.a1[0]-8,J.a1[1]+3,22,4,MP)+R(J.a2[0]-8,J.a2[1]+3,22,4,MD)+Ci([150,110],12,MC);},
  f:[{hip:[96,56],t:-88,ua:40,fa:-10,ua2:20,fa2:-40,th:75,sh:100,ft:0,th2:105,sh2:85,ft2:0,face:1},{hip:[96,56],t:-88,ua:20,fa:-40,ua2:40,fa2:-10,th:105,sh:85,ft:0,th2:75,sh2:100,ft2:0,face:1}]}
};
POSES.outwalk={bg:R(0,128,200,12,"#C8D7B4",0)+R(0,128,200,3,"#9DB07F",0),f:[
  {hip:[100,66],t:-88,ua:115,fa:70,ua2:65,fa2:-20,th:70,sh:110,ft:0,th2:110,sh2:95,ft2:0,face:1},{hip:[100,66],t:-88,ua:65,fa:-20,ua2:115,fa2:70,th:110,sh:95,ft:0,th2:70,sh2:110,ft2:0,face:1}]};
POSES.outrun={bg:POSES.outwalk.bg,f:POSES.run.f.map(function(p){var q={};for(var k in p)q[k]=p[k];q.hip=[p.hip[0],p.hip[1]+5];return q;})};
POSES.inclinepress={bg:FLOOR,
  m:function(J){return R(44,40,10,62,MD,4)+R(50,98,40,7,MD)+R(64,105,7,23,MP)+R(46,124,40,4,MP)+R(140,20,8,108,MD)+R(124,124,36,4,MP)+Ln([144,30],J.h1,5,MC);},
  fg:function(J){return R(J.h1[0]-3,J.h1[1]-7,6,14,MP,2);},
  f:[{hip:[68,96],t:-112,ua:105,fa:-30,th:0,sh:88,ft:0,face:1},{hip:[68,96],t:-112,ua:-38,fa:-38,th:0,sh:88,ft:0,face:1}]};
POSES.shoulderpress={bg:FLOOR,
  m:function(J){return R(62,38,10,64,MD,4)+R(62,98,40,7,MD)+R(80,105,7,23,MP)+R(62,124,40,4,MP)+R(46,4,8,124,MD)+Ln([50,10],J.h1,5,MC);},
  fg:function(J){return R(J.h1[0]-3,J.h1[1]-7,6,14,MP,2);},
  f:[{hip:[82,96],t:-90,ua:95,fa:-95,th:0,sh:88,ft:0,face:1},{hip:[82,96],t:-90,ua:-86,fa:-88,th:0,sh:88,ft:0,face:1}]};
POSES.pecdeck={front:1,bg:FLOOR,
  m:function(J){return R(84,22,32,72,MD,5)+R(78,96,44,7,MP)+R(97,103,6,25,MP)+R(80,124,40,4,MP)+R(30,4,140,6,MD)+R(30,4,6,124,MD)+R(164,4,6,124,MD);},
  fg:function(J){return R(J.eL[0]-4,J.wL[1]-2,8,J.eL[1]-J.wL[1]+6,MP,3)+R(J.eR[0]-4,J.wR[1]-2,8,J.eR[1]-J.wR[1]+6,MP,3);},
  f:[{hip:[100,94],seated:1,uaL:180,faL:-90,uaR:0,faR:-90},{hip:[100,94],seated:1,uaL:-25,faL:-90,uaR:205,faR:-90}]};
POSES.reardelt={front:1,bg:FLOOR,
  m:function(J){return R(78,96,44,7,MP)+R(97,103,6,25,MP)+R(80,124,40,4,MP)+R(30,4,140,6,MD)+R(30,4,6,124,MD)+R(164,4,6,124,MD);},
  fg:function(J){return R(J.wL[0]-3,J.wL[1]-8,6,16,MP,2)+R(J.wR[0]-3,J.wR[1]-8,6,16,MP,2);},
  f:[{hip:[100,94],seated:1,back:1,uaL:15,faL:0,uaR:165,faR:180},{hip:[100,94],seated:1,back:1,uaL:182,faL:180,uaR:-2,faR:0}]};

var FIG_CYC={march:1100,bike:1100,treadmill:1100,outwalk:1100,elliptical:1300,run:700,outrun:700};
function figT(id,ms){
  if(FIG_CYC[id])return 0.5-0.5*Math.cos(2*Math.PI*ms/FIG_CYC[id]);
  var x=ms%3800,e=function(u){return u*u*(3-2*u);};
  if(x<800)return 0;if(x<1800)return e((x-800)/1000);if(x<2400)return 1;if(x<3600)return 1-e((x-2400)/1200);return 0;
}
function figBody(id,t){
  var X=POSES[id];if(!X)return "";
  var P=X.front?FIG.mixF(X.f[0],X.f[1],t):FIG.mix(X.f[0],X.f[1],t),p=X.front?FIG.front(P):FIG.person(P);
  return '<rect width="200" height="140" fill="#F4F7FF"/>'+(X.bg||"")+(X.m?X.m(p.J):"")+p.svg+(X.fg?X.fg(p.J):"");
}
function figSvg(id,t,cls){return '<svg viewBox="0 0 200 140" class="'+(cls||"")+'" data-fig="'+id+'" preserveAspectRatio="xMidYMid meet">'+figBody(id,t||0)+'</svg>';}
(function(){
  var still=false;try{still=window.matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){}
  var last=0;
  function loop(now){
    requestAnimationFrame(loop);
    if(still||now-last<40||document.hidden)return;last=now;
    var H=window.innerHeight;
    document.querySelectorAll("svg[data-fig]:not(.still)").forEach(function(s){
      var r=s.getBoundingClientRect();if(r.bottom<0||r.top>H||!r.width)return;
      s.innerHTML=figBody(s.getAttribute("data-fig"),figT(s.getAttribute("data-fig"),now));
    });
  }
  requestAnimationFrame(loop);
})();
