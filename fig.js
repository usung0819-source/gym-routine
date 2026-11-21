/* 운동 그림 (사람 모양 + 기구), 시작↔끝 자세 애니메이션 */
/* 사람 그림 그리기: 관절 각도(화면 기준, 0=오른쪽, 90=아래) → 옷 입은 사람 모양 SVG */
var FIG=(function(){
  var L={torso:38,neck:7,ua:21,fa:19,th:30,sh:28,ft:11};
  function pt(p,a,l){var r=a*Math.PI/180;return [p[0]+Math.cos(r)*l,p[1]+Math.sin(r)*l];}
  function lerp(a,b,t){return a+(b-a)*t;}
  function lerpA(a,b,t){var d=((b-a+540)%360)-180;return a+d*t;}
  function mix(A,B,t){
    var o={},k,K={};for(k in A)K[k]=1;for(k in B)K[k]=1;
    function fb(X,k){if(X[k]!==undefined)return X[k];var b=k.replace(/2$/,"");if(X[b]!==undefined)return X[b];return (b==="ft")?0:undefined;}
    for(k in K){if((A.ank&&(k==="th"||k==="sh"||k==="th2"||k==="sh2"))||(A.hand&&(k==="ua"||k==="fa")))continue;var a=fb(A,k),b=fb(B,k);if(a===undefined)a=b;if(b===undefined)b=a;
      if(Array.isArray(a))o[k]=[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
      else if(typeof a==="number")o[k]=(k==="x"||k==="y")?lerp(a,b,t):lerpA(a,b,t);else o[k]=a;}
    return o;
  }
  function ik2(S,T,l1,l2,sg){
    var dx=T[0]-S[0],dy=T[1]-S[1],D=Math.sqrt(dx*dx+dy*dy),ux=dx/D,uy=dy/D;D=Math.min(D,l1+l2-0.01);
    var a=(l1*l1-l2*l2+D*D)/(2*D),h=Math.sqrt(Math.max(0,l1*l1-a*a)),K=[S[0]+ux*a+uy*h*sg,S[1]+uy*a-ux*h*sg];
    return [Math.atan2(K[1]-S[1],K[0]-S[0])*180/Math.PI,Math.atan2(T[1]-K[1],T[0]-K[0])*180/Math.PI];
  }
  function joints(P){
    if(P.ank){var q=ik2(P.hip,P.ank,L.th,L.sh,P.kd||1);P.th=q[0];P.sh=q[1];if(P.ank2===undefined){P.th2=P.th2===undefined?q[0]:P.th2;P.sh2=P.sh2===undefined?q[1]:P.sh2;}}
    if(P.hand){var sh0=pt(P.hip,P.t,L.torso-4),q2=ik2(sh0,P.hand,L.ua,L.fa,P.ed||-1);P.ua=q2[0];P.fa=q2[1];}
    var hip=P.hip,neck=pt(hip,P.t,L.torso),head=pt(neck,P.hd===undefined?P.t:P.hd,L.neck+8);
    var sh=pt(hip,P.t,L.torso-4);
    var e1=pt(sh,P.ua,L.ua),h1=pt(e1,P.fa,L.fa),e2=pt(sh,P.ua2===undefined?P.ua:P.ua2,L.ua),h2=pt(e2,P.fa2===undefined?P.fa:P.fa2,L.fa);
    var k1=pt(hip,P.th,L.th),a1=pt(k1,P.sh,L.sh),f1=pt(a1,P.ft===undefined?0:P.ft,L.ft);
    var k2=pt(hip,P.th2===undefined?P.th:P.th2,L.th),a2=pt(k2,P.sh2===undefined?P.sh:P.sh2,L.sh),f2=pt(a2,P.ft2===undefined?(P.ft===undefined?0:P.ft):P.ft2,L.ft);
    return {hip:hip,neck:neck,head:head,sh:sh,e1:e1,h1:h1,e2:e2,h2:h2,k1:k1,a1:a1,f1:f1,k2:k2,a2:a2,f2:f2};
  }
  function ln(a,b,w,c,cls){return '<line x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+b[0].toFixed(1)+'" y2="'+b[1].toFixed(1)+'" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"'+(cls?' class="'+cls+'"':'')+'/>';}
  var C={shirt:"var(--fig-shirt,#2F5BFF)",shirt2:"var(--fig-shirt2,#2448CC)",skin:"#F1C3A0",skin2:"#D9A27E",pants:"#1E2A4A",pants2:"#141C33",shoe:"#33384A",hair:"#2B2321"};
  function tp(a,b,r1,r2,c){
    var dx=b[0]-a[0],dy=b[1]-a[1],d=Math.sqrt(dx*dx+dy*dy)||1,nx=-dy/d,ny=dx/d,F=function(v){return v.toFixed(1);};
    function circ(p,r){return 'M'+F(p[0]-r)+' '+F(p[1])+'a'+r+' '+r+' 0 1 0 '+(2*r)+' 0a'+r+' '+r+' 0 1 0 '+(-2*r)+' 0Z';}
    return '<path fill="'+c+'" d="M'+F(a[0]+nx*r1)+' '+F(a[1]+ny*r1)+'L'+F(b[0]+nx*r2)+' '+F(b[1]+ny*r2)+'L'+F(b[0]-nx*r2)+' '+F(b[1]-ny*r2)+'L'+F(a[0]-nx*r1)+' '+F(a[1]-ny*r1)+'Z'+circ(a,r1)+circ(b,r2)+'"/>';
  }
  function at(a,b,k){return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];}
  function leg(h,k,a,f,far){
    var sk=far?C.skin2:C.skin,pn=far?C.pants2:C.pants;
    return tp(k,a,5.3,3.7,sk)+tp(h,k,7.2,5.5,sk)+tp(h,at(h,k,0.62),7.6,6.7,pn)+tp(a,f,4.3,3.3,far?"#24283A":C.shoe);
  }
  function arm(s,e,h,far){
    var sk=far?C.skin2:C.skin,st=far?C.shirt2:C.shirt;
    return tp(s,e,4.9,4.1,sk)+tp(s,at(s,e,0.55),5.5,5,st)+tp(e,h,4,3.1,sk)+'<circle cx="'+h[0].toFixed(1)+'" cy="'+h[1].toFixed(1)+'" r="3.7" fill="'+sk+'"/>';
  }
  function person(P){
    var J=joints(P),s="";
    s+=leg(J.hip,J.k2,J.a2,J.f2,1)+arm(J.sh,J.e2,J.h2,1);
    s+=tp(J.sh,J.neck,3.4,3.2,C.skin);
    s+=tp(J.hip,J.sh,8.8,10,C.shirt)+tp(J.hip,pt(J.hip,P.t,7),9,8.9,C.pants);
    s+=leg(J.hip,J.k1,J.a1,J.f1,0);
    var f=P.face||1,ang=((P.hd===undefined?P.t:P.hd)+90)*Math.PI/180,ca=Math.cos(ang),sa=Math.sin(ang);
    function rel(x,y){return [J.head[0]+x*ca-y*sa,J.head[1]+x*sa+y*ca];}
    var hb=rel(-f*3.4,-3.4),fc=rel(f*1.3,1.4),ey=rel(f*5.2,-0.6),er=rel(-f*1.2,1.2);
    s+='<circle cx="'+J.head[0].toFixed(1)+'" cy="'+J.head[1].toFixed(1)+'" r="8.8" fill="'+C.skin+'"/>';
    s+='<circle cx="'+hb[0].toFixed(1)+'" cy="'+hb[1].toFixed(1)+'" r="7.7" fill="'+C.hair+'"/><circle cx="'+fc[0].toFixed(1)+'" cy="'+fc[1].toFixed(1)+'" r="7.3" fill="'+C.skin+'"/>';
    s+='<circle cx="'+ey[0].toFixed(1)+'" cy="'+ey[1].toFixed(1)+'" r="1" fill="#2B2321"/>';
    s+=arm(J.sh,J.e1,J.h1,0);
    return {svg:s,J:J};
  }
  return {person:person,mix:mix,joints:joints,pt:pt,C:C,tp:tp,leg:leg,arm:arm};
})();
/* 정면 사람 (펙덱·리어델트용) */
FIG.front=function(P){
  var C=FIG.C,pt=FIG.pt,hip=P.hip,s="",x=hip[0],y=hip[1];
  function ln(a,b,w,c){return '<line x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+b[0].toFixed(1)+'" y2="'+b[1].toFixed(1)+'" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"/>';}
  var shY=y-34,shL=[x-13,shY],shR=[x+13,shY],hL=[x-7,y],hR=[x+7,y];
  // 다리 (앉은 자세면 짧게)
  var sp=P.spread||0,kL=P.seated?[x-12-sp,y+8]:[x-8,y+30],kR=P.seated?[x+12+sp,y+8]:[x+8,y+30],aL=[kL[0]-1+sp*0.4,kL[1]+28],aR=[kR[0]+1-sp*0.4,kR[1]+28];
  s+=FIG.leg(hL,kL,aL,[aL[0]-5,aL[1]+2],0)+FIG.leg(hR,kR,aR,[aR[0]+5,aR[1]+2],0);
  s+='<rect x="'+(x-15)+'" y="'+(y-8)+'" width="30" height="12" rx="5" fill="'+C.pants+'"/>';
  s+='<path d="M'+(x-17)+' '+(shY-3)+' Q'+x+' '+(shY-7)+' '+(x+17)+' '+(shY-3)+' L'+(x+14)+' '+(y-2)+' L'+(x-14)+' '+(y-2)+' Z" fill="'+C.shirt+'"/>';
  var eL=pt(shL,P.uaL,L2.ua),wL=pt(eL,P.faL,L2.fa),eR=pt(shR,P.uaR,L2.ua),wR=pt(eR,P.faR,L2.fa);
  s+=FIG.arm(shL,eL,wL,0)+FIG.arm(shR,eR,wR,0);
  s+=ln([x,shY-2],[x,shY-8],7,C.skin);
  if(P.back)s+='<circle cx="'+x+'" cy="'+(shY-17)+'" r="9.5" fill="'+C.hair+'"/>';
  else s+='<circle cx="'+x+'" cy="'+(shY-17)+'" r="9" fill="'+C.skin+'"/><circle cx="'+(x-3.2)+'" cy="'+(shY-15.5)+'" r="1" fill="#2B2321"/><circle cx="'+(x+3.2)+'" cy="'+(shY-15.5)+'" r="1" fill="#2B2321"/><path d="M'+(x-9.3)+' '+(shY-18)+' A9.5 9.5 0 0 1 '+(x+9.3)+' '+(shY-18)+' Q'+x+' '+(shY-24)+' '+(x-9.3)+' '+(shY-18)+'Z" fill="'+C.hair+'"/>';
  return {svg:s,J:{shL:shL,shR:shR,wL:wL,wR:wR,eL:eL,eR:eR,hip:hip,kL:kL,kR:kR,aL:aL,aR:aR}};
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
  {hip:[70,95],t:-15,ua:-12,fa:-12,ua2:90,fa2:90,th:90,sh:180,ft:170,th2:178,sh2:178,ft2:178,face:1}],
  f2:[{hip:[70,95],t:-15,ua:90,fa:90,ua2:90,fa2:90,th:90,sh:180,ft:170,th2:90,sh2:180,ft2:170,face:1},
  {hip:[70,95],t:-15,ua:90,fa:90,ua2:-12,fa2:-12,th:178,sh:178,ft:178,th2:90,sh2:180,ft2:170,face:1}]},
 deadbug:{bg:MAT,f:[
  {hip:[78,117],t:0,hd:2,ua:-90,fa:-90,th:-90,sh:180,ft:180,face:1,lie:1},
  {hip:[78,117],t:0,hd:2,ua:-8,fa:-6,ua2:-90,fa2:-90,th:-90,sh:180,ft:180,th2:177,sh2:178,ft2:200,face:1,lie:1}],
  f2:[{hip:[78,117],t:0,hd:2,ua:-90,fa:-90,th:-90,sh:180,ft:180,face:1,lie:1},
  {hip:[78,117],t:0,hd:2,ua:-90,fa:-90,ua2:-8,fa2:-6,th:177,sh:178,ft:200,th2:-90,sh2:180,ft2:180,face:1,lie:1}]},
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
  fg:function(J){return R(J.wL[0]-3,J.wL[1]-9,6,18,MP,2)+R(J.wR[0]-3,J.wR[1]-9,6,18,MP,2);},
  f:[{hip:[100,94],seated:1,uaL:178,faL:184,uaR:2,faR:-4},{hip:[100,94],seated:1,uaL:12,faL:-4,uaR:168,faR:184}]};
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
function figBody(id,t,alt){
  var X=POSES[id];if(!X)return "";
  var F=(alt&&X.f2)?X.f2:X.f;
  var P=X.front?FIG.mixF(F[0],F[1],t):FIG.mix(F[0],F[1],t),p=X.front?FIG.front(P):FIG.person(P);
  var body=(X.m?X.m(p.J):"")+p.svg+(X.fg?X.fg(p.J):"");
  if(X.sc)body='<g transform="translate(100 128) scale('+X.sc+') translate(-100 -128)">'+body+'</g>';
  return '<rect width="200" height="140" fill="#F4F7FF"/>'+(X.bg||"")+body;
}
function figSvg(id,t,cls,alt){return '<svg viewBox="0 0 200 140" class="'+(cls||"")+'" data-fig="'+id+'" preserveAspectRatio="xMidYMid meet">'+figBody(id,t||0,alt)+'</svg>';}
(function(){
  var still=false;try{still=window.matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){}
  var last=0;
  function loop(now){
    requestAnimationFrame(loop);
    if(still||now-last<40||document.hidden)return;last=now;
    var H=window.innerHeight;
    document.querySelectorAll("svg[data-fig]:not(.still)").forEach(function(s){
      var r=s.getBoundingClientRect();if(r.bottom<0||r.top>H||!r.width)return;
      var id=s.getAttribute("data-fig"),vw=s.getAttribute("data-view"),al=Math.floor(now/3800)%2===1;
      s.innerHTML=(vw&&vw!=="side"&&window.POSE3&&POSE3[id])?fig3Body(id,vw,figT(id,now),al):figBody(id,figT(id,now),al);
    });
  }
  requestAnimationFrame(loop);
})();

