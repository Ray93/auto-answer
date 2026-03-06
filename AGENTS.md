# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-05T00:02+08:00
**Commit:** 8804dd5
**Branch:** main

## OVERVIEW

Bun-based TypeScript automation tool for daily question answering on questiontest.cn platform. Uses AES-encrypted authentication and GitHub Actions for scheduled execution.

## STRUCTURE

```
.
├── index.ts          # Daily answer workflow (main entry)
├── index2.ts         # Monthly catch-up workflow
├── api/api.ts        # API client: login, fetch questions, commit answers
├── utils/utils.ts    # AES encryption, custom fetch wrapper, logging
├── types/            # TypeScript declarations (app.d.ts, global.d.ts)
└── .github/workflows/ # GitHub Actions: scheduled daily + manual monthly
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Modify API endpoints | `api/api.ts` | All endpoints hardcoded |
| Change encryption | `utils/utils.ts:27-33` | AES-CBC with Base64 key/IV |
| Add new workflow | `.github/workflows/` | Copy existing pattern |
| Update types | `types/app.d.ts` | All response interfaces |
| Debug daily execution | `index.ts` | Check login → checkComplete → getQuestion → commit |
| Debug monthly catch-up | `index2.ts` | getUnCompletDates → loop |

## CONVENTIONS

- **Runtime**: Bun (not Node.js) — uses `Bun.env`, no `package.json` scripts
- **Execution**: Direct `bun run index.ts` (no build step, tsconfig has `noEmit: true`)
- **Env vars**: ACCOUNT, PASSWORD, KEY, IV, DATE (passed via GitHub Secrets)
- **Timezone**: Asia/Shanghai (set in code via `Bun.env.TZ`)
- **Output**: Logs to console + `output.txt` file
- **Type safety**: Strict mode enabled, global `authToken` via `globalThis`

## ANTI-PATTERNS (THIS PROJECT)

- `|| true` in workflows suppresses errors — intentional for Telegram notification continuation
- No tests configured — production-only automation script
- Hardcoded API URLs in `api/api.ts` — not configurable

## UNIQUE STYLES

- **Global state**: `globalThis.authToken` for auth token sharing (not a module export)
- **Dual entry points**: `index.ts` (daily) vs `index2.ts` (monthly catch-up)
- **CI timing**: Daily at 02:30 UTC (10:30 Beijing time)
- **Telegram integration**: Manual curl in workflow, not an action

## COMMANDS

```bash
bun install           # Install dependencies
bun run index.ts      # Daily answer (uses today or DATE env)
bun run index2.ts     # Monthly catch-up (start of month to today)
```

## NOTES

- Secrets required: ACCOUNT, PASSWORD, KEY (Base64-encoded AES key), IV
- Telegram notifications require TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID secrets
- Holidays detected via API — script skips answering on rest days
- Answer format may include `//` suffix — stripped in `commitAnswer`