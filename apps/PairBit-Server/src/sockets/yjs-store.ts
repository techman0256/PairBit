// In-memory Y.Doc store for each room
import * as Y from "yjs";

const docs: { [roomId: string]: Y.Doc } = {};

export function getYDoc(roomId: string): Y.Doc {
  if (!docs[roomId]) {
    docs[roomId] = new Y.Doc();
  }
  return docs[roomId];
}