/* ---------- 3D 사람 (여러 각도) ----------
   좌표: x=앞(머리 방향), y=위, z=옆. 각 자세는 관절 방향/목표점으로 정의하고, 보는 방향(옆/위/앞)으로 투영 */
var F3=(function(){
  var L={sh:34,neck:4,hd:15,shw:9,hpw:6,ua:21,fa:19,th:30,sn:28,ft:11};
  function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
  function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
  function mul(a,k){return [a[0]*k,a[1]*k,a[2]*k];}
  function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
  function len(a){return Math.sqrt(dot(a,a));}
  function nrm(a){var l=len(a)||1;return mul(a,1/l);}
  function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function ik(S,T,l1,l2,hint){
    var d=sub(T,S),D=Math.min(len(d),l1+l2-0.01),u=nrm(d);
    var a=(l1*l1-l2*l2+D*D)/(2*D),h=Math.sqrt(Math.max(0,l1*l1-a*a));
    var hp=nrm(sub(hint,mul(u,dot(hint,u))));
    var E=add(add(S,mul(u,a)),mul(hp,h));return [E,add(S,mul(u,D))];
  }
  function limb(S,o,k1,k2,l1,l2,tg,hn){
    if(o[tg])return ik(S,o[tg],l1,l2,o[hn]||[0,-1,0]);
    var E=add(S,mul(nrm(o[k1]),l1));return [E,add(E,mul(nrm(o[k2]||o[k1]),l2))];
  }
  function joints(o){
    var T=nrm(o.T),F=nrm(o.F),R=nrm(cross(F,T)),H=o.H;
    var SC=add(H,mul(T,L.sh)),N=add(H,mul(T,L.sh+L.neck)),HD=add(N,mul(T,L.hd-6));
    var sR=add(SC,mul(R,L.shw)),sL=add(SC,mul(R,-L.shw)),hR=add(H,mul(R,L.hpw)),hL=add(H,mul(R,-L.hpw));
    var aR=limb(sR,o,"uaR","faR",L.ua,L.fa,"handR","elR"),aL=limb(sL,o,"uaL","faL",L.ua,L.fa,"handL","elL");
    var lR=limb(hR,o,"thR","snR",L.th,L.sn,"ankR","knR"),lL=limb(hL,o,"thL","snL",L.th,L.sn,"ankL","knL");
    var tR=add(lR[1],mul(nrm(o.ftR||F),L.ft)),tL=add(lL[1],mul(nrm(o.ftL||F),L.ft));
    return {T:T,F:F,R:R,H:H,SC:SC,N:N,HD:HD,sR:sR,sL:sL,hR:hR,hL:hL,eR:aR[0],wR:aR[1],eL:aL[0],wL:aL[1],kR:lR[0],aR:lR[1],kL:lL[0],aL:lL[1],tR:tR,tL:tL};
  }
  function mix(A,B,t){var o={},k,K={};for(k in A)K[k]=1;for(k in B)K[k]=1;
    for(k in K){var a=A[k]||B[k],b=B[k]||A[k];if(Array.isArray(a))o[k]=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];else o[k]=a;}return o;}
  var VIEW={
    side:function(p){return [100+p[0],128-p[1],p[2]];},
    top:function(p){return [100+p[0],70+p[2],p[1]];},
    front:function(p){return [100-p[2],128-p[1],p[0]];}
  };
  function seg(a,b,w,c,c2,mid){return {a:a,b:b,w:w,c:c,c2:c2,d:(a[2]+b[2])/2};}
  function draw(o,view,ox){
    var J=joints(o),V=VIEW[view],P=function(p){var q=V(p);return [q[0]+(ox||0),q[1],q[2]];},C=FIG.C,list=[];
    var cen=P(J.SC)[2]*0.5+P(J.H)[2]*0.5;
    function L2(a,b,w,c,c2,bias,hand){var g=seg(P(a),P(b),w,c,c2);g.d+=(bias||0);g.hand=hand;list.push(g);}
    function md(a,b,k){return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];}
    [["hR","kR","aR","tR","sR","eR","wR"],["hL","kL","aL","tL","sL","eL","wL"]].forEach(function(n){
      L2(J[n[0]],J[n[1]],[7.2,5.5],C.skin,C.skin2);L2(J[n[0]],md(J[n[0]],J[n[1]],0.62),[7.6,6.7],C.pants,C.pants2,0.02);
      L2(J[n[1]],J[n[2]],[5.3,3.7],C.skin,C.skin2);L2(J[n[2]],J[n[3]],[4.3,3.3],C.shoe,"#24283A");
      L2(J[n[4]],J[n[5]],[4.9,4.1],C.skin,C.skin2);L2(J[n[4]],md(J[n[4]],J[n[5]],0.55),[5.5,5],C.shirt,C.shirt2,0.02);
      L2(J[n[5]],J[n[6]],[4,3.1],C.skin,C.skin2,0,1);
    });
    var tq=[P(J.sR),P(J.sL),P(J.hL),P(J.hR)],td=(tq[0][2]+tq[1][2]+tq[2][2]+tq[3][2])/4;
    list.push({torso:tq,d:td});
    var hd=P(J.HD);list.push({head:hd,d:hd[2]+0.01});
    list.sort(function(a,b){return a.d-b.d;});
    var s="";
    list.forEach(function(g){
      if(g.torso){var q=g.torso,pts=q.map(function(p){return p[0].toFixed(1)+","+p[1].toFixed(1);}).join(" ");
        s+='<polygon points="'+pts+'" fill="'+C.shirt+'" stroke="'+C.shirt+'" stroke-width="14" stroke-linejoin="round"/>';
        var hp=[P(J.hL),P(J.hR)];s+='<line x1="'+hp[0][0].toFixed(1)+'" y1="'+hp[0][1].toFixed(1)+'" x2="'+hp[1][0].toFixed(1)+'" y2="'+hp[1][1].toFixed(1)+'" stroke="'+C.pants+'" stroke-width="15" stroke-linecap="round"/>';return;}
      if(g.head){var f=P(add(J.HD,mul(J.F,4))),b=P(add(add(J.HD,mul(J.F,-3.5)),mul(J.T,1.5)));
        var faceNear=f[2]>=b[2];
        var hair='<circle cx="'+b[0].toFixed(1)+'" cy="'+b[1].toFixed(1)+'" r="8" fill="'+C.hair+'"/>',face='<circle cx="'+((g.head[0]*2+f[0])/3).toFixed(1)+'" cy="'+((g.head[1]*2+f[1])/3).toFixed(1)+'" r="8.2" fill="'+C.skin+'"/>';
        s+=faceNear?hair+face:face+hair;return;}
      var far=g.d<cen-3,c=far?g.c2:g.c;
      s+=FIG.tp(g.a,g.b,g.w[0],g.w[1],c);
      if(g.hand)s+='<circle cx="'+g.b[0].toFixed(1)+'" cy="'+g.b[1].toFixed(1)+'" r="3.7" fill="'+c+'"/>';
    });
    return {svg:s,J:J,P:P};
  }
  return {draw:draw,mix:mix,add:add,mul:mul,VIEW:VIEW};
})();

