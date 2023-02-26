import wuphfEmail from "./wuphers/email";
import wuphfNotifyPhone from "./wuphers/notifyPhone";

const WUPHERS = [
	wuphfEmail,
	wuphfNotifyPhone,
]

export interface Env {
	IFTTT_URL: string,
	TO_EMAIL: string,
	FROM_EMAIL: string,
	SECRET: string,
}

type WuphfRequest = {
	from?: string,
	message?: string,
	subject?: string,
};

export default {
	async fetch(
		request: Request,
		env: Env,
		_: ExecutionContext
	): Promise<Response> {
		if (request.method !== "POST") return status(405);
		if (
			env.SECRET && 
			request.headers.get("Authorization") != `Secret ${env.SECRET}` &&

			// allow other workers that use WUPHF via service binding to send
			// { cf: { skipAuth: true } } to not have to authenticate.  http
			// clients cannot spoof this 
			!((request.cf as any) as { skipAuth: boolean }).skipAuth
		) return status(401);

		const { from, message, subject }: WuphfRequest = await request.json();

		if (
			!from || 
			!message || 
			typeof from !== "string" ||
			typeof message !== "string" ||
			(subject && typeof subject !== "string")
		) return status(400);

		const results = await Promise.allSettled(
			WUPHERS.map(
				wuphf => wuphf(
					env, 
					from, 
					message, 
					subject ? subject : `WUPHF from ${from}`,
				)
			)
		);

		let failed = false;
		let successes: boolean[] = [];

		for (const resultIdx in results) {
			// for some reason resultIdx is a string version of the int?
			const i = parseInt(resultIdx);

			const result = results[i];

			if (result.status === "rejected") {
				failed = true;

				const errorMsg = `WUPHFer ${i} failed: ${result.reason}`;
				console.error(errorMsg);

				const wupher = i === 0 ? WUPHERS[1] : WUPHERS[0];

				// try to more directly alert of error
				await wupher(env, "WUPHF System", errorMsg, "WUPHF Failure");

				successes.push(false);
			} else {
				successes.push(true);
			}
		}

		return new Response(
			JSON.stringify({ successes }),
			{
				status: failed ? 500 : 200
			}
		);
	},
};

function status(status: number): Response {
	return new Response(null, { status });
}
