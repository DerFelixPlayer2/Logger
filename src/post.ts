type Level = "debug" | "info" | "warn" | "error" | "fatal";
interface UncheckedRequest {
  level?: unknown,
  tag?: unknown,
  msg?: unknown
}
interface CheckedRequest {
  level: Level,
  tag: string,
  msg: string
}

export async function handleRequest(request: Request): Promise<Response> {
  const validity = await validate(request);
  if (validity instanceof Response) {
    return validity;
  }

  const { level, tag, msg } = validity;
  await log(level, tag, msg);

  return new Response(null, { status: 204 })
}

async function validate(req: Request): Promise<Response | CheckedRequest> {
  if (req.method !== 'POST') {
    return new Response('only POST request are supported', { status: 405, headers: { 'Allow': 'POST, GET' } });
  }

  if (!req.body) {
    return new Response('request body is empty', { status: 400 })
  }

  try {
    const body: UncheckedRequest | null = await req.json();
    if (!body) {
      return new Response('request body is empty', { status: 400 })
    }

    if (!body.level || typeof body.level !== "string") {
      return new Response('property "level" in "body" is missing or invalid', { status: 400 })
    } else {
      if (!["debug", "info", "warn", "error", "fatal"].includes(body.level)) {
        return new Response('property "level" in "body" is invalid', { status: 400 })
      }
    }

    if (!body.tag || typeof body.tag !== "string") {
      return new Response('property "tag" in "body" is missing or invalid', { status: 400 })
    }

    if (!body.msg || typeof body.msg !== "string") {
      return new Response('property "msg" in "body" is missing or invalid', { status: 400 })
    }

    return {
      level: body.level as Level,
      tag: body.tag as string,
      msg: body.msg as string
    };
  } catch (error) {
    console.error(error);
    const msg = (error as Error)?.message || typeof error === 'string' ? error as string : "" || (error as any).toString();
    await log("error", "LOGGER/validate", msg, (error as Error)?.stack);
    return new Response('request body is invalid', { status: 400 })
  }
}

async function log(level: Level, tag: string, msg: string, stacktrace?: string | undefined): Promise<void> {
  try {
    const date = new Date();
    console.log(date)
    await Logger.put(date.valueOf().toString(), JSON.stringify({
      level,
      tag,
      msg,
      stacktrace,
      timestamp: date.valueOf(),
      full_message: `[${formatUTCDate(date)}] [${level.toUpperCase()}]: [${tag}] ${msg}`
    }), { metadata: `[${formatUTCDate(date)}] [${level.toUpperCase()}]: [${tag}] ${msg}` });
  } catch (error) {
    console.error(error);
  }
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