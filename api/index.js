// Vercel Serverless API handler for Useless Projects 3.0

// Shared in-memory state across warm serverless instances
let state = {
  target: 32,
  paused: false,
  fired: false,
  attendees: []
};

const defaultNames = [
  "aadhi", "nandana", "sreehari", "fathima", "anaswara",
  "jithin", "devika", "arjun", "meenakshi", "rahul",
  "hiba", "abhinav", "gowri", "sanjay", "aleena", "vishnu"
];

function getState() {
  const count = state.attendees.length;
  const rootsLit = state.target > 0 ? Math.min(24, Math.round((count / state.target) * 24)) : 0;
  const armed = count >= state.target;
  return {
    target: state.target,
    paused: state.paused,
    fired: state.fired,
    attendees: state.attendees,
    count,
    rootsLit,
    armed,
    publicUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""
  };
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-cache");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api/, "");

  // GET State
  if (req.method === "GET" && (path === "/state" || path === "")) {
    return res.status(200).json(getState());
  }

  // SSE Events stream
  if (req.method === "GET" && (path === "/events" || path === "/ws")) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Connection", "keep-alive");
    res.write(`event: init\ndata: ${JSON.stringify({ type: "init", state: getState() })}\n\n`);
    return res.end();
  }

  // POST Handlers
  if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};

    if (path === "/scan") {
      if (state.paused) {
        return res.status(400).json({ success: false, message: "System is paused by admin", state: getState() });
      }
      if (state.fired) {
        return res.status(400).json({ success: false, message: "Ceremony already fired", state: getState() });
      }
      if (state.attendees.length >= state.target) {
        return res.status(400).json({ success: false, message: "Target already reached", state: getState() });
      }

      const idx = state.attendees.length;
      let name = body.name;
      if (!name) {
        const base = defaultNames[idx % defaultNames.length];
        const suffix = idx >= defaultNames.length ? ` ${Math.floor(idx / defaultNames.length) + 1}` : "";
        name = `${base}${suffix}`;
      }
      const ticket = body.ticket || `THUB-${3210 + idx * 7}`;

      const attendee = {
        id: idx + 1,
        name: String(name).trim(),
        ticket: String(ticket).trim(),
        time: new Date().toLocaleTimeString()
      };
      state.attendees.unshift(attendee);
      return res.status(200).json({ success: true, message: "Scanned", state: getState() });
    }

    if (path === "/target") {
      const target = parseInt(body.target, 10);
      if (!isNaN(target) && target > 0) state.target = target;
      return res.status(200).json({ success: true, state: getState() });
    }

    if (path === "/pause") {
      state.paused = body.paused !== undefined ? Boolean(body.paused) : !state.paused;
      return res.status(200).json({ success: true, state: getState() });
    }

    if (path === "/fire") {
      state.fired = body.fired !== undefined ? Boolean(body.fired) : true;
      return res.status(200).json({ success: true, state: getState() });
    }

    if (path === "/reset") {
      state.attendees = [];
      state.fired = false;
      state.paused = false;
      return res.status(200).json({ success: true, state: getState() });
    }

    if (path === "/attendee/delete") {
      const id = parseInt(body.id, 10);
      state.attendees = state.attendees.filter(a => a.id !== id);
      const rev = [...state.attendees].reverse();
      rev.forEach((a, i) => a.id = i + 1);
      state.attendees = rev.reverse();
      return res.status(200).json({ success: true, state: getState() });
    }
  }

  return res.status(404).json({ error: "Not found" });
}
