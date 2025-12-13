import React, { useEffect, useState } from "react";
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
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <h2>Room: {activeRoomId}</h2>
      <div style={{ marginBottom: 12, color: '#00e6fe', fontWeight: 600 }}>
        Username: {username}
      </div>
      {/* <div style={{ minHeight: 200, border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 16, background: '#232526', color: '#fff' }}>
        {messages.length === 0 && <div style={{ color: '#888' }}>No messages yet.</div>}
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <strong>{m.user}:</strong> {m.text}
            <span style={{ marginLeft: 8, color: "#888", fontSize: 12 }}>
              {new Date(m.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div> */}
      {/* <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Type a message..."
          style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #00e6fe', outline: 'none', fontSize: 16 }}
        />
        <button
          onClick={handleSend}
          style={{ padding: '8px 18px', borderRadius: 6, background: 'linear-gradient(90deg, #00e6fe 0%, #3a7bd5 100%)', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
        >
          Send
        </button>
      </div> */}
      <CollaborativeEditor roomId={activeRoomId || ""} username={username || ""} socket={socket} />
    </div>
  );
};

export default Room;