/* 여러 각도가 필요한 운동: 3D 자세 (시작, 끝, 끝-반대쪽) */
var UP=[0,1,0],DN=[0,-1,0],FW=[1,0,0],BK=[-1,0,0];
var POSE3={
 deadbug:{views:["top"],note:{top:"위에서 본 모습: 오른팔과 왼다리처럼 대각선으로 함께 내립니다"},
  s:{H:[-12,9,0],T:FW,F:UP,uaR:UP,uaL:UP,thR:UP,thL:UP,snR:BK,snL:BK,ftR:[-1,0.4,0],ftL:[-1,0.4,0]},
  e:{uaL:[1,0.12,0],thR:[-1,0.1,0],snR:[-1,0.06,0],ftR:[-0.3,1,0]},
  e2:{uaR:[1,0.12,0],thL:[-1,0.1,0],snL:[-1,0.06,0],ftL:[-0.3,1,0]}},
 birddog:{views:["top"],note:{top:"위에서 본 모습: 팔과 반대쪽 다리를 몸통과 일직선으로 뻗습니다. 옆으로 벌어지지 않게"},
  s:{H:[-17,35,0],T:[0.98,0.2,0],F:[0.25,-1,0],uaR:DN,uaL:DN,thR:DN,thL:DN,snR:BK,snL:BK,ftR:[-1,0.1,0],ftL:[-1,0.1,0]},
  e:{uaR:[1,0.08,0],faR:[1,0.08,0],thL:[-1,0.12,0],snL:[-1,0.12,0],ftL:[0,-1,0]},
  e2:{uaL:[1,0.08,0],faL:[1,0.08,0],thR:[-1,0.12,0],snR:[-1,0.12,0],ftR:[0,-1,0]}},
 chairsquat:{views:["front"],inv:1,note:{front:"앞에서 본 모습: 무릎이 발끝 방향을 따라가게, 안쪽으로 모이지 않게"},
  prop:{front:function(P){var a=P([-36,34,-16]),b=P([-36,34,16]);return R(a[0],a[1]-2,b[0]-a[0],6,MD)+R(a[0]+2,a[1]+4,4,a[1]>0?128-a[1]-4:0,MP)+R(b[0]-6,b[1]+4,4,128-b[1]-4,MP)+R(a[0],a[1]-44,b[0]-a[0],5,MC);},
        side:function(P){var a=P([-50,34,0]),b=P([-20,34,0]);return R(a[0],a[1]-2,b[0]-a[0],6,MD)+R(a[0]+2,a[1]+4,4,128-a[1]-4,MP)+R(b[0]-6,b[1]+4,4,128-b[1]-4,MP)+R(a[0],a[1]-42,5,42,MD);}},
  s:{H:[0,61,0],T:UP,F:FW,thR:[0,-1,0.08],thL:[0,-1,-0.08],snR:[0,-1,0.04],snL:[0,-1,-0.04],ftR:[1,0,0.25],ftL:[1,0,-0.25],uaR:FW,uaL:FW},
  e:{H:[-25,37,0],T:[0.6,0.8,0],ankR:[1,3,11],ankL:[1,3,-11],knR:[1,0.3,0.45],knL:[1,0.3,-0.45],uaR:[1,0.15,0],uaL:[1,0.15,0]}},
 wallpush:{views:["top"],inv:1,note:{top:"위에서 본 모습: 팔꿈치는 몸통에서 45도 정도. 옆으로 활짝 벌리지 않습니다"},
  prop:{top:function(P){var a=P([69,0,-60]);return R(a[0],8,30,124,"#C9D1E0",0)+R(a[0],8,3,124,MC,0);},side:function(P){var a=P([69,0,0]);return R(a[0],0,32,128,"#C9D1E0",0);}},
  s:{H:[14.8,57.5,0],T:[0.342,0.94,0],F:[0.94,-0.342,0],ankR:[-5,3,9],ankL:[-5,3,-9],knR:[0,0,1],knL:[0,0,-1],ftR:FW,ftL:FW,handR:[66,84,14],handL:[66,84,-14],elR:[0,-0.5,1],elL:[0,-0.5,-1]},
  e:{H:[27.4,51.1,0],T:[0.559,0.829,0],F:[0.829,-0.559,0],handR:[66,84,14],handL:[66,84,-14],elR:[-0.55,-0.8,0.32],elL:[-0.55,-0.8,-0.32]}},
 pallof:{views:["top"],note:{top:"위에서 본 모습: 케이블이 옆에서 당겨도 몸통이 돌아가지 않게 버티며 앞으로 밉니다"},
  prop:{top:function(P,J){var c=P([0,60,-58]),h=P(J.wR);return R(c[0]-6,c[1]-6,12,12,MD,3)+'<line x1="'+c[0]+'" y1="'+c[1]+'" x2="'+h[0].toFixed(1)+'" y2="'+h[1].toFixed(1)+'" stroke="#333" stroke-width="1.5"/>';}},
  s:{H:[0,61,0],T:UP,F:FW,thR:[0,-1,0.12],thL:[0,-1,-0.12],snR:DN,snL:DN,ftR:FW,ftL:FW,handR:[12,90,1],handL:[12,90,-1],elR:[-0.3,-1,0.3],elL:[-0.3,-1,-0.3]},
  e:{handR:[42,92,1],handL:[42,92,-1],elR:[0,-1,0.2],elL:[0,-1,-0.2]}},
 pulldown:{views:["front"],note:{front:"앞에서 본 모습: 어깨너비보다 조금 넓게 잡고, 바를 머리 앞쪽으로 쇄골까지 당깁니다"},
  prop:{front:function(P,J){var a=P(J.wR),b=P(J.wL),s1=P([-5,30,-20]),s2=P([-5,30,20]);return R(s1[0],s1[1],s2[0]-s1[0],6,MD)+R(96,s1[1]+6,8,128-s1[1]-6,MP)+R(60,4,80,6,MD)+'<line x1="100" y1="10" x2="100" y2="'+a[1].toFixed(1)+'" stroke="#333" stroke-width="1.5"/>'+R(Math.min(a[0],b[0])-8,a[1]-2,Math.abs(b[0]-a[0])+16,5,MP,2);}},
  s:{H:[0,35,0],T:[-0.15,1,0],F:FW,thR:[1,0,0.12],thL:[1,0,-0.12],snR:DN,snL:DN,ftR:FW,ftL:FW,handR:[3,108,24],handL:[3,108,-24],elR:[0,0,1],elL:[0,0,-1]},
  e:{handR:[8,70,22],handL:[8,70,-22],elR:[-0.2,-1,0.6],elL:[-0.2,-1,-0.6]}}
};
var MAT3={top:R(20,40,160,60,"#CFE3DA",8),side:MAT,front:FLOOR};
function fig3Body(id,view,t,alt){
  var X=POSE3[id];if(!X)return "";
  var A=X.s,B=F3.mix(X.s,(alt&&X.e2)?X.e2:X.e,1),P=F3.mix(A,B,t);
  var bg=(id==="deadbug"||id==="birddog")?MAT3[view]:(view==="top"?R(0,0,200,140,"#E8EDF7",0):FLOOR);
  var d=F3.draw(P,view),pr=X.prop&&X.prop[view]?X.prop[view](d.P,d.J):"";
  return '<rect width="200" height="140" fill="#F4F7FF"/>'+bg+(view==="top"?"":pr)+(view==="top"?pr:"")+d.svg+'<text x="6" y="14" font-size="10" font-weight="700" fill="#5B6478">'+({top:"위에서",front:"앞에서",side:"옆에서"}[view])+'</text>';
}

