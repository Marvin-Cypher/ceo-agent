# Content Summarizer Agent

Intelligent summarizer supporting 8 input types: audio, video, online videos, PDF, images, web pages, and text documents. Generates structured Markdown reports and mind map PNGs.

**Supports**: YouTube, TikTok, Instagram Reels, X/Twitter, Bilibili, and any yt-dlp compatible URL.

## Quick Start

1. Install the agent via Clawdi's 1-click install
2. Optionally configure a transcription API key (or use OpenClaw platform credentials)
3. Send any content — audio file, video URL, PDF, image, web link, or text — and get a structured summary

## How It Works

```
Input → Detect Type → Transcribe/Read → Scenario Recognition → Analysis Report
    → Agent: Structured Summary → Mind Map PNG → Final Output
```

### Supported Inputs

| Type | Examples |
|------|----------|
| Audio | mp3, wav, m4a, flac, ogg |
| Video | mp4, mov, mkv, webm |
| Online Video | YouTube, TikTok, Instagram, X URLs |
| PDF | .pdf files |
| Images | jpg, png, webp |
| Web Pages | Any URL |
| Text | txt, md, docx |

### Scenario Detection

Automatically classifies content as: Meeting, Interview, Lecture, Podcast, or General — then tailors the summary structure accordingly.

## Requirements

- Python 3
- OpenClaw platform login (for built-in transcription API)
- `ffmpeg` (optional — for video format conversion)
- `yt-dlp` (optional — for online video/audio downloads)

## Output

| File | Description |
|------|-------------|
| `*-transcript.txt` | Raw transcription |
| `*-summary.md` | Analysis report with scenario guidance |
| `*-summary-final.md` | Agent-generated final summary |
| `*-mindmap.md` | Mind map source (Markdown outline) |
| `*-mindmap.png` | Mind map visualization |
