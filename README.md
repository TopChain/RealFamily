# Real Family

Six-page, English-first family information website. No build dependencies. Serve the directory with any static server. Main deployment: https://www.topchainfresh.com/real-family/ . Independent repository: TopChain/RealFamily.

## Features

Animated 呂 → Real Family heritage artwork; world and AI headlines with publisher links; major global index daily bars with local session dates; life-stage and sex considerations; 20 original recipes across 10 cuisines; seven illustrated English lessons with speech playback; large text mode and accessible responsive layouts.

The language selector opens Google Translate for the current page in Traditional Chinese, Simplified Chinese, Japanese, Korean or Spanish. It is an external translation service, not a bundled human-reviewed localization. Dynamic-page translation availability depends on that service.

## Updates

Run `python3 scripts/refresh.py`. GitHub Actions runs hourly at minute 17; research is refreshed once daily. Scheduled Actions can be delayed, and public-repository schedules can be disabled by GitHub after inactivity. Check workflow runs to confirm health. Previous verified data is preserved on source failures.

Google News RSS aggregates regional and AI headlines; feed relevance is not an independently verified importance/popularity ranking. Europe PMC provides recent research metadata; it is not yet AI-reviewed. Yahoo Finance chart endpoints provide best-effort daily bars and may restrict requests. Index coverage is a curated list of major benchmarks, not all existing indices or a verified top-ten market-cap ranking. Historical bars are not asserted to be official finalized exchange closes.

Technical observations are deterministic rules, clearly marked as not AI. Full constituent turnover, a dated market-cap ranking, and AI-generated analysis require additional verified data/model services. Missing data is shown as unavailable rather than fabricated. The user has requested Neon for any future database: no Supabase integration is used. Current data is published JSON and does not require a database.

The parent site serves this independent repository through an iframe at `/real-family/`, so hourly updates from this repository are visible without a cross-repository credential. The optional `PARENT_SITE_TOKEN` syncing step is unnecessary for that deployment.

## Sources & safety

Health foundations link to WHO, NIH and CDC. Food temperatures link to USDA. General health education does not individualize prescriptions. Market observations are for reference only, not investment advice. Supplied learning-card images are displayed as cropped illustrations; Chinese copy remains outside the visible image frame. The quote shown is Franklin’s *Poor Richard’s Almanack* rather than the supplied unverified Emerson attribution.