/* ---------- 머신 13종목 (같은 그림체로 통일) ---------- */
function seat(x,y,w,back){return R(x,y,w,6,MD)+R(x+w/2-3,y+6,6,128-y-6,MP)+R(x+w/2-14,124,28,4,MP)+(back?back:"");}
function pad(p,w,h,c){return R(p[0]-w/2,p[1]-h/2,w,h,c||MP,Math.min(w,h)/2);}
function DB(p){return R(p[0]-6,p[1]-2.5,12,5,"#3A4256",2)+R(p[0]-8,p[1]-4.5,3,9,"#3A4256",1)+R(p[0]+5,p[1]-4.5,3,9,"#3A4256",1);}
POSES.legpress={bg:FLOOR,
  m:function(J){var d=Math.atan2(J.a1[1]-J.hip[1],J.a1[0]-J.hip[0]),px=Math.cos(d),py=Math.sin(d),c=[J.a1[0]+px*7,J.a1[1]+py*7];
    return R(20,118,150,6,MD,3)+'<line x1="40" y1="112" x2="'+(J.sh[0]-6).toFixed(1)+'" y2="'+(J.sh[1]-10).toFixed(1)+'" stroke="'+MD+'" stroke-width="9" stroke-linecap="round"/>'+R(48,100,40,7,MD)+R(60,107,6,12,MP)+Ln([150,118],[150,60],5,MP)+Ln([150,70],c,4,MC)+
    '<line x1="'+(c[0]-py*16).toFixed(1)+'" y1="'+(c[1]+px*16).toFixed(1)+'" x2="'+(c[0]+py*16).toFixed(1)+'" y2="'+(c[1]-px*16).toFixed(1)+'" stroke="'+MP+'" stroke-width="6" stroke-linecap="round"/>';},
  f:[{hip:[66,96],t:-140,ank:[112,72],kd:1,ft:-60,ua:60,fa:10,face:1},{hip:[66,96],t:-140,ank:[132,62],kd:1,ft:-60,ua:60,fa:10,face:1}]};
