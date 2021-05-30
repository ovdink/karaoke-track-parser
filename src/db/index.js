import Dexie from 'dexie';

export const db = new Dexie('SongList');

db.version(1).stores({ song: 'id,name,size,data' });

db.open().catch((err) => {
  console.log(err.stack || err);
});
