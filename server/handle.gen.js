// src/utils/formatDate.ts
var KST_OFFSET = 9 * 60 * 60 * 1000;
var WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
var kst = (ms) => new Date(ms + KST_OFFSET);
function formatMonthDay(ms) {
  const d = kst(ms);
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`;
}
function formatCardDate(ms) {
  return `${formatMonthDay(ms)}(${WEEKDAYS[kst(ms).getUTCDay()]})`;
}

// src/data/ages.ts
var AGES = [
  "5세",
  "6세",
  "7세",
  "초1",
  "초2",
  "초3",
  "초4",
  "초5",
  "초6",
  "중1"
];

// src/utils/shareCode.ts
class Reader {
  i = 0;
  bytes;
  constructor(bytes) {
    this.bytes = bytes;
  }
  num() {
    let v = 0;
    let scale = 1;
    for (;; ) {
      if (this.i >= this.bytes.length)
        throw new Error("코드가 잘렸습니다");
      const b = this.bytes[this.i++];
      v += (b & 127) * scale;
      if (b < 128)
        return v;
      scale *= 128;
    }
  }
  str() {
    const len = this.num();
    if (this.i + len > this.bytes.length)
      throw new Error("코드가 잘렸습니다");
    const s = new TextDecoder("utf-8", { fatal: true }).decode(this.bytes.subarray(this.i, this.i + len));
    this.i += len;
    return s;
  }
}
function base64UrlToBytes(code) {
  const binary = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
}
var V2 = "2";
var V3 = "3";
function readHead(code) {
  const version = code[0] === V2 ? 2 : code[0] === V3 ? 3 : null;
  if (version === null)
    return null;
  const reader = new Reader(base64UrlToBytes(code.slice(1)));
  const courseId = reader.str();
  const studentName = reader.str();
  let studentAge;
  if (version === 2)
    studentAge = reader.str();
  else {
    const a = reader.num();
    studentAge = a === 0 ? reader.str() : AGES[a - 1] ?? "";
  }
  const duration = reader.num();
  const finished = reader.num();
  const head = {
    version,
    courseId,
    studentName,
    studentAge,
    durationMs: version === 2 ? duration : duration * 1000,
    ...finished > 0 && {
      finishedAt: version === 2 ? finished * 1000 : finished * 60000
    }
  };
  return { head, reader };
}

// src/utils/linkCard.ts
function readNameAndDate(code) {
  if (code.startsWith("e")) {
    const p = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(base64UrlToBytes(code)));
    if (typeof p?.n !== "string")
      return null;
    return {
      name: p.n,
      finishedAt: typeof p.d === "number" ? p.d : undefined
    };
  }
  const read = readHead(code);
  return read && { name: read.head.studentName, finishedAt: read.head.finishedAt };
}
function linkCard(code) {
  if (!code)
    return null;
  let info;
  try {
    info = readNameAndDate(code);
  } catch {
    return null;
  }
  if (!info)
    return null;
  return cardText(info.name, info.finishedAt);
}
function cardText(name, finishedAt) {
  const date = finishedAt === undefined ? "" : `${formatCardDate(finishedAt)} `;
  return {
    title: `⭐${date}연산 테스트 리포트`,
    description: `${name} 학생의 금일 테스트 결과입니다. 클릭해 자세한 리포트를 확인해 보세요.`
  };
}
var escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function injectCard(html, card, url) {
  const title = escapeHtml(card.title);
  const description = escapeHtml(card.description);
  const meta = (attr, key, value) => (out) => out.replace(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`), `<meta ${attr}="${key}" content="${value}" />`);
  return [
    meta("property", "og:title", title),
    meta("property", "og:description", description),
    meta("name", "description", description),
    meta("property", "og:url", escapeHtml(url))
  ].reduce((out, apply) => apply(out), html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`));
}

// server/shortLink.ts
var ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
var ID_LENGTH = 6;
var CODE_PATTERN = /^[23][A-Za-z0-9_-]{8,2000}$/;
var isShortId = (id) => new RegExp(`^[A-Za-z0-9]{${ID_LENGTH}}$`).test(id);
function credentials() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token)
    throw new Error("Upstash Redis 가 연결되지 않았습니다(Vercel → Storage 에서 프로젝트에 연결)");
  return { url, token };
}
async function redis(command) {
  const { url, token } = credentials();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });
  if (!res.ok)
    throw new Error(`Upstash 오류 ${res.status}`);
  return (await res.json()).result;
}
function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
  return Array.from(bytes, (b) => ID_CHARS[b % ID_CHARS.length]).join("");
}
async function createShortLink(code) {
  if (!CODE_PATTERN.test(code))
    throw new Error("공유 코드 모양이 아닙니다");
  for (let tries = 0;tries < 5; tries++) {
    const id = randomId();
    if (await redis(["SET", `r:${id}`, code, "NX"]) === "OK")
      return id;
  }
  throw new Error("짧은 링크를 만들지 못했습니다");
}
async function resolveShortLink(id) {
  if (!isShortId(id))
    return null;
  const code = await redis(["GET", `r:${id}`]);
  return typeof code === "string" ? code : null;
}

// server/handle.ts
var json = (body, status = 200) => Response.json(body, {
  status,
  headers: { "cache-control": "no-store" }
});
async function api(request, url) {
  if (request.method === "POST") {
    let code;
    try {
      code = (await request.json()).code;
    } catch {
      return json({ error: "잘못된 요청" }, 400);
    }
    if (typeof code !== "string" || !linkCard(code))
      return json({ error: "공유 코드가 아닙니다" }, 400);
    try {
      return json({ id: await createShortLink(code) });
    } catch (e) {
      return json({ error: e.message }, 503);
    }
  }
  try {
    const code = await resolveShortLink(url.searchParams.get("id") ?? "");
    return code ? json({ code }) : json({ error: "없는 링크" }, 404);
  } catch (e) {
    return json({ error: e.message }, 503);
  }
}
async function codeOf(url) {
  const { pathname } = url;
  if (pathname.startsWith("/s/"))
    return pathname.slice("/s/".length);
  if (pathname === "/share")
    return url.searchParams.get("r") ?? "";
  if (pathname.startsWith("/r/")) {
    try {
      return await resolveShortLink(pathname.slice("/r/".length)) ?? "";
    } catch {
      return "";
    }
  }
  return "";
}
async function handle(request) {
  const url = new URL(request.url);
  if (url.pathname === "/api/share")
    return api(request, url);
  const card = linkCard(await codeOf(url));
  if (!card)
    return;
  const page = await fetch(new URL("/index.html", url.origin));
  const html = injectCard(await page.text(), card, url.href);
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate"
    }
  });
}
export {
  handle
};
