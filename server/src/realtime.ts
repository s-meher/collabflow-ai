import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "./db";

type JoinDocumentPayload = {
  documentId: string;
  userId: string;
};

type DocUpdatePayload = {
  documentId: string;
  userId: string;
  content: string;
};

const makeRoomName = (documentId: string) => `document:${documentId}`;

export function registerRealtimeHandlers(io: SocketIOServer) {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected", socket.id);

    socket.on("join_document", async (payload: JoinDocumentPayload) => {
      try {
        const { documentId, userId } = payload;
        const room = makeRoomName(documentId);

        console.log(`Socket ${socket.id} joining room`, room);

        // Join the Socket.IO room
        socket.join(room);

        // Load the latest document content and send only to this client
        const document = await prisma.document.findUnique({
          where: { id: documentId },
        });

        if (document) {
          socket.emit("doc_state", {
            documentId,
            content: document.content ?? "",
          });
        } else {
          console.warn("Document not found for join_document", documentId);
        }
      } catch (err) {
        console.error("Error in join_document", err);
        socket.emit("error_message", {
          message: "Failed to join document",
        });
      }
    });

    socket.on("doc_update", async (payload: DocUpdatePayload) => {
      try {
        const { documentId, userId, content } = payload;
        const room = makeRoomName(documentId);

        console.log(
          `Received doc_update for document ${documentId} from user ${userId}`
        );

        // Save the latest content on the document
        await prisma.document.update({
          where: { id: documentId },
          data: { content },
        });

        // Save a change record
        await prisma.documentChange.create({
          data: {
            documentId,
            userId,
            content,
          },
        });

        // Broadcast updated content to everyone else in that document room
        socket.to(room).emit("doc_state", {
          documentId,
          content,
        });
      } catch (err) {
        console.error("Error in doc_update", err);
        socket.emit("error_message", {
          message: "Failed to apply update",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });
}
