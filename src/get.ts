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

    entries.sort((a, b) => b.timeString.localeCompare(a.timeString));
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
      <div class="row header">
        <div class="header-time-wrapper">
          <p class="header-time">Timestamp</p>
        </div>
        <div class="header-tag-wrapper">
          <p class="header-tag">Tag</p>
        </div>
        <div class="header-type-wrapper">
          <p class="header-type">Type</p>
        </div>
        <div class="header-msg-wrapper">
          <p class="header-msg">Message</p>
        </div>
      </div>
    </section>
  </body>
  <script>
    const data = ${JSON.stringify(data)};

    const log = document.getElementById('log')
    data.forEach((v) => {
      const div = document.createElement('div')
      div.innerHTML = \`
        <div class="time-wrapper"><p class="time">\${ v.timeString }</p></div>
        <div class="tag-wrapper"><p class="tag">\${ v.tag }</p></div>
        <div class="type-wrapper1"><div class="type-wrapper2 \${v.level.toLowerCase()}"><p class="type">\${ v.level }</p></div></div>
        <div class="msg-wrapper"><p class="msg">\${ v.msg }</p></div>
      \`
      div.classList.add('row')
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

      --c-t-debug: rgb(142, 140, 140);
      --c-t-info: rgb(107, 181, 181);
      --c-t-warn: rgb(247, 190, 87);
      --c-t-error: rgb(195, 106, 106);
      --c-t-fatal: rgb(255, 96, 96);
    }

    body {
      width: 97%;
      height: 100%;

      background-color: var(--c-background);
      font-size: 17px;
    }

    #log {
      height: 100%;
      width: inherit;

      margin: 1rem;

      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
    }

    .time {
      color: var(--c-text-entry);
    }

    .tag {
      color: var(--c-text-entry);
    }

    .type {
      color: var(--c-text-header);
      margin: 0;
    }

    .msg {
      color: var(--c-text-entry);
    }

    .time-wrapper {
      flex-basis: 17%;
    }

    .tag-wrapper {
      flex-basis: 20%;
    }

    .type-wrapper1 {
      flex-basis: 13%;
    }

    .type-wrapper2 {
      display: block;
      width: min-content;

      padding: 3px 15px;
      border-radius: 100vw;
    }

    .msg-wrapper {
      flex-basis: 50%;
    }

    .header-time-wrapper {
      flex-basis: 17%;
    }

    .header-tag-wrapper {
      flex-basis: 20%;
    }

    .header-type-wrapper {
      flex-basis: 13%;
    }

    .header-msg-wrapper {
      flex-basis: 50%;
    }

    .header-time {
      color: var(--c-text-header);
    }

    .header-tag {
      color: var(--c-text-header);
    }

    .header-type {
      color: var(--c-text-header);
    }

    .header-msg {
      color: var(--c-text-header);
    }

    .header {
      width: calc(100% + 4px) !important;
      background-color: var(--c-header-background);
      border: unset !important;
    }

    .row {
      width: 100%;

      padding: 0 10px;

      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;

      align-items: center;

      border: 2px solid var(--c-border);
      border-top: unset;
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