import "dotenv/config";
import { createServer } from "http";
import { WebSocketServer, type WebSocket } from "ws";
import { parseCookie } from "cookie";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

interface AuthedSocket extends WebSocket {
  userId?: string;
  listingId?: string;
  otherUserId?: string;
  roomKey?: string;
}

const rooms = new Map<string, Set<AuthedSocket>>();

function roomKeyFor(listingId: string, userA: string, userB: string) {
  const [a, b] = [userA, userB].sort();
  return `${listingId}:${a}:${b}`;
}

function joinRoom(ws: AuthedSocket, key: string) {
  if (!rooms.has(key)) rooms.set(key, new Set());
  rooms.get(key)!.add(ws);
}

function leaveRoom(ws: AuthedSocket, key: string) {
  const set = rooms.get(key);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) rooms.delete(key);
}

function broadcast(key: string, payload: unknown) {
  const set = rooms.get(key);
  if (!set) return;
  const data = JSON.stringify(payload);
  for (const client of set) {
    if (client.readyState === client.OPEN) client.send(data);
  }
}

const httpServer = createServer();
const wss = new WebSocketServer({ noServer: true });

httpServer.on("upgrade", async (req, socket, head) => {
  try {
    const url = new URL(req.url ?? "", "http://localhost");
    const listingId = url.searchParams.get("listingId");
    const otherUserId = url.searchParams.get("otherUserId");

    if (!listingId || !otherUserId) {
      socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      socket.destroy();
      return;
    }

    const cookieHeader = req.headers.cookie ?? "";
    const cookies = parseCookie(cookieHeader);

    const token = await getToken({
      req: { headers: req.headers, cookies } as never,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    if (token.id === otherUserId) {
      socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      const authed = ws as AuthedSocket;
      authed.userId = token.id as string;
      authed.listingId = listingId;
      authed.otherUserId = otherUserId;
      authed.roomKey = roomKeyFor(listingId, token.id as string, otherUserId);
      wss.emit("connection", authed, req);
    });
  } catch (err) {
    console.error("WebSocket auth failed:", err);
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
  }
});

wss.on("connection", async (ws: AuthedSocket) => {
  const { userId, listingId, otherUserId, roomKey } = ws;
  if (!userId || !listingId || !otherUserId || !roomKey) {
    ws.close();
    return;
  }

  console.log(`User ${userId} joined room ${roomKey}`);
  joinRoom(ws, roomKey);

  try {
    const history = await db.message.findMany({
      where: {
        listingId,
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    ws.send(JSON.stringify({ type: "history", messages: history }));
  } catch (err) {
    console.error("Failed to load message history:", err);
  }

  ws.on("message", async (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      const body = typeof parsed.body === "string" ? parsed.body.trim() : "";

      if (!body || body.length > 2000) return;

      const message = await db.message.create({
        data: {
          listingId,
          senderId: userId,
          receiverId: otherUserId,
          body,
        },
      });

      broadcast(roomKey, { type: "message", message });
    } catch (err) {
      console.error("Failed to handle incoming message:", err);
    }
  });

  ws.on("close", () => {
    console.log(`User ${userId} left room ${roomKey}`);
    leaveRoom(ws, roomKey);
  });
});

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Chat server listening on ws://localhost:${PORT}`);
  console.log(`NEXTAUTH_SECRET loaded: ${Boolean(process.env.NEXTAUTH_SECRET)}`);
});