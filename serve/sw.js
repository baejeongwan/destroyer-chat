let isFirst = false;
self.addEventListener('install', (e) => {
    isFirst = true;
})

self.addEventListener('activate', (e) => {
    if (isFirst) {
        regAl()
    }
})

self.addEventListener('fetch', (e) => {
    console.log("Fetch")
})

self.addEventListener('push', (e) => {
    const data = e.data.json();
    console.log("PUSH 받음");
    self.registration.showNotification(data.title, {
        body: "Notify"
    })
})

            
function urlBase64toUint8Array(base64String) {
    var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    var rawData = self.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function regAl() {
    console.log("INSTALL"); 
    const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64toUint8Array("BE0w5cacTk7qYkoMbldLwO9VZXYGJutmdrFTTNDvcgLiDGB1pZoRaWZuWz2t122ixQR9rQI6IW8BOHveCyyw9fs")
    })
    console.log("앱에 알림관련 정보 저장함");
    console.log(subscription);
    console.log(JSON.stringify(subscription))
    await fetch('/push', {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
            "content-type": "application/json"
        }
    })
    console.log("알림 요청함")      
}