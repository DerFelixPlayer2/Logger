type Level = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";
type Entry = {
    level: Level;
    tag: string;
    msg: string;
    timeString: string;
}

let etag: string | undefined;
const SECONDS_10 = 10 * 1000;

export async function handleRequest(request: Request): Promise<Response> {
    if (etag && Date.now() - SECONDS_10 < parseInt(etag.slice(1, etag.length - 1)) && request.headers.get("If-None-Match") === etag) {
        return new Response(null, { status: 304 });
    }

    let cursor, list;
    const entries: Entry[] = [];
    etag = `"${new Date().valueOf().toString()}"`;

    while (!list?.list_complete) {
        list = await Logger.list({ cursor });
        cursor = list.cursor;

        list.keys.forEach((v) => {
            const s = (v.metadata as string).split("]");
            entries.push({
                timeString: s[0].slice(1),
                level: s[1].slice(2) as Level,
                tag: s[2].slice(3),
                msg: s[3].slice(1),
            });
        });
    }

    return new Response(html(entries), { status: 200, headers: { "ETag": etag, "Cache-Control": "public, max-age=10000", "Content-Type": "text/html" } });
}

const html = (data: Entry[]) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Log</title>
  </head>
  <body>
    <section id="log">
      <div>
        <p class="time">Timestamp</p>
        <p class="tag">Tag</p>
        <p class="type">Type</p>
        <p class="msg">Message</p>
      </div>
    </section>
  </body>
  <script>
    const data = ${JSON.stringify(data)}

    const log = document.getElementById('log')
    data.forEach((v) => {
      const div = document.createElement('div')
      div.innerHTML = \`
        <p class="time" > \${ v.timestamp } </p>
        <p class="tag" > \${ v.tag } </p>
        <p class="type \${v.type.toLowerCase()}" > \${v.type} </p>
        <p class="msg" > \${ v.message } </p>
      \`
      log.appendChild(div)
    })
  </script>
  <style>
    :root {
      --c-background: #fff;
      --c-border: rgb(211, 211, 211);
      --c-header-background: #666;
      --c-text-header: var(--c-background);
      --c-text-entry: var(--c-header-background);

      --c-t-debug: #0f0;
      --c-t-info: #00f;
      --c-t-warn: #f90;
      --c-t-error: #f00;
      --c-t-fatal: #f00;
    }

    body {
      background-color: var(--c-background);

      margin: 10px;
    }

    #log {
      width: 100%;
      padding: 10px;

      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;

      border-left: 2px solid var(--c-border);
      border-right: 2px solid var(--c-border);
    }

    #log > div {
      width: 100%;

      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      flex-grow: 0;
      flex-shrink: 0;

      border-bottom: 2px solid var(--c-border);
    }

    #log > div > p {
      color: var(--c-text-entry);
    }

    #log > :nth-child(1) {
      background-color: var(--c-header-background);
    }

    #log > :nth-child(1) > p {
      color: var(--c-text-header);
    }

    .tag,
    .type,
    .time {
      flex-basis: 16.666%;
    }

    .msg {
      flex-basis: 50%;
    }

    .type {
      border-radius: 100vw;
      color: var(--c-text-header);
      text-transform: uppercase;
    }

    .debug {
      background-color: var(--c-t-debug);
    }

    .info {
      background-color: var(--c-t-info);
    }

    .warn {
      background-color: var(--c-t-warn);
      color: var(--c-text-entry);
    }

    .error {
      background-color: var(--c-t-error);
    }

    .fatal {
      background-color: var(--c-t-fatal);
    }
  </style>
</html>

`