POSES.legcurl={bg:FLOOR,
  m:function(J){return seat(58,98,46)+R(54,44,9,58,MD,4)+pad([J.k1[0]-8,J.k1[1]-10],22,8)+pad([J.a1[0]+4,J.a1[1]],9,9)+Ln([J.k1[0],J.k1[1]],[J.a1[0]+4,J.a1[1]],3,MC);},
  f:[{hip:[78,92],t:-98,th:0,sh:15,ft:-20,ua:75,fa:10,face:1},{hip:[78,92],t:-98,th:0,sh:115,ft:20,ua:75,fa:10,face:1}]};
POSES.legext={bg:FLOOR,
  m:function(J){return seat(58,98,46)+R(54,44,9,58,MD,4)+pad([J.a1[0]+5,J.a1[1]-3],9,9)+Ln([J.k1[0],J.k1[1]],[J.a1[0]+5,J.a1[1]-3],3,MC)+Ci(J.k1,3,MP);},
  f:[{hip:[78,92],t:-98,th:0,sh:95,ft:0,ua:75,fa:10,face:1},{hip:[78,92],t:-98,th:0,sh:5,ft:-80,ua:75,fa:10,face:1}]};
POSES.abduct={front:1,bg:FLOOR,
  m:function(J){return R(82,24,36,68,MD,5)+R(74,96,52,7,MP)+R(97,103,6,25,MP)+R(80,124,40,4,MP);},
  fg:function(J){return pad([J.kL[0]-7,J.kL[1]+2],7,16)+pad([J.kR[0]+7,J.kR[1]+2],7,16);},
  f:[{hip:[100,94],seated:1,spread:0,uaL:100,faL:80,uaR:80,faR:100},{hip:[100,94],seated:1,spread:14,uaL:100,faL:80,uaR:80,faR:100}]};
