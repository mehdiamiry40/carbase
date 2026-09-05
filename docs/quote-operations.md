# Quote delivery operations

Operational ownership belongs to the Carbase quote-inbox operator. The project administrator maintains Vercel configuration and the deployment gate. Confirm who is covering the inbox and incident notifications before handing operations to another person; repository access alone does not establish that coverage.

## Production prerequisites

- Production uses its private Sydney Blob store. Preview uses a separate private store; never attach the production store to preview tests.
- Keep `RESEND_API_KEY` and the sender/destination on the server. Provider acceptance is not proof of final mailbox delivery; check provider delivery/bounce status when reconciling a missing email.
- Publish an enforcing `quote-submit` Firewall SDK rule before setting production `QUOTE_RATE_LIMIT_MODE=enforce`. A direct `POST /api/quote` rate-limit rule adds an independent edge control. Preserve the published IP/window thresholds unless traffic evidence supports a change.
- Set `QUOTE_OUTBOX_RECOVERY_MODE=live` only after isolated staging, retry, duplicate-identity and accepted-cleanup checks. Recovery never automatically resends an unknown outcome.
- A nonempty `CRON_SECRET` authorizes the scheduled worker. Keep the ten-minute schedule, 60-second worker limit and Sydney function overrides.

## Delivery states and action

| State | Automatic behavior | Operator action |
| --- | --- | --- |
| `staged` | Recoverable after 15 minutes, allowing the original request to finish | Investigate if it persists beyond two later scheduled runs |
| `delivery_unavailable` / `delivery_rejected` | Retry when due in live mode, up to the configured attempt limit | Check configuration/provider availability if retries continue |
| `sending` | Exclusive attempt lease; late definite results can reconcile only their own attempt | Do not manually resend a live lease |
| `accepted_cleanup_pending` | Write acceptance receipt and delete full payload without sending again | Investigate recurring cleanup failures |
| `delivery_unknown` | Retain; emit `quote.outbox.manual_review`; never blind-resend | Establish the provider outcome before any manual action |
| `dead_letter` | Retain; emit manual-review event with `max_attempts` reason | Resolve the rejection and review before any retry |

Quote POST returns 200 only for provider acceptance, or 202 for confirmed private persistence. An arbitrary 2xx response is not a receipt. Mandatory staging failure returns 503 with no email attempt. Retries of unchanged details must use the same browser submission ID.

## Health and incident handling

1. Inspect production logs for `/api/cron/quote-outbox`. The worker should run approximately every ten minutes. Treat two missing intervals as an investigation trigger. A manual invocation verifies the handler, not the natural schedule.
2. Investigate a cron 503 and `quote.outbox.delivery_failed`, `quote.outbox.list_failed`, checkpoint failures, `quote.backup.*_failed` and other error-level quote events. The cron status covers attempted provider/storage failures; a successful scan can still contain manual-review work.
3. Investigate every `quote.outbox.manual_review` and `quote.outbox.invalid` event. Use the non-personal submission ID to locate the exact private record. Do not export customer/photo data into tickets, shared logs or public artifacts.
4. Confirm whether the provider accepted the exact attempt. Resend keys are retained for 24 hours, so a retry outside that period must not rely on provider deduplication alone. Do not replace an unknown state with a retry state simply to make an error disappear.
5. Before any manual state change, verify the submission ID, payload digest, attempt identity, existing provider outcome and current ETag. Do not edit Blob JSON by unconditional overwrite. Escalate to the project maintainer when conditional reconciliation is required.
6. Confirm the configured inbox can receive the accepted message and that any bounce is addressed. Assign an incident to the on-duty inbox operator; do not assume a log event itself sends a notification.

Configure the team's existing monitoring/notification system to alert on missed cron runs, cron 503s and the error events above. Validate the destination with its owner. This repository provides health status and sanitized events; it does not create or silently choose an external messaging destination.

## Retention

Outbox records are scheduled to expire 30 days after receipt by default; configured periods are constrained to 1–30 days. Receipts are scheduled to expire after seven days. Subsequent successful scans conditionally delete expired objects, including in observe mode. Outages, backlog or storage failures can delay removal; the expiry field is not a Blob storage TTL.

Investigate recurring failed/invalid scans and verify that an expired synthetic fixture is removed in isolated storage. Customer email copies have a separate retention policy and are not removed by Blob cleanup. Do not promise a strict maximum wall-clock deletion period unless an independently verified control enforces it.

## Release verification and rollback

`vercel.json` requires `npm run verify:deployment`. Unit tests, types, lint, the production build and browser tests must all succeed before Vercel publishes. The browser server clears provider credentials and tests intercept quote delivery. The browser package is a dev dependency used only in Linux builds.

Before a production release:

1. Run the full local checks and review the diff. Confirm a preview build passes the deployment gate.
2. Verify stored receipt semantics, failed staging, duplicate submissions, delayed photos, keyboard flow, short-screen navigation, deadline/lease races and terminal-state health checks.
3. Verify the real Blob SDK against isolated preview storage using only synthetic data. For a provider test, use an explicitly approved test destination; never use a customer address.
4. Verify enforcing preview rate limits with bounded invalid requests that cannot create leads. Confirm production rule/app settings together before rollout.
5. After release, read back the deployed commit, build gate results, function settings and production HTML. Observe a natural cron run with the intended recovery mode. Check for errors and retained/manual-review work.

For rollback, return the domain to the previous known-good deployment while retaining all private outbox objects and receipts. Never empty storage. If recovery behavior is uncertain, pause sending with `observe` while keeping cleanup behavior in mind. Preserve Firewall protection and configuration secrets. Revalidate the previous deployment against current record schema and attempt fields before relying on it. An emergency rollback is a controlled maintainer action, not a substitute for the normal verification gate.
