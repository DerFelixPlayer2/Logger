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
    let bodyString = "";
    const decoder = new TextDecoder();
    await chunkStream(req.body, 8192, (chunk, chunkSize) => {
      bodyString += decoder.decode(chunk.subarray(0, chunkSize));
    });
    const body = JSON.parse(bodyString) as UncheckedRequest;

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
    const msg = (error as Error)?.message || typeof error === 'string' ? error as string : "" || (error as any).toString() || "";
    await log("error", "LOGGER/validate", msg);
    return new Response('request body is invalid', { status: 400 })
  }
}

async function log(level: Level, tag: string, msg: string): Promise<void> {
  try {
    const date = new Date();
    await Logger.put(date.valueOf().toString(), JSON.stringify({ tag, msg }), {
      metadata: {
        level, tag: ellipsis(tag, 35), msg: ellipsis(msg, 130), timestamp: date.valueOf()
      }
    });
  } catch (error) {
    console.error(error);
  }
}

function ellipsis(str: string, max: number): string {
  if (str.length <= max) {
    return str;
  }

  return str.substring(0, max) + '...';
}

async function chunkStream(stream: ReadableStream, CHUNK_SIZE: number, callback: (chunk: Uint8Array, chunkSize: number) => void) {
  const reader = stream.getReader();
  const chunk = new Uint8Array(CHUNK_SIZE);
  let result: ReadableStreamReaderReadResult, chunkIndex = 0;

  do {
    result = await reader.read();
    if (result.value) {
      chunk.set(result.value, chunkIndex);
      chunkIndex += result.value.length;
    }
    if (result.done || chunkIndex === CHUNK_SIZE) {
      callback(chunk, chunkIndex);
      chunkIndex = 0;
    }
  } while (!result.done);
}