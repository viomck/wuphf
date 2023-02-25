import { Env } from "..";

export default async function wuphfNotifyPhone(env: Env, from: string, message: string) {
    console.log(message);

    const resp = await fetch(
        env.IFTTT_URL,
        {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            // this api is hilarious
            body: JSON.stringify({
                value1: `You have a WUPHF from ${from}: ${message}`,
            })
        }
    );

    if (!resp.ok) {
        console.error("FAILED TO SEND TO IFTTT: " + await resp.text());
    }
}
