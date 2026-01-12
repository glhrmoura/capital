if (navigator.userAgent.match(/iPhone|iPad|iPod/)) {
  window.addEventListener('beforeunload', () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'FORCE_UPDATE_CHECK'
      });
    }
  });

  window.addEventListener('focus', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update();
        }
      });
    }
  });

  window.addEventListener('online', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update();
        }
      });
    }
  });
}
