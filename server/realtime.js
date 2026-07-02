let clients = [];

function initRealtime(app) {
  app.get("/api/realtime", (req, res) => {
    // Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    
    // Ensure response headers are sent immediately
    res.flushHeaders();

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: "CONNECTED" })}\n\n`);

    // Add to active clients list
    clients.push(res);

    // Keep connection alive with simple ping comment every 30 seconds
    const keepAlive = setInterval(() => {
      res.write(":\n\n");
    }, 30000);

    // Remove client on disconnect
    req.on("close", () => {
      clearInterval(keepAlive);
      clients = clients.filter((c) => c !== res);
    });
  });
}

function sendRealtimeUpdate(target) {
  const payload = { target };
  const message = `data: ${JSON.stringify(payload)}\n\n`;
  
  clients.forEach((client) => {
    try {
      client.write(message);
    } catch (err) {
      console.error("[Realtime] Error broadcasting to client:", err);
    }
  });
}

module.exports = {
  initRealtime,
  sendRealtimeUpdate,
  clients,
};
