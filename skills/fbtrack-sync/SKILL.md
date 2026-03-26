---
name: fbtrack-sync
description:
  Business conversation tracking and reporting. Syncs messages from Telegram and Slack,
  fetches Fireflies meeting transcripts, extracts structured insights via AI, and generates
  weekly partnership/business reports. Integrates with Attio CRM and Notion via Composio.
metadata:
  openclaw:
    emoji: "📈"
    requires:
      bins: ["node", "npm"]
      optional_bins: []
---

# fbtrack-sync — Business Conversation Tracker

## Overview

fbtrack is a CLI tool that syncs business conversations from multiple channels, uses AI to extract structured insights, and generates comprehensive weekly reports.

**Pipeline**: Telegram + Slack + Fireflies → AI Extraction → Merged Report → Notion + CRM

---

## Setup (First Time)

### 1. Install fbtrack

```bash
# Build fbtrack from the bundled source
cd skills/fbtrack-sync
npm install && npm run build

# Initialize directory structure
npx fbtrack init
```

### 2. Configure API Keys

Create `.env` in the fbtrack-sync directory with your credentials:

```bash
# Required for Telegram sync
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash

# Required for AI extraction
OPENAI_API_KEY=your_openai_key

# Optional: Slack sync (or use Composio)
SLACK_BOT_TOKEN=xoxb-...
SLACK_USER_TOKEN=xoxp-...

# Optional: Fireflies meeting transcripts
FIREFLIES_API_KEY=ff-...

# Optional: Attio CRM sync
ATTIO_API_KEY=your_attio_key
```

### 3. Authenticate Telegram (if using)

```bash
cd skills/fbtrack-sync
npx fbtrack login
```

### 4. Configure Chats and Mappings

Copy the example config files and customize:

```bash
cp config/chats.txt.example config/chats.txt
cp config/channel-mappings.json.example config/channel-mappings.json
cp config/crm-mappings.json.example config/crm-mappings.json
```

Edit each file with your actual chat IDs, channel names, partner-to-CRM mappings, and internal email domain.

---

## Weekly Sync Pipeline

Run these steps in order to generate a complete weekly report:

```bash
# Set working directory
cd skills/fbtrack-sync

# Load environment
set -a && . .env && set +a

# 1. Sync Telegram messages
npx fbtrack sync

# 2. Sync Slack channels (last 10 days)
npx fbtrack slack-sync --days 10

# 3. Extract partnership insights via AI
npx fbtrack extract --all --agent sales-extractor

# 4. Fetch Fireflies meetings (last 10 days)
node scripts/fetch_fireflies.cjs 10

# 5. Generate merged report
node scripts/merge_report.cjs --date-range "Mar 18 - Mar 25, 2026"
cp /tmp/merged_report.md reports/weekly-report-$(date +%Y-%m-%d).md

# 6. Update CRM latest interaction dates (optional)
node scripts/sync_attio_interactions.cjs

# 7. Sync meeting notes to CRM (optional)
node scripts/sync_attio_notes.cjs

# 8. Push report to Notion (via Composio)
# See "Push to Notion" section below
```

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `fbtrack init` | Scaffold directory structure and default configs |
| `fbtrack login` | Authenticate with Telegram via MTProto |
| `fbtrack sync` | Sync messages from tracked Telegram chats |
| `fbtrack slack-sync --days N` | Sync Slack channel messages |
| `fbtrack extract --all --agent <type>` | AI extraction of structured insights |
| `fbtrack report --weekly --agent <type>` | Generate weekly report |
| `fbtrack audit --interactive --agent <type>` | Manual quality review |

### Agent Types for Extraction

| Agent | Focus |
|-------|-------|
| `qa-extractor` | Q&A pairs, technical questions and answers |
| `sales-extractor` | Business insights, deal signals, partnership updates |
| `todo-extractor` | Action items and commitments |

---

## Push Report to Notion

After generating the weekly report, push it to Notion using Composio:

```bash
mcporter call clawdi-mcp COMPOSIO_MULTI_EXECUTE_TOOL --args "$(
  jq -Rs --arg parent '<NOTION_PARENT_PAGE_ID>' '{
    tools: [
      {
        tool_slug: "NOTION_CREATE_NOTION_PAGE",
        arguments: {
          parent_id: $parent,
          title: "Weekly Report YYYY-MM-DD",
          markdown: .
        }
      }
    ]
  }' reports/weekly-report-YYYY-MM-DD.md
)"
```

Replace `<NOTION_PARENT_PAGE_ID>` with the actual Notion page ID where reports should be stored.

---

## Scanning Scripts (for heartbeat integration)

### `scripts/scan-telegram.js`
Scans recent Telegram messages for high-priority keywords (urgent, blocker, contract, payment, etc.):
```bash
node skills/fbtrack-sync/scripts/scan-telegram.js --hours 4
```

### `scripts/scan-fireflies.js`
Reads cached Fireflies meeting data for recent partnership meetings:
```bash
node skills/fbtrack-sync/scripts/scan-fireflies.js --hours 8
```

Output: JSON with scored findings, suitable for heartbeat/cron integration.

---

## Configuration Files

| File | Purpose |
|------|---------|
| `config/chats.txt` | Telegram chats to track (one per line) |
| `config/channel-mappings.json` | Slack channel names, Telegram chat labels, Fireflies meeting→partner mappings |
| `config/crm-mappings.json` | Partner→Attio company ID mappings, internal email domain |
| `.env` | API keys (never committed) |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "config not found" | Verify `config/` files exist — copy from `.example` files |
| "session not found" | Run `fbtrack login` to authenticate Telegram |
| API key errors | Check `.env` file, source it before running |
| Slack sync fails | Verify bot/user tokens have correct scopes |
| Fireflies empty | Check API key, ensure meetings exist in date range |
