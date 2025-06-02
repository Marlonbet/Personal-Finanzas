// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// Detectar conexión y mostrar estado
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
  if (!navigator.onLine) {
    // Mostrar mensaje de que está usando versión offline
    const offlineAlert = document.createElement('div');
    offlineAlert.style.position = 'fixed';
    offlineAlert.style.bottom = '20px';
    offlineAlert.style.left = '50%';
    offlineAlert.style.transform = 'translateX(-50%)';
    offlineAlert.style.backgroundColor = '#ff9800';
    offlineAlert.style.color = 'white';
    offlineAlert.style.padding = '10px 20px';
    offlineAlert.style.borderRadius = '5px';
    offlineAlert.style.zIndex = '1000';
    offlineAlert.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    offlineAlert.textContent = 'Modo offline - Datos almacenados';
    
    document.body.appendChild(offlineAlert);
    
    setTimeout(() => {
      offlineAlert.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(offlineAlert);
      }, 500);
    }, 3000);
  }
}