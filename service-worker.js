const CACHE="pedreburguer-pwa-v10-final";
const APP=["/","/index.html","/manifest.webmanifest","/icon-192.png","/icon-512.png"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP)).catch(()=>{}));self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  event.respondWith(fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return r;}).catch(()=>caches.match(event.request).then(r=>r||caches.match("/index.html"))));
});
self.addEventListener("push",event=>{
  let d={title:"Pedreburguer",body:"Tienes una actualización.",url:"/"};
  try{if(event.data)d={...d,...event.data.json()};}catch{}
  event.waitUntil(self.registration.showNotification(d.title,{
    body:d.body,icon:"/icon-192.png",badge:"/icon-192.png",tag:"pb-"+(d.kind||"update")+"-"+Date.now(),
    renotify:true,requireInteraction:d.kind==="new_order",data:{url:d.url||"/"},vibrate:d.kind==="new_order"?[500,180,500,180,700]:[220,100,220]
  }));
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();const target=new URL(event.notification.data?.url||"/",self.location.origin).href;
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
    for(const c of list){if("focus" in c){c.navigate(target);return c.focus();}}
    return clients.openWindow(target);
  }));
});