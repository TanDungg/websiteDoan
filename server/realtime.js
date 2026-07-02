let clients = [];

function initRealtime(app) {
  app.get("/api/realtime", (req, res) => {
    const tabId = req.query.tabId;

    // Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // Ensure response headers are sent immediately
    res.flushHeaders();

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: "CONNECTED" })}\n\n`);

    // Clean up stale sockets first
    clients = clients.filter(
      (c) => c.res && c.res.socket && !c.res.socket.destroyed,
    );

    // If tabId is provided, close any existing connections for the same tab (e.g. on page refresh)
    if (tabId) {
      const existingIndex = clients.findIndex((c) => c.tabId === tabId);
      if (existingIndex !== -1) {
        const oldClient = clients[existingIndex];
        try {
          oldClient.res.end();
        } catch (e) {
          // ignore
        }
        clients.splice(existingIndex, 1);
      }
    }

    // Add to active clients list
    clients.push({ res, tabId });

    // Keep connection alive with simple ping comment every 30 seconds
    const keepAlive = setInterval(() => {
      try {
        res.write(":\n\n");
      } catch (e) {
        clearInterval(keepAlive);
      }
    }, 30000);

    // Remove client on disconnect
    req.on("close", () => {
      clearInterval(keepAlive);
      clients = clients.filter((c) => c.res !== res);
    });
  });
}

function sendRealtimeUpdate(target) {
  const payload = { target };
  const message = `data: ${JSON.stringify(payload)}\n\n`;

  // Clean up stale sockets first
  clients = clients.filter(
    (c) => c.res && c.res.socket && !c.res.socket.destroyed,
  );

  clients.forEach((client) => {
    try {
      client.res.write(message);
    } catch (err) {
      console.error("[Realtime] Error broadcasting to client:", err);
    }
  });
}

function getClients() {
  return clients;
}

module.exports = {
  initRealtime,
  sendRealtimeUpdate,
  getClients,
};
