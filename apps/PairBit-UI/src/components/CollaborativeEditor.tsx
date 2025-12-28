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
import { remoteCursorTooltip } from "../extension/cursorTooltip";

import {getLanguageExtension} from "../extension/languageExt";
// select a random color for this user
const userColor = usercolors[random.uint32() % usercolors.length];

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ roomId, username, socket }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const ydocRef = useRef<Y.Doc | undefined>(undefined);
  const providerRef = useRef<YjsSocketProvider | undefined>(undefined);
  const viewRef = useRef<EditorView | undefined>(undefined);
  const [language, setLanguage] = React.useState<string>("javascript");
  const settingsMapRef = useRef<Y.Map<any> | undefined>(undefined);

  useEffect(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
    // 1. Create Y.Doc and YjsSocketProvider first
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    const provider = new YjsSocketProvider(roomId, ydoc, socket);
    providerRef.current = provider;
    provider.awareness.setLocalStateField("user", {
      name: username,
      color: userColor.color
    });
    // 2. Wait for initial sync before accessing Y.Map
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stateVector = Y.encodeStateVector(ydoc);
    socket.emit("yjs-sync-step-1", { roomId, stateVector });

    // Helper to (re)create the editor with the current language
    const recreateEditor = (lang: string) => {
      const ytext = ydoc.getText("codemirror");
      if (viewRef.current) viewRef.current.destroy();
      const state = EditorState.create({
        doc: ytext.toString(),
        extensions: [
          basicSetup,
          getLanguageExtension(lang),
          remoteCursorTooltip(),
          yCollab(
            ytext,
            provider.awareness,
            { undoManager: new Y.UndoManager(ytext) }
          ),
          isDark ? oneDark : [],
        ]
      });
      if (editorRef.current) {
        viewRef.current = new EditorView({ state, parent: editorRef.current });
      }
    };

    // Listen for language changes in the Y.Map and re-create editor
    let settingsMap: Y.Map<any>;
    let handleLanguageChange: (() => void) | undefined;

    const handleSyncStep2 = (update: Uint8Array) => {
      Y.applyUpdate(ydoc, update instanceof Uint8Array ? update : new Uint8Array(update));
      // 3. Now get the shared settings map
      settingsMap = ydoc.getMap("settings");
      settingsMapRef.current = settingsMap;
      // Only set default if not set after sync
      if (!settingsMap.has("language")) {
        settingsMap.set("language", "javascript");
      }
      handleLanguageChange = () => {
        const val = settingsMap.get("language");
        const lang: string = typeof val === "string" ? val : "javascript";
        setLanguage(lang);
        recreateEditor(lang);
      };
      settingsMap.observe(handleLanguageChange);
      // Set initial value and create editor
      handleLanguageChange();
    };
    socket.once("yjs-sync-step-2", handleSyncStep2);

    // Listen for color scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      if (editorRef.current && ydocRef.current && providerRef.current) {
        if (viewRef.current) viewRef.current.destroy();
        const ytext = ydocRef.current.getText("codemirror");
        const langVal = settingsMapRef.current?.get("language");
        const lang = typeof langVal === "string" ? langVal : "javascript";
        const state = EditorState.create({
          doc: ytext.toString(),
          extensions: [
            basicSetup,
            getLanguageExtension(lang),
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
      if (settingsMap && handleLanguageChange) settingsMap.unobserve(handleLanguageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, username, socket, getLanguageExtension]);

  // Remove the language effect, as editor is now re-created on Y.Map change

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <label htmlFor="language-select" style={{ marginRight: 8 }}>Language:</label>
        <select
          id="language-select"
          value={language}
          onChange={e => {
            // Update the Y.Map, which will sync to all clients
            if (settingsMapRef.current) {
              settingsMapRef.current.set("language", e.target.value);
            }
          }}
        >
          {languageOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div ref={editorRef} style={{ width:700, height: 400, borderRadius: 8, overflow: 'hidden', background: 'var(--cm-background, #eaeaeaff)' }} />
    </div>
  );
};


export default CollaborativeEditor;