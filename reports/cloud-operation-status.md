# Real Family — cloud operation status

Updated: 2026-10-08 · PT

The website's GitHub schedules run without this computer. The complete system is not yet independent of this computer.

| Function | Current state | Remaining setup |
| --- | --- | --- |
| News and market feeds | Cloud schedule exists; refresh rules select three-hour PT slots | Monitor scheduled runs; GitHub schedules can be delayed |
| Health research and date archives | Cloud daily refresh exists | Continue preserving original sources and dates |
| Kitchen date archives | Cloud daily snapshots and curated recipe rotation | New recipes are not automatically invented every day |
| English generation and release | Free-tier text pipeline and approved program-drawn comics prepared; complete editions release on their PT date | Verify the first cloud text call and first newly authored edition; API quota failures stop generation |
| Subscription emails | Cloud relay enabled; sender, scopes and private queue verified | Observe real queued mail delivery; current queue was empty |
| Fixed ten-card email delivery | Canceled by the owner | Send email only for valid confirmed subscriptions; no fixed mailbox delivery or catch-up |
| Seven existing WhatsApp groups | Encrypted linked-device relay enabled; GitHub restored the session and verified all seven groups | First new-card cloud delivery is still to be observed; schedules can be delayed and device relinking may be needed |

## Gemini

Gemini can supply lesson text and topic-specific simple comic illustrations. A Gemini website/App subscription is different from the Developer API. Choose models and approve an API budget before activating paid generation. No paid AI generation has been enabled. On 2026-10-08 PT the owner approved simple program-drawn comics. The account’s Default Gemini Project showed Free tier with Gemini 3.1 Flash Lite limits of 15 RPM, 250K TPM and 500 RPD; native image models had zero quota. Generation uses two bounded text requests per new date, no image API, no paid fallback, and persists failure checkpoints.

## Cloud Gmail relay

The source repository contains the enabled `.github/workflows/cloud-mail.yml`. It checks hourly for confirmations and retries, with additional 7:30 AM PT runs. The API prevents digest creation, claiming and sending before 7:30 AM PT; daylight-saving changes are handled automatically. GitHub schedules may be delayed. Required private GitHub secrets are configured: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, MAILER_SECRET. The public endpoint is not a secret. Credentials must never be placed in source code or public reports.

The relay refreshes OAuth credentials, verifies the actual sender account, builds the subscription digest queue, claims private Neon jobs, searches Gmail Sent, and checks exact recipient and subject. Before a new send it checks that the subscriber is still active. Confirmed message IDs are recorded in the private queue. Existing sent messages are acknowledged without sending again. Ambiguous sends remain uncertain and require review rather than a blind resend. A cloud failure surfaces in GitHub Actions without printing recipients, email HTML, credentials, or provider responses.

Current implementation sends the existing subscription HTML exactly as designed. The owner canceled fixed daily ten-PNG delivery on 2026-10-08 PT. No fixed mailbox delivery or catch-up should run. Subscription confirmation and valid confirmed subscriber digests remain enabled.

## Activation checklist

1. Free-tier account and Gemini 3.1 Flash Lite verified; do not activate billing or paid models.
2. Generation, editorial review, complete-edition validation, portable rendering, request checkpoints and parent-site source sync prepared. Verify the first real cloud call and a newly authored date before claiming end-to-end generation success.
3. Completed: Google OAuth is in production; sender, send/read scopes and offline credentials were verified in cloud.
4. Fixed daily ten-card email was canceled by the owner. Only valid confirmed subscriptions qualify for email delivery.
5. Completed: owner approved and linked the nonofficial cloud device; encrypted routes use verified group IDs. Observe the first new-card delivery and relink on failure.
6. Observe an end-to-end scheduled run while local delivery is disabled, then switch the desktop automation to audit/fallback only.

Do not call the system fully automatic until the above dependencies are verified. No secret or private delivery record belongs in the public repository.

## WhatsApp cloud cutover — 2026-10-08 PT

The user accepted the nonofficial linked-device approach. AES-256-GCM encrypts session files and group routes in Neon; the encryption key is held in GitHub Secrets. The owner linked the phone once. The chosen Vocabulary group was explicitly confirmed as the one created on 2022-02-22; the 2023 group was renamed Essay and was not selected. No group IDs, phone identifiers or session secrets are published.

GitHub verification run 37884379896 restored the cloud session and verified all seven selected groups with zero cards sent. WHATSAPP_CLOUD_ENABLED is true. Schedules cover both Pacific UTC offsets; the program gates sends until 7:30 AM PT and prevents duplicate lesson IDs. The startup validates all ten PNG files before claiming deliveries. Previous verified desktop lesson IDs are reserved without inventing WhatsApp server message IDs. An ambiguous attempt is blocked from blind retry. GitHub schedules are best effort; the relay is not an exact-time guarantee. Continuous lesson generation is still a separate dependency.

Full cloud workflow run 37884482229 also completed successfully after enabling the relay; today’s ten reserved lesson IDs were skipped. No duplicate cards were sent during cutover.
