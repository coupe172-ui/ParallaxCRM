/* Parallax 28.09-5. No caching of the CRM, OAuth callbacks or business data. */
self.addEventListener('notificationclick',event=>{
  event.stopImmediatePropagation();event.notification.close();
  const url=new URL(event.notification.data?.url||'./',self.registration.scope);
  if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
  event.waitUntil(clients.openWindow(url.href));
});
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(clients.claim()));
importScripts('./firebase-config.js');
if(self.PARALLAX_PUSH?.firebase?.apiKey){
  importScripts('./vendor/firebase-app-compat.js');
  importScripts('./vendor/firebase-messaging-compat.js');
  firebase.initializeApp(self.PARALLAX_PUSH.firebase);
  firebase.messaging().onBackgroundMessage(payload=>{
    const d=payload.data||{};
    return self.registration.showNotification('Parallax · Задачи',{
      body:d.kind==='test'?'Проверка: уведомления подключены.':d.kind==='assigned'?'Вам назначена задача. Откройте CRM.':'Напоминание о задаче. Откройте CRM.',
      icon:'./icon-192.png',badge:'./icon-192.png',tag:d.tag||'parallax-task',
      data:{url:d.url||'./'},renotify:false
    });
  });
}
