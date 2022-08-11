export async function handleRequest(): Promise<Response> {
    let cursor: string | undefined, list, responseString = "";
    while (!list?.list_complete) {
        list = await Logger.list({ cursor });
        responseString += list.keys.map(item => item.metadata ? item.metadata : "<No metadata provided>").join("\n");
        responseString += "\n";
        cursor = list.cursor;
    }
    return new Response(responseString, { status: 200 });
}