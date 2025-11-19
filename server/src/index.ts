import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import { prisma } from "./db";
import { registerRealtimeHandlers } from "./realtime";

dotenv.config();


const app = express();
const httpServer = http.createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

registerRealtimeHandlers(io);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

io.on("connection", socket => {
  console.log("Client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

app.get("/test-users", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/debug/create-sample", async (_req, res) => {
  try {
    // Upsert a test user so it does not duplicate
    const user = await prisma.user.upsert({
      where: { email: "testuser@example.com" },
      update: {},
      create: {
        email: "testuser@example.com",
        name: "Test User",
      },
    });

    // Create a workspace for that user
    const workspace = await prisma.workspace.create({
      data: {
        title: "Demo Workspace",
        users: {
          connect: { id: user.id },
        },
      },
    });

    // Create a document inside that workspace
    const document = await prisma.document.create({
      data: {
        title: "First Demo Document",
        type: "text",
        content: "Hello from CollabFlow",
        workspace: {
          connect: { id: workspace.id },
        },
      },
    });

    res.json({
      userId: user.id,
      workspaceId: workspace.id,
      documentId: document.id,
    });
  } catch (err) {
    console.error("Error creating sample data", err);
    res.status(500).json({ error: "Failed to create sample data" });
  }
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`CollabFlow server listening on port ${PORT}`);
});

export { httpServer };