POSES.adduct={front:1,bg:FLOOR,
  m:function(J){return R(82,24,36,68,MD,5)+R(74,96,52,7,MP)+R(97,103,6,25,MP)+R(80,124,40,4,MP);},
  fg:function(J){return pad([J.kL[0]+7,J.kL[1]+2],7,16)+pad([J.kR[0]-7,J.kR[1]+2],7,16);},
  f:[{hip:[100,94],seated:1,spread:16,uaL:100,faL:80,uaR:80,faR:100},{hip:[100,94],seated:1,spread:2,uaL:100,faL:80,uaR:80,faR:100}]};
POSES.hacksquat={bg:FLOOR,
  m:function(J){var n=-106-90,b=FIG.pt(FIG.pt(J.hip,n,10),74,6),e=FIG.pt(FIG.pt(J.hip,n,10),-106,44);return R(70,122,70,5,MP)+'<polygon points="88,124 140,124 132,116 96,116" fill="'+MD+'"/>'+Ln([46,124],[78,14],5,MP)+'<line x1="'+b[0].toFixed(1)+'" y1="'+b[1].toFixed(1)+'" x2="'+e[0].toFixed(1)+'" y2="'+e[1].toFixed(1)+'" stroke="'+MD+'" stroke-width="9" stroke-linecap="round"/>';},
  fg:function(J){return pad([J.sh[0]+3,J.sh[1]-6],14,7);},
  f:[{hip:[86,62],t:-106,ank:[106,116],kd:1,ft:0,hand:[96,34],ed:1,face:1},{hip:[95,86],t:-106,ank:[106,116],kd:1,ft:0,hand:[105,58],ed:1,face:1}]};
