#!/usr/bin/env node
/**
 * First-run setup:
 * 1. Writes formData config to .secrets/transcribe-config.json
 * 2. Installs yt-dlp if not available (needed for TikTok, Instagram, X video download)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function setupFormData() {
  const formData = process.env.AGENT_FORM_DATA;
  if (!formData) {
    console.log('No formData provided — skipping config setup.');
    return;
  }

  let data;
  try {
    data = JSON.parse(formData);
  } catch (e) {
    console.error('Warning: Could not parse AGENT_FORM_DATA as JSON.');
    return;
  }

  const secretsDir = path.join(__dirname, '.secrets');
  fs.mkdirSync(secretsDir, { recursive: true });

  const configPath = path.join(secretsDir, 'transcribe-config.json');
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
  console.log(`Transcription config saved to ${configPath}`);
}

function ensureDeps() {
  // Install yt-dlp if missing (needed for TikTok, Instagram, X, etc.)
  try {
    execSync('which yt-dlp', { stdio: 'ignore' });
  } catch {
    console.log('Installing yt-dlp...');
    try {
      execSync('apt-get update -qq && apt-get install -y -qq yt-dlp 2>/dev/null || pip3 install -q yt-dlp 2>/dev/null || true', {
        stdio: 'inherit',
        timeout: 120000,
      });
      console.log('yt-dlp installed.');
    } catch (e) {
      console.log('Warning: Could not install yt-dlp. Online video download may not work.');
    }
  }
}

setupFormData();
ensureDeps();
