# WUPHF!

like from the office

## requirements

- an IFTTT webhook to send a notification to your phone

## setup

1. clone, cd, npm i
1. use `wrangler secret put` to set the `IFTTT_URL` and the `SECRET`
1. `wrangler publish`

## api

### authentication

if you have `SECRET` set (you should), you must authenticate. pass the header
`Authorization: Secret YOUR_SECRET`. if using a CF service binding, you can
also set `skipAuth` to `true` in the `cf` object on the request to skip auth.

### sending notifications

send a POST to https://yourworker.example/ with the following body:

```json
{
  "from": "required - a string describing the sender",
  "message": "required - the WUPHF message",
  "subject": "optional - the subject for mediums like email"
}
```

the service will respond like:

```json
{ "successes": [true, true] }
```

which shows whether each WUPHF succeeded. if none failed, the status is 200.
otherwise, it's 500.
