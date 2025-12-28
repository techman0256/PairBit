import { createContext } from "react";

import { useState } from "react";
import type { ReactNode } from "react";

type MessageType = "success" | "error" | "warning" | "info";

type MessageContextType = {
    message: string;
    type: MessageType;
    setMessage: (msg: string, type?: MessageType) => void;
    clearMessage: () => void;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

type MessageProviderProps = {
    children: ReactNode;
};

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
    const [message, setMsg] = useState("");
    const [type, setType] = useState<MessageType>("info");

    const setMessage = (msg: string, type: MessageType = "info") => {
        setMsg(msg);
        setType(type);
    };

    const clearMessage = () => {
        setMsg("");
    };

    return (
        <MessageContext.Provider value={{ message, type, setMessage, clearMessage }}>
            {children}
        </MessageContext.Provider>
    );
};

export default MessageContext;