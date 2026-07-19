// EdgeOne Pages Function
// 部署后这个文件会自动映射为接口地址: /room
// 需要在 EdgeOne Pages 控制台绑定一个 KV 命名空间，
// 绑定时 Variable Name 请填写：ROOM_KV  (要和下面 env.ROOM_KV 一致)

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export async function onRequest({ request, env }) {
  const KV = env.ROOM_KV;
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return json({ ok: true });
  }

  if (request.method === "GET") {
    const code = url.searchParams.get("code");
    if (!code) return json({ error: "missing code" }, 400);
    const raw = await KV.get(code);
    if (!raw) return json({ error: "room not found" }, 404);
    return json(JSON.parse(raw));
  }

  if (request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: "invalid json body" }, 400);
    }
    const { code, action, payload } = body || {};
    if (!code || !action) return json({ error: "missing code or action" }, 400);

    if (action === "create") {
      const room = {
        question: (payload && payload.question) || "说一件大多数人不知道关于你的趣事",
        phase: "collecting",
        players: [],
        createdAt: Date.now()
      };
      await KV.put(code, JSON.stringify(room));
      return json(room);
    }

    const raw = await KV.get(code);
    if (!raw) return json({ error: "room not found" }, 404);
    const room = JSON.parse(raw);

    if (action === "submitAnswer") {
      const { id, name, answer } = payload || {};
      if (!name || !answer) return json({ error: "missing name or answer" }, 400);
      if (!room.players.some(p => p.name === name)) {
        room.players.push({ id: id || (Date.now() + "-" + Math.random().toString(36).slice(2)), name, answer });
      }
    } else if (action === "startGuessing") {
      room.phase = "guessing";
      room.shuffledIds = (payload && payload.shuffledIds) || room.players.map(p => p.id);
    } else {
      return json({ error: "unknown action" }, 400);
    }

    await KV.put(code, JSON.stringify(room));
    return json(room);
  }

  return json({ error: "method not allowed" }, 405);
}
