import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import socket from './socket';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import RoomDialog from './components/RoomDialog';
import Room from './components/Room';
import MessageSnackbar from './components/MessageSnackbar';
import { useContext } from 'react';
import MessageContext from './context/messageContext';

function generateDefaultUsername(): string {
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `coder_${randomStr}`;
}

interface HomeProps {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
}

interface HomeProps {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setActiveRoomId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const Home: React.FC<HomeProps> = ({ username, setUsername, setActiveRoomId }) => {
  const messageContext = useContext(MessageContext);
  const navigate = useNavigate();
  const [openJoin, setOpenJoin] = useState<boolean>(false);
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>('');

  // Handlers
  const handleJoinClick = () => setOpenJoin(true);
  const handleCreateClick = () => setOpenCreate(true);
  const handleCloseJoin = () => setOpenJoin(false);
  const handleCloseCreate = () => setOpenCreate(false);
  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => setRoomCode(e.target.value);
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);

  // Connect socket if not already
  if (!socket.connected) socket.connect();

  const handleCreateRoom = () => {
    socket.emit('create-room', { username });
    socket.once('room-created', (msg: any) => {
      if (msg?.type === 'success' && msg?.data?.roomId) {
        setActiveRoomId(msg.data.roomId);
        navigate(`/${msg.data.roomId}`);
        messageContext?.setMessage('Room created successfully!', 'success');
      } else {
        messageContext?.setMessage('Failed to create room.', 'error');
      }
    });
    setOpenCreate(false);
  };

  const handleJoinRoom = () => {
    socket.emit('join-room', { roomId: roomCode, username });
    socket.once('room-joined', (msg: any) => {
      if (msg?.type === 'success' && msg?.data?.roomId) {
        setActiveRoomId(msg.data.roomId);
        navigate(`/${msg.data.roomId}`);
        messageContext?.setMessage(`Room ${msg.data.roomId} joined successfully!`, 'success');
      }
    });
    socket.once('room-not-found', (msg: any) => {
      messageContext?.setMessage(msg?.error || 'Room not found.', 'error');
    });
    setOpenJoin(false);
    setRoomCode('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}>
      <h1 style={{ color: '#00e6fe', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700, letterSpacing: 2, marginBottom: 40 }}>PairBit Collaborative Code Editor</h1>
      <Stack direction="row" spacing={4}>
        <Button
          variant="contained"
          onClick={handleCreateClick}
          sx={{
            background: 'linear-gradient(90deg, #00e6fe 0%, #3a7bd5 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1.1rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,230,254,0.2)',
            padding: '12px 32px',
            textTransform: 'none',
            transition: '0.3s',
            '&:hover': {
              background: 'linear-gradient(90deg, #3a7bd5 0%, #00e6fe 100%)',
              boxShadow: '0 6px 24px rgba(58,123,213,0.3)',
            },
          }}
        >
          Create Room
        </Button>
        <Button
          variant="outlined"
          onClick={handleJoinClick}
          sx={{
            borderColor: '#00e6fe',
            color: '#00e6fe',
            fontWeight: 600,
            fontSize: '1.1rem',
            borderRadius: '12px',
            padding: '12px 32px',
            textTransform: 'none',
            transition: '0.3s',
            boxShadow: '0 4px 20px rgba(0,230,254,0.1)',
            '&:hover': {
              background: 'rgba(0,230,254,0.08)',
              borderColor: '#3a7bd5',
              color: '#3a7bd5',
            },
          }}
        >
          Join Room
        </Button>
      </Stack>

      {/* Join Room Dialog */}
      <RoomDialog
        open={openJoin}
        onClose={handleCloseJoin}
        onSubmit={handleJoinRoom}
        type="join"
        roomCode={roomCode}
        onRoomCodeChange={handleRoomCodeChange}
        username={username}
        onUsernameChange={handleUsernameChange}
      />

      {/* Create Room Dialog */}
      <RoomDialog
        open={openCreate}
        onClose={handleCloseCreate}
        onSubmit={handleCreateRoom}
        type="create"
        roomCode={roomCode}
        onRoomCodeChange={handleRoomCodeChange}
        username={username}
        onUsernameChange={handleUsernameChange}
      />
    </div>
  );
};


import { useEffect } from 'react';

const App: React.FC = () => {
  const [username, setUsername] = useState<string>(generateDefaultUsername());
  const [activeRoomId, setActiveRoomId] = useState<string | undefined>(undefined);

  // Optionally, disconnect socket on unmount
  useEffect(() => {
    return () => {
      if (socket.connected) socket.disconnect();
    };
  }, []);

  // Listen for user-joined and user-left events globally
  const messageContext = useContext(MessageContext);
  useEffect(() => {
    const onUserJoined = (msg: any) => {
      if (msg?.data?.username) {
        // Only show for others, not for the user who just joined
        if (msg.data.userId !== socket.id) {
          messageContext?.setMessage(`${msg.data.username} joined the room.`, 'info');
        }
      }
    };
    const onUserLeft = (msg: any) => {
      if (msg?.data?.username) {
        messageContext?.setMessage(`${msg.data.username} left the room.`, 'warning');
      }
    };
    const onConnect = () => {
      messageContext?.setMessage('Connected to server.', 'success');
    };
    const onDisconnecting = () => {
      messageContext?.setMessage('Disconnecting from server...', 'warning');
    };
    const onConnectError = (err: any) => {
      const errorMsg = err?.message || 'Socket connection error.';
      messageContext?.setMessage(errorMsg, 'error');
    };
    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);
    socket.on('connect', onConnect);
    socket.on('disconnecting', onDisconnecting);
    socket.on('connect_error', onConnectError);
    return () => {
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
      socket.off('connect', onConnect);
      socket.off('disconnecting', onDisconnecting);
      socket.off('connect_error', onConnectError);
    };
  }, [messageContext]);

  return (
    <>
      <MessageSnackbar />
      <Router>
        <Routes>
          <Route path="/" element={<Home username={username} setUsername={setUsername} setActiveRoomId={setActiveRoomId} />} />
          <Route path=":roomId" element={<Room username={username} activeRoomId={activeRoomId} setActiveRoomId={setActiveRoomId} />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
