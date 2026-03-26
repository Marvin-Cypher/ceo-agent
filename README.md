# CEO Agent

Executive AI assistant combining content intelligence with business conversation tracking. Designed for founders, executives, and business leaders who need to stay on top of everything.

## Capabilities

### Content Summarization
Summarize any content type with structured reports and mind maps:
- **Audio/Video**: mp3, wav, m4a, mp4, mov, mkv (transcription → summary)
- **Online Video**: YouTube, TikTok, Instagram Reels, X/Twitter, and any yt-dlp URL
- **Documents**: PDF, images (OCR/vision), web pages, text files
- **Auto-detection**: Meeting, Interview, Lecture, Podcast, or General — tailored output

### Business Conversation Tracking (fbtrack)
- Sync Telegram and Slack conversations
- Fetch Fireflies meeting transcripts
- AI-powered insight extraction (deals, action items, Q&A)
- Weekly merged reports across all channels
- CRM sync (Attio) for interaction dates and meeting notes
- Push reports to Notion

### Composio Integrations (20+ Tools)

| Category | Supported Tools |
|----------|----------------|
| **Meeting Transcripts** | Zoom, Google Meet, Microsoft Teams, Fathom, Fireflies |
| **CRM** | HubSpot, Salesforce, Pipedrive, Attio, Zoho CRM |
| **Project Management** | Linear, Jira, Asana, Monday.com, ClickUp, Trello |
| **Productivity** | Gmail, Google Calendar, Google Drive, Notion, Slack |

Users connect their preferred tools in the Clawdi dashboard — the agent auto-detects what's available.

## Quick Start

1. Install via Clawdi's 1-click install
2. Chat with the agent — it will introduce itself and learn about you
3. Send content to summarize, or ask it to run a weekly business sync

## Requirements

- Python 3 (for summarization)
- Node.js + npm (for fbtrack)
- OpenClaw platform login
- Optional: ffmpeg, yt-dlp, Fireflies API key, Telegram API credentials

## Output Examples

| File | Description |
|------|-------------|
| `*-summary-final.md` | Structured summary report |
| `*-mindmap.png` | Mind map visualization |
| `weekly-report-*.md` | Merged weekly business report |
