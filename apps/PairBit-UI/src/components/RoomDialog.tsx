import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

interface RoomDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  type: 'join' | 'create';
  roomCode: string;
  onRoomCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  username: string;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RoomDialog: React.FC<RoomDialogProps> = ({
  open,
  onClose,
  onSubmit,
  type,
  roomCode,
  onRoomCodeChange,
  username,
  onUsernameChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 4, background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', color: '#fff' } }}>
      <DialogTitle sx={{ color: '#00e6fe', fontWeight: 700 }}>{type === 'join' ? 'Join Room' : 'Create Room'}</DialogTitle>
      <DialogContent>
        {type === 'join' && (
          <TextField
            autoFocus
            margin="dense"
            label="Room Code"
            type="text"
            fullWidth
            variant="outlined"
            value={roomCode}
            onChange={onRoomCodeChange}
            sx={{ input: { color: '#00e6fe', fontWeight: 600 }, label: { color: '#00e6fe' }, borderColor: '#00e6fe', mb: 2 }}
          />
        )}
        <TextField
          autoFocus={type === 'create'}
          margin="dense"
          label="Username"
          type="text"
          fullWidth
          variant="outlined"
          value={username}
          onChange={onUsernameChange}
          sx={{ input: { color: '#00e6fe', fontWeight: 600 }, label: { color: '#00e6fe' }, borderColor: '#00e6fe' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#fff' }}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" sx={{ background: 'linear-gradient(90deg, #00e6fe 0%, #3a7bd5 100%)', color: '#fff', fontWeight: 600 }}>{type === 'join' ? 'Join' : 'Create'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomDialog;
