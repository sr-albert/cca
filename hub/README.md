# Study Hub

One local app for the CCAR-F study plan and the Cert Labs mirror (CCAR-F, CCAR-P, CCDV-F, CCAO-F).

## Run

    docker compose up                          # http://localhost:8080
    docker compose --profile dev up hub-dev    # live reload, http://localhost:5173

To stamp the build's content version (commit, dirty flag) into feedback reports:

    GIT_COMMIT=$(git rev-parse --short HEAD) GIT_DIRTY=$(git status --porcelain | head -c1) docker compose up --build

Without these, the Docker build reports commit `unknown`; `npm run dev` reports `dev`.

## Feedback service

`docker compose up` also runs the feedback service (`hub/server/`), which nginx proxies at `/api/feedback`.
To send reports to Discord, create its settings from the example (the file is gitignored):

    cp hub/server/feedback.env.example hub/server/feedback.env   # then fill in DISCORD_WEBHOOK_URL and IP_HASH_SECRET

Without the file the service still runs and stores reports; Discord delivery is off and the IP hash secret is generated per start.
Reports live in the `feedback_data` volume as `reports.json`. In dev, `hub-dev` proxies `/api` to `feedback-dev`
(`npm run dev` without Docker proxies to `localhost:8787`; start the service with `npm run server`).

Without Docker:

    cd hub && npm install && npm run dev

The build reads `../mirror/exam-prep-web/learn.html` (refresh it with `mirror/update.sh`).
Without it, the hub runs with CCAR-F content only.

## Don't publish

The mirror content has no license. The extracted data (`src/data/generated/`) is gitignored,
and the Docker image contains it, so build the image locally and never push it to a registry.

## Checks

    npm test          # Vitest (runs the extractor first)
    npm run typecheck
    npm run lint
