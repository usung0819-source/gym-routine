/* 헬스 주간 루틴 - 알림 전용 서비스워커 (화면 캐시는 하지 않음) */
self.addEventListener("install",function(e){self.skipWaiting();});
self.addEventListener("activate",function(e){e.waitUntil(self.clients.claim());});
self.addEventListener("push",function(e){
  var p={};try{p=e.data?e.data.json():{};}catch(x){try{p={data:{body:e.data.text()}};}catch(y){}}
  var d=p.data||p,n=p.notification||{};
  var title=d.title||n.title||"헬스 주간 루틴",body=d.body||n.body||"",url=d.url||"./";
  e.waitUntil(self.registration.showNotification(title,{body:body,icon:"icon-192.png",badge:"icon-192.png",tag:d.tag||"gym",renotify:true,data:{url:url}}));
});
self.addEventListener("notificationclick",function(e){
  e.notification.close();
  var url=new URL((e.notification.data&&e.notification.data.url)||"./",self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(function(cs){
    for(var i=0;i<cs.length;i++){var c=cs[i];if(c.url.indexOf(self.registration.scope)===0&&"focus" in c)return c.focus();}
    return self.clients.openWindow(url);
  }));
});
