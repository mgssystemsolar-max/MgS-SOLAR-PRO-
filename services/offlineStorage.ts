import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SolarSystemData, SavedProject } from '../types';

interface MGSDB extends DBSchema {
  projects: {
    key: string;
    value: SavedProject;
  };
  syncQueue: {
    key: number;
    value: {
      id: number;
      type: 'CREATE' | 'UPDATE' | 'DELETE';
      payload: any;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

const DB_NAME = 'mgs-solar-pro-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MGSDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<MGSDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          store.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
};

export const saveProjectOffline = async (project: SavedProject) => {
  const db = await initDB();
  await db.put('projects', project);
  
  // Add to sync queue if needed (mock sync for now)
  await db.add('syncQueue', {
    type: 'CREATE',
    payload: project,
    timestamp: Date.now()
  });
};

export const getOfflineProjects = async (): Promise<SavedProject[]> => {
  const db = await initDB();
  return db.getAll('projects');
};

export const deleteProjectOffline = async (id: string) => {
  const db = await initDB();
  await db.delete('projects', id);
  
  await db.add('syncQueue', {
    type: 'DELETE',
    payload: { id },
    timestamp: Date.now()
  });
};

export const syncOfflineData = async () => {
  const db = await initDB();
  const queue = await db.getAllFromIndex('syncQueue', 'by-timestamp');
  
  if (queue.length === 0) return;

  console.log(`Syncing ${queue.length} items...`);
  
  // In a real app, you would iterate and send to API here
  // For now, we just clear the queue as "synced"
  const tx = db.transaction('syncQueue', 'readwrite');
  await tx.store.clear();
  await tx.done;
  
  console.log('Sync complete.');
};
