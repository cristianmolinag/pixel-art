const DB_NAME = "pixel-art-studio";
const DB_VERSION = 1;
const STORE = "drawings";
const INDEX = "created";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        store.createIndex(INDEX, "createdAt");
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function inStore(txMode, operation) {
  return new Promise((resolve, reject) => {
    openDB().then(
      (db) => {
        const tx = db.transaction(STORE, txMode);
        const store = tx.objectStore(STORE);
        const req = operation(store);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          try {
            db.close();
          } catch {
            /* noop */
          }
          resolve(req.result);
        };
        tx.onerror = () => {
          try {
            db.close();
          } catch {
            /* noop */
          }
          reject(tx.error);
        };
      },
      (err) => reject(err)
    );
  });
}

export function saveDrawing(drawing) {
  return inStore("readwrite", (store) => store.put(drawing));
}

export function listDrawings() {
  return inStore("readonly", (store) => store.getAll()).then((drawings) =>
    [...drawings].sort((a, b) => b.createdAt - a.createdAt || b.id - a.id)
  );
}

export function deleteDrawing(id) {
  return inStore("readwrite", (store) => store.delete(id));
}