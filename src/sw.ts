// src/sw.ts
self.addEventListener("push", (event: PushEvent) => {
    const data = event.data?.json() as { title: string; body: string } | undefined;
    if (!data) return;
    
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/android-chrome-192x192.png",
    });
  });