POSES.calfmachine={sc:0.86,bg:FLOOR,
  m:function(J){return R(104,116,20,12,MD,2)+R(140,4,8,124,MP)+Ln([144,20],[J.sh[0]+4,J.sh[1]-6],4,MC);},
  fg:function(J){return pad([J.sh[0]+2,J.sh[1]-6],18,7);},
  f:[{hip:[100,61],t:-90,ank:[100,118],kd:1,ft:-12,hand:[108,31],ed:1,face:1},{hip:[100,50],t:-90,ank:[100,107],kd:1,ft:58,hand:[108,20],ed:1,face:1}]};
POSES.bridge={bg:MAT,
  f:[{hip:[82,117],t:0,hd:2,th:230,sh:103,ft:180,ua:170,fa:180,face:1,lie:1},{hip:[84,104],t:24,hd:20,th:204,sh:90,ft:180,ua:166,fa:178,face:1,lie:1}]};
POSES.backext={bg:FLOOR,
  m:function(J){return Ln([40,124],[100,72],7,MD)+Ln([60,124],[60,105],5,MP)+Ln([92,124],[92,85],5,MP)+pad([J.hip[0]+6,J.hip[1]+4],12,12)+pad([J.a1[0]+2,J.a1[1]+7],9,9);},
  f:[{hip:[96,68],t:80,hd:85,th:137,sh:137,ft:-130,ua:150,fa:-40,face:1},{hip:[96,68],t:-43,hd:-43,th:137,sh:137,ft:-130,ua:20,fa:-160,face:1}]};
