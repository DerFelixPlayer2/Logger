type Level = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";
type Entry = {
  level: Level;
  tag: string;
  msg: string;
  timeString: string;
  timestamp: number;
}
type REntry = {
  level: Level;
  tag: string;
  msg: string;
  timestamp: number;
}

let etag: string | undefined;
const SECONDS_10 = 10 * 1000;

export async function handleRequest(request: Request): Promise<Response> {
  // last check because cloudflare keeps adding the weak thingy and idk why
  if (etag && Date.now() - SECONDS_10 < parseInt(etag.slice(1, etag.length - 1)) && (request.headers.get("If-None-Match") === etag || request.headers.get("If-None-Match") === "W/" + etag)) {
    return new Response(null, { status: 304 });
  }

  let cursor, list;
  const entries: Entry[] = [];
  etag = `"${new Date().valueOf().toString()}"`;

  while (!list?.list_complete) {
    list = await Logger.list({ cursor });
    cursor = list.cursor;

    list.keys.forEach((v) => {
      const entry = v.metadata as REntry;
      entries.push({ ...entry, timeString: formatUTCDate(new Date(entry.timestamp)) });
    });

    entries.sort((a, b) => b.timestamp - a.timestamp);
  }

  return new Response(html(entries), { status: 200, headers: { "ETag": etag, "Cache-Control": "public, max-age=10000", "Content-Type": "text/html" } });
}

function formatUTCDate(date: Date): string {
  let dstring = date.getUTCFullYear().toString() + '-';
  dstring += (date.getUTCMonth() + 1).toString().padStart(2, '0') + '-';
  dstring += date.getUTCDate().toString().padStart(2, '0') + ' ';
  dstring += date.getUTCHours().toString().padStart(2, '0') + ':';
  dstring += date.getUTCMinutes().toString().padStart(2, '0') + ':';
  dstring += date.getUTCSeconds().toString().padStart(2, '0');

  return dstring;
}

const html = (data: Entry[]): string => {
  return "INSERT HTML HERE".replace("var data = []", `var data = ${JSON.stringify(data)}`);
}