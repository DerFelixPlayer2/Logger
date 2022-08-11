let etag: string | undefined;
const SECONDS_10 = 10 * 1000;

export async function handleRequest(request: Request): Promise<Response> {
    if (etag && Date.now() - SECONDS_10 < parseInt(etag.slice(1, etag.length - 1)) && request.headers.get("If-None-Match") === etag) {
        return new Response(null, { status: 304 });
    }

    let cursor, list, responseString = "";
    etag = `"${new Date().valueOf().toString()}"`;

    while (!list?.list_complete) {
        list = await Logger.list({ cursor });
        responseString += list.keys.map((item) => item.metadata ? item.metadata : "<No metadata provided>").join("\n");
        responseString += "\n";
        cursor = list.cursor;
    }

    return new Response(responseString, { status: 200, headers: { "ETag": etag, "Cache-Control": "public, max-age=10000" } });
}