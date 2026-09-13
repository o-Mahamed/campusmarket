import "dotenv/config";
import { createServer } from "http";
import { WebSocketServer, type WebSocket } from "ws";
import { parseCookie } from "cookie";
import { getToken } from "next-auth/jwt";

interface AuthedSocket extends WebSocket {
  userId?: string;
}

const httpServer = createServer();
const wss = new WebSocketServer({ noServer: true });

httpServer.on("upgrade", async (req, socket, head) => {
  try {
    const cookieHeader = req.headers.cookie ?? "";
    const cookies = parseCookie(cookieHeader);

    // getToken() needs req.cookies as a parsed object, not a raw header string —
    // a plain Node http.IncomingMessage doesn't have that like Next.js requests do.
    const token = await getToken({
      req: { headers: req.headers, cookies } as never,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      (ws as AuthedSocket).userId = token.id as string;
      wss.emit("connection", ws, req);
    });
  } catch (err) {
    console.error("WebSocket auth failed:", err);
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
  }
});

wss.on("connection", (ws: AuthedSocket) => {
  console.log(`Client connected: user ${ws.userId}`);

  ws.on("message", (data) => {
    console.log(`Message from ${ws.userId}:`, data.toString());
  });

  ws.on("close", () => {
    console.log(`Client disconnected: user ${ws.userId}`);
  });
});

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Chat server listening on ws://localhost:${PORT}`);
});