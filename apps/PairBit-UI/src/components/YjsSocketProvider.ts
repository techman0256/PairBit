import * as Y from "yjs";
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from "y-protocols/awareness";
import { Socket } from "socket.io-client";

export class YjsSocketProvider {
  public doc: Y.Doc;
  public awareness: Awareness;
  public socket: Socket;
  public roomId: string;

  constructor(roomId: string, doc: Y.Doc, socket: Socket) {
    this.doc = doc;
    this.roomId = roomId;
    this.awareness = new Awareness(doc);
    this.socket = socket;

    // Listen for remote Yjs updates
    this.socket.on("yjs-update", (update: Uint8Array) => {
        const uint8 = update instanceof Uint8Array ? update : new Uint8Array(update);
        console.log("This are the upcoming updates", typeof(uint8), uint8);
        
        Y.applyUpdate(this.doc, uint8);
    });
    
    // Listen for remote awareness updates
    this.socket.on("yjs-awareness", (update: Uint8Array) => {
        applyAwarenessUpdate(this.awareness, update, undefined);
    });
    
    // Broadcast local Yjs updates
    this.doc.on("update", (update: Uint8Array) => {
        this.socket.emit("yjs-update", { roomId, update });
    });

    // Broadcast local awareness updates
    this.awareness.on(
      "update",
      ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }) => {
        const update = encodeAwarenessUpdate(this.awareness, [
          ...added,
          ...updated,
          ...removed,
        ]);
        this.socket.emit("yjs-awareness", { roomId, update });
      }
    );
  }

  destroy() {
    // Do not disconnect the socket, just clean up Yjs
    this.doc.destroy();
  }
}
