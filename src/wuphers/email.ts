import { Env } from "..";

export default async function wuphfEmail(
	env: Env, 
	from: string, 
	message: string, 
	subject: string,
) {
	const resp = await fetch('https://api.mailchannels.net/tx/v1/send', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			personalizations: [
				{
					to: [{ email: env.TO_EMAIL, name: env.TO_EMAIL }],
				},
			],
			from: {
				email: env.FROM_EMAIL,
				name: `${from} via WUPHF`,
			},
			subject,
			content: [
				{
					type: 'text/plain',
					value: message,
				},
			],
		}),
	});

	if (!resp.ok) {
		console.log("FAILED TO SEND REQUEST TO MAILCHANNELS:", await resp.text());
	}
}
