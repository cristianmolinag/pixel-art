const DB_NAME = "pixel-art-studio";
const DB_VERSION = 1;
const STORE = "dibujos";
const INDEX = "creado";

function abrirDB() {
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

function enStore(txMode, accion) {
  return new Promise((resolve, reject) => {
    abrirDB().then(
      (db) => {
        const tx = db.transaction(STORE, txMode);
        const store = tx.objectStore(STORE);
        const req = accion(store);
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

export function guardarDibujo(dibujo) {
  return enStore("readwrite", (store) => store.put(dibujo));
}

export function listarDibujos() {
  return enStore("readonly", (store) => store.getAll()).then((dibujos) =>
    [...dibujos].sort((a, b) => b.createdAt - a.createdAt || b.id - a.id)
  );
}

export function eliminarDibujo(id) {
  return enStore("readwrite", (store) => store.delete(id));
}