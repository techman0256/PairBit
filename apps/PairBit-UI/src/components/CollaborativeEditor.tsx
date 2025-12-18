import React, { useEffect, useRef } from "react";
import * as Y from "yjs";
import { YjsSocketProvider } from "./YjsSocketProvider";
import { EditorView, basicSetup } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";

import * as random from 'lib0/random'
import { yCollab } from "y-codemirror.next";

import { Socket } from "socket.io-client";

interface CollaborativeEditorProps {
  roomId: string;
  username: string;
  socket: Socket;
}

import { usercolors, languageOptions } from "../extension/languageExt";
import { cursorTooltip } from "../extension/cursorTooltip";
import {getLanguageExtension} from "../extension/languageExt";
// select a random color for this user
export const userColor = usercolors[random.uint32() % usercolors.length];
const updateListener = EditorView.updateListener.of(update => {
  if (update.selectionSet) {
    const state = update.state;
    const cursor = state.selection.main.head;

    console.log("this is the cursor and state : ", cursor, state);
  };
})


const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ roomId, username, socket }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const ydocRef = useRef<Y.Doc | undefined>(undefined);
  const providerRef = useRef<YjsSocketProvider | undefined>(undefined);
  const viewRef = useRef<EditorView | undefined>(undefined);
  const [language, setLanguage] = React.useState<string>("javascript");

  useEffect(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stateVector = Y.encodeStateVector(ydoc);
    socket.emit("yjs-sync-step-1", { roomId, stateVector });
    const handleSyncStep2 = (update: Uint8Array) => {
      Y.applyUpdate(ydoc, update instanceof Uint8Array ? update : new Uint8Array(update));
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
          getLanguageExtension(language),
          cursorTooltip(),
          yCollab(ytext, provider.awareness, { undoManager: new Y.UndoManager(ytext) }),
          isDark ? oneDark : [],
        ]
      });
      if (editorRef.current) {
        viewRef.current = new EditorView({ state, parent: editorRef.current });
      }
    };
    socket.once("yjs-sync-step-2", handleSyncStep2);
    

    // Listen for color scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      if (editorRef.current && ydocRef.current && providerRef.current) {
        if (viewRef.current) viewRef.current.destroy();
        const ytext = ydocRef.current.getText("codemirror");
        const state = EditorState.create({
          doc: ytext.toString(),
          extensions: [
            basicSetup,
            getLanguageExtension(language),
            yCollab(ytext, providerRef.current.awareness, { undoManager: new Y.UndoManager(ytext) }),
            e.matches ? oneDark : []
          ]
        });
        viewRef.current = new EditorView({ state, parent: editorRef.current });
      }
    };
    mediaQuery.addEventListener('change', handleColorSchemeChange);

    return () => {
      providerRef.current?.destroy();
      if (viewRef.current) viewRef.current.destroy();
      socket.off("yjs-sync-step-2", handleSyncStep2);
      mediaQuery.removeEventListener('change', handleColorSchemeChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, username, socket, getLanguageExtension]);

  // Handle language change
  useEffect(() => {
    if (!viewRef.current || !editorRef.current || !ydocRef.current || !providerRef.current) return;
    const ytext = ydocRef.current.getText("codemirror");
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,
        getLanguageExtension(language),
        yCollab(ytext, providerRef.current.awareness, { undoManager: new Y.UndoManager(ytext) }),
        isDark ? oneDark : [],
      ]
    });
    viewRef.current.destroy();
    viewRef.current = new EditorView({ state, parent: editorRef.current });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <label htmlFor="language-select" style={{ marginRight: 8 }}>Language:</label>
        <select
          id="language-select"
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          {languageOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div ref={editorRef} style={{ width:700, height: 400, borderRadius: 8, overflow: 'hidden', background: 'var(--cm-background, #523737ff)' }} />
    </div>
  );
};


export default CollaborativeEditor;


/* 
  Awarness : 
    - Cursor, language

*/