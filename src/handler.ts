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

  await Logger.put("test", "value");

  // TODO: log to kv

  return new Response(null, { status: 204 })
}

async function validate(req: Request): Promise<Response | CheckedRequest> {
  if (req.method !== 'POST') {
    return new Response('only POST request are supported', { status: 405 })
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
    // TODO: log error to kv
    return new Response('request body is invalid', { status: 400 })
  }
}