#!/usr/bin/env node
/**
 * First-run setup: writes formData config to .secrets/transcribe-config.json
 */

const fs = require('fs');
const path = require('path');

function main() {
  const formData = process.env.AGENT_FORM_DATA;
  if (!formData) {
    console.log('No formData provided — skipping config setup.');
    console.log('You can configure the transcription API key later via environment variables.');
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

main();
