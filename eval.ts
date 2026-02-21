import { UTApi } from "uploadthing/server";

async function test() {
    let apiKey = process.env.UPLOADTHING_SECRET;
    let appId = process.env.UPLOADTHING_APP_ID;
    if (!apiKey && process.env.UPLOADTHING_TOKEN) {
        try {
            const decoded = Buffer.from(process.env.UPLOADTHING_TOKEN, "base64").toString("utf-8");
            const parsed = JSON.parse(decoded);
            apiKey = parsed.apiKey;
            appId = parsed.appId;
        } catch (e) {
            // Fallback or ignore
        }
    }

    // Uploadthing v6 might require these in env or constructor
    process.env.UPLOADTHING_SECRET = apiKey;
    process.env.UPLOADTHING_APP_ID = appId;
    console.log("API KEY:", apiKey?.slice(0, 10));
    console.log("APP ID:", appId);

    const utapi = new UTApi({ apiKey });
    const file = new File(["test content"], "hello.txt", { type: "text/plain" });
    try {
        const response = await utapi.uploadFiles([file]);
        console.log("UPLOAD RESPONSE:", response);
    } catch (err: any) {
        console.log("UPLOAD ERROR:", err.message);
        if (err.cause) console.log("CAUSE:", err.cause);
        if (err.error) console.log("ERR:", err.error);
        const stringified = JSON.stringify(err, null, 2);
        console.log("JSON:", stringified);
    }
}

test();
