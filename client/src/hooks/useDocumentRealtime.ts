import { useEffect, useState } from "react";
import { getSocket } from "../lib/socket";

type DocStatePayload = {
  documentId: string;
  content: string;
};

type JoinPayload = {
  documentId: string;
  userId: string;
};

type UpdatePayload = {
  documentId: string;
  userId: string;
  content: string;
};

export function useDocumentRealtime(documentId: string, userId: string) {
  const [content, setContent] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const socket = getSocket();

    if (!documentId || !userId) {
      console.warn("useDocumentRealtime called without ids");
      return;
    }

    const handleConnect = () => {
      console.log("[realtime] connected");
      setIsConnected(true);

      const joinPayload: JoinPayload = { documentId, userId };
      console.log("[realtime] join_document", joinPayload);
      socket.emit("join_document", joinPayload);
    };

    const handleDisconnect = () => {
      console.log("[realtime] disconnected");
      setIsConnected(false);
    };

    const handleDocState = (payload: DocStatePayload) => {
      console.log("[realtime] doc_state", payload);
      if (payload.documentId === documentId) {
        setContent(payload.content ?? "");
      }
    };

    const handleErrorMessage = (payload: { message: string }) => {
      console.error("[realtime] error_message", payload);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("doc_state", handleDocState);
    socket.on("error_message", handleErrorMessage);

    // if already connected when hook mounts, trigger join immediately
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("doc_state", handleDocState);
      socket.off("error_message", handleErrorMessage);
    };
  }, [documentId, userId]);

  const updateContent = (newContent: string) => {
    setContent(newContent);

    const socket = getSocket();
    const payload: UpdatePayload = {
      documentId,
      userId,
      content: newContent,
    };

    console.log("[realtime] doc_update", payload);
    socket.emit("doc_update", payload);
  };

  return {
    content,
    updateContent,
    isConnected,
  };
}