POSES.chestpress={bg:FLOOR,
  m:function(J){return seat(58,98,40)+R(54,40,9,62,MD,4)+R(146,4,8,124,MP)+Ln([150,30],[J.h1[0]+3,J.h1[1]],4,MC);},
  fg:function(J){return pad([J.h1[0]+2,J.h1[1]],6,14);},
  f:[{hip:[76,93],t:-92,hand:[95,68],ed:1,th:2,sh:88,ft:0,face:1},{hip:[76,93],t:-92,hand:[118,66],ed:1,th:2,sh:88,ft:0,face:1}]};
POSES.lateral={front:1,bg:FLOOR,
  fg:function(J){return DB(J.wL)+DB(J.wR);},
  f:[{hip:[100,68],uaL:98,faL:94,uaR:82,faR:86},{hip:[100,68],uaL:182,faL:176,uaR:-2,faR:4}]};
POSES.curl={bg:FLOOR,
  m:function(J){return seat(62,98,40)+R(58,42,9,60,MD,4);},
  fg:function(J){return DB(J.h1);},
  f:[{hip:[80,93],t:-92,ua:94,fa:92,th:2,sh:88,ft:0,face:1},{hip:[80,93],t:-92,ua:96,fa:-75,th:2,sh:88,ft:0,face:1}]};
POSES.pushdown={bg:FLOOR,
  m:function(J){return R(140,4,8,124,MP)+R(118,4,30,6,MD)+Ci([124,10],4,MP)+Ln([124,10],[J.h1[0]+2,J.h1[1]-2],1.5,"#333");},
  fg:function(J){return R(J.h1[0]-6,J.h1[1]-3,14,5,MP,2);},
  f:[{hip:[98,67],t:-84,ua:96,fa:-25,th:90,sh:90,ft:0,face:1},{hip:[98,67],t:-84,ua:96,fa:92,th:90,sh:90,ft:0,face:1}]};
