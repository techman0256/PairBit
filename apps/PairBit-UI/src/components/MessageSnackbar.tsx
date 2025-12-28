import React, { useContext } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import MessageContext from "../context/messageContext";
import type { AlertColor } from "@mui/material/Alert";

const Alert = React.forwardRef<HTMLDivElement, any>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const MessageSnackbar: React.FC = () => {
  const messageContext = useContext(MessageContext);

  if (!messageContext) return null;

  const { message, type, clearMessage } = messageContext;

  const open = Boolean(message);

  // Detect light or dark mode
  const isLightMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

  const colorStyles: Record<string, any> = isLightMode
    ? {
        success: {
          backgroundColor: '#baffc9', // light green
          color: '#0f5c2e', // dark green font
          fontWeight: 600,
        },
        error: {
          backgroundColor: '#ffd6d6', // light red
          color: '#7b1e1e', // dark red font
          fontWeight: 600,
        },
        warning: {
          backgroundColor: '#fff7b2', // light yellow
          color: '#7c5700', // dark yellow font
          fontWeight: 600,
        },
        info: {
          backgroundColor: '#b2e0ff', // light blue
          color: '#0d3056', // dark blue font
          fontWeight: 600,
        },
      }
    : {
        success: {
          backgroundColor: '#0f5c2e', // dark green
          color: '#04ff11', // lime font
          fontWeight: 600,
        },
        error: {
          backgroundColor: '#7b1e1e', // dark red
          color: '#ffb3b3', // light red font
          fontWeight: 600,
        },
        warning: {
          backgroundColor: '#7c5700', // dark yellow/brown
          color: '#ffe066', // light yellow font
          fontWeight: 600,
        },
        info: {
          backgroundColor: '#0d3056', // dark blue
          color: '#7fd8ff', // light blue font
          fontWeight: 600,
        },
      };

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={clearMessage}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={clearMessage}
        severity={type as AlertColor}
        sx={{ width: "100%", ...colorStyles[type] }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default MessageSnackbar;
