import React, { useEffect, useState } from "react";
import { useTheme } from "../context/themeContext";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import CollaborativeEditor from "./CollaborativeEditor";

interface Message {
  user: string;
  text: string;
  timestamp: number;
}

interface RoomProps {
  username: string;
  activeRoomId?: string;
  setActiveRoomId?: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const Room: React.FC<RoomProps> = ({ username, activeRoomId, setActiveRoomId }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { mode, toggleTheme, palette } = useTheme();

  // // If not activeRoomId or it doesn't match the URL, redirect to home
  useEffect(() => {
    if (!activeRoomId) {
      navigate('/', { replace: true });
    }
  }, [activeRoomId]);

  useEffect(() => {
    socket.on("message", (msg: any) => {
      if (msg?.type === "message" && msg?.event === "message") {
        setMessages((prev) => [...prev, msg.data]);
      }
    });
    return () => {
      socket.off("message");
    };
  }, []);

  const handleSend = () => {
    if (!input.trim() || !activeRoomId || !username) return;
    socket.emit("message", { roomId: activeRoomId, text: input, user: username });
    setInput("");
  };

  return (
    <div style={{ display: 'grid', width: '95vw', gridTemplateColumns: '1fr 5fr', padding: 12, margin: '0 auto', gap: 16, background: palette.background, color: palette.text }}>
      {/* Left Panel : metadata and description */}
      <div>
        <h2>Room ID: {activeRoomId}</h2>
        <div style={{ marginBottom: 12, color: palette.accent, fontWeight: 600 }}>
          Username: {username}
        </div>
        <div style={{ marginTop: 24, background: palette.foreground, borderRadius: 12, padding: 18, color: palette.text, boxShadow: `0 2px 8px ${palette.border}`, maxWidth: 260 }}>
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>About</h3>
          <p style={{ fontSize: 12, marginBottom: 14, color: palette.secondary }}>
            PairBit is a collaborative code editor for real-time pair programming, and code sharing. Work together in rooms, see live edits, and communicate instantly.
          </p>
          <a
            href="https://github.com/techman0256/PairBit"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: palette.accent,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              border: `1px solid ${palette.accent}`,
              borderRadius: 6,
              padding: '4px 10px',
              transition: 'background 0.2s',
              width: 'fit-content',
            }}
            onMouseOver={e => (e.currentTarget.style.background = `${palette.accent}22`)}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: 4 }}>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.11.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>

      <div>
        {/* Right Panel: Code Editor */}
        <div style={{ padding: 0, borderTopRightRadius: 12, borderBottomRightRadius: 12, background: palette.foreground, display: 'flex', flexDirection: 'column' }}>
          <CollaborativeEditor roomId={activeRoomId || ""} username={username || ""} socket={socket} />
        </div>
      </div>
    </div>
  );
};

export default Room;
