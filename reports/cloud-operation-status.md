# Real Family — cloud operation status

Updated: 2026-10-08 · PT

The website's GitHub schedules run without this computer. The complete system is not yet independent of this computer.

| Function | Current state | Remaining setup |
| --- | --- | --- |
| News and market feeds | Cloud schedule exists; refresh rules select three-hour PT slots | Monitor scheduled runs; GitHub schedules can be delayed |
| Health research and date archives | Cloud daily refresh exists | Continue preserving original sources and dates |
| Kitchen date archives | Cloud daily snapshots and curated recipe rotation | New recipes are not automatically invented every day |
| English release | Complete staged editions release on their PT date | Continuous new content and unique illustrations require an AI API |
| Subscription emails | Cloud relay code and credential-gated workflow added | One-time Gmail offline authorization and private cloud credentials |
| Ten daily PNG email attachments | Existing local authorized delivery | Extend cloud durable queue for attachments and seed prior deliveries before activation |
| Seven existing WhatsApp groups | Today's desktop delivery verified | Official cloud group access not established or verified |

## Gemini

Gemini can supply lesson text and topic-specific simple comic illustrations. A Gemini website/App subscription is different from the Developer API. Choose models and approve an API budget before activating paid generation. No paid AI generation has been enabled by this change.

## Cloud Gmail relay

The source repository contains `.github/workflows/cloud-mail.yml`. It checks every hour but does not send until all required private GitHub secrets are configured: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, MAILER_SECRET. The public endpoint is not a secret. Credentials must never be placed in source code or public reports.

The relay refreshes OAuth credentials, verifies the actual sender account, builds the subscription digest queue, claims private Neon jobs, searches Gmail Sent, and checks exact recipient and subject. Before a new send it checks that the subscriber is still active. Confirmed message IDs are recorded in the private queue. Existing sent messages are acknowledged without sending again. Ambiguous sends remain uncertain and require review rather than a blind resend. A cloud failure surfaces in GitHub Actions without printing recipients, email HTML, credentials, or provider responses.

Current implementation sends the existing subscription HTML exactly as designed. It does not yet enqueue or send the separate ten PNG attachments. Existing local delivery remains in place until a verified cloud cutover avoids duplicate writers and sends.

## Activation checklist

1. Choose Gemini Developer API account, models, and approved budget; store its key privately.
2. Implement generation, complete-edition validation, portable card rendering, retry checkpoints, and publishing into both repositories.
3. Configure Google OAuth for the original sender with send and Sent-read access; obtain offline authorization. Check application publishing status and token lifetime before relying on unattended operation.
4. Add cloud secrets; privately seed past direct deliveries and add attachment jobs before enabling the full ten-card pipeline.
5. Verify the existing WhatsApp group delivery option against official service support and account eligibility. Do not assume group names are API destination IDs.
6. Observe an end-to-end scheduled run while local delivery is disabled, then switch the desktop automation to audit/fallback only.

Do not call the system fully automatic until the above dependencies are verified. No secret or private delivery record belongs in the public repository.
