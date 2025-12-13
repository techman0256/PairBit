import React, { useEffect, useRef } from "react";
import * as Y from "yjs";
import { YjsSocketProvider } from "./YjsSocketProvider";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import * as random from 'lib0/random'
import { yCollab } from "y-codemirror.next";

import { Socket } from "socket.io-client";

interface CollaborativeEditorProps {
  roomId: string;
  username: string;
  socket: Socket;
  editorType?: "codemirror"; 
}

export const usercolors = [
  { color: '#30bced', light: '#30bced33' },
  { color: '#6eeb83', light: '#6eeb8333' },
  { color: '#ffbc42', light: '#ffbc4233' },
  { color: '#ecd444', light: '#ecd44433' },
  { color: '#ee6352', light: '#ee635233' },
  { color: '#9ac2c9', light: '#9ac2c933' },
  { color: '#8acb88', light: '#8acb8833' },
  { color: '#1be7ff', light: '#1be7ff33' }
]

// select a random color for this user
export const userColor = usercolors[random.uint32() % usercolors.length]

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ roomId, username, socket, editorType = "codemirror" }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const ydocRef = useRef<Y.Doc | undefined>(undefined);
  const providerRef = useRef<YjsSocketProvider | undefined>(undefined);
  const viewRef = useRef<EditorView | undefined>(undefined);

  useEffect(() => {
    if (editorType !== "codemirror") return;
    // Ensure socket is connected and joins the correct room for collaborative editing
    if (socket && !socket.connected) {
      socket.connect();
    }
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Initial sync protocol: request state from server
    const stateVector = Y.encodeStateVector(ydoc);
    socket.emit("yjs-sync-step-1", { roomId, stateVector });
    const handleSyncStep2 = (update: Uint8Array) => {
      Y.applyUpdate(ydoc, update instanceof Uint8Array ? update : new Uint8Array(update));
      // After initial sync, set up provider and editor
      const provider = new YjsSocketProvider(roomId, ydoc, socket);
      providerRef.current = provider;
      provider.awareness.setLocalStateField("user", {
        name: username,
        color: "#00e6fe"
      });
      const ytext = ydoc.getText("codemirror");
      const state = EditorState.create({
        doc: ytext.toString(),
        extensions: [
          basicSetup,
          javascript(),
          yCollab(ytext, provider.awareness, { undoManager: new Y.UndoManager(ytext) })
        ]
      });
      if (editorRef.current) {
        viewRef.current = new EditorView({ state, parent: editorRef.current });
      }
    };
    socket.once("yjs-sync-step-2", handleSyncStep2);

    return () => {
      providerRef.current?.destroy();
      if (viewRef.current) viewRef.current.destroy();
      socket.off("yjs-sync-step-2", handleSyncStep2);
    };
  }, [roomId, username, editorType, socket]);

  return <div ref={editorRef} style={{ width:700, height: 400, borderRadius: 8, background: "#ddcdcdff" }} />;
};


export default CollaborativeEditor;