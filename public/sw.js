const DB_NAME = 'scorm-db';
const STORE_NAME = 'files';

// Open or create the database
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Get file from IndexedDB
async function getFile(courseId, filePath) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const key = `${courseId}:${filePath}`;
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Intercept requests to /api/content/[courseId]/[...path]
  const match = url.pathname.match(/^\/api\/content\/([^/]+)\/(.+)$/);
  
  if (match) {
    const courseId = match[1];
    const filePath = decodeURIComponent(match[2]);
    
    event.respondWith(
      (async () => {
        try {
          const fileData = await getFile(courseId, filePath);
          
          if (fileData) {
            // Determine content type
            // Note: Since this is a simple SW, we might need a basic mime detection 
            // or store the mime type in IndexedDB as well.
            // For now, let's use a basic one.
            const contentType = getMimeType(filePath);
            
            return new Response(fileData, {
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
          
          // Fallback to network if not found in IDB (might be a legitimate server call)
          return fetch(event.request);
        } catch (error) {
          console.error('SW fetch error:', error);
          return new Response('Error loading content from local storage', { status: 500 });
        }
      })()
    );
  }
});

function getMimeType(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  const types = {
    'html': 'text/html',
    'htm': 'text/html',
    'js': 'application/javascript',
    'css': 'text/css',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'xml': 'application/xml',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
  };
  return types[ext] || 'application/octet-stream';
}
