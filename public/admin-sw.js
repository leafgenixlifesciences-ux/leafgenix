self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try { payload = event.data.json(); } catch { return; }
  event.waitUntil(self.registration.showNotification(payload.title || "LeafGenix order", {
    body: payload.body || "A new order needs your attention.",
    icon: "/leafgenix-mark.png",
    badge: "/leafgenix-mark.png",
    tag: payload.tag || "leafgenix-order",
    data: { url: "/admin" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = windows.find((client) => new URL(client.url).pathname.startsWith("/admin"));
    if (existing) return existing.focus();
    return self.clients.openWindow("/admin");
  })());
});
