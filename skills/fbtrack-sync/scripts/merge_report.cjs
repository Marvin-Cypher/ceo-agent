// Merge Telegram, Slack, and Fireflies data into a weekly report
// Usage: node scripts/merge_report.cjs --date-range "Mar 18 - Mar 25, 2026"
//
// Reads:
//   - data/extractions/ (fbtrack extract output)
//   - /tmp/fireflies_recent.json (from fetch_fireflies.cjs)
//   - config/channel-mappings.json (partner groupings)
//
// Output: /tmp/merged_report.md

const fs = require('fs');
const path = require('path');

// Parse CLI args
let dateRange = 'This Week';
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--date-range' && process.argv[i + 1]) {
    dateRange = process.argv[i + 1];
    i++;
  }
}

// Load channel mappings config
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'channel-mappings.json');
let channelConfig = { slack_channels: {}, telegram_chats: {}, fireflies_meeting_mappings: {} };
try {
  channelConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (e) {
  console.warn('No channel-mappings.json found. Using raw channel/meeting names.');
}

// Load CRM mappings for partner grouping
const CRM_CONFIG_PATH = path.join(__dirname, '..', 'config', 'crm-mappings.json');
let crmConfig = { fireflies_to_company: {} };
try {
  crmConfig = JSON.parse(fs.readFileSync(CRM_CONFIG_PATH, 'utf8'));
} catch (e) {
  // OK - CRM config is optional
}

// Load extraction data
const DATA_DIR = path.join(__dirname, '..', 'data', 'extractions');
let extractions = [];
try {
  if (fs.existsSync(DATA_DIR)) {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
        if (Array.isArray(data)) {
          extractions.push(...data);
        } else {
          extractions.push(data);
        }
      } catch (e) {
        console.warn(`Skipping malformed extraction file: ${file}`);
      }
    }
  }
} catch (e) {
  console.warn('No extraction data found.');
}

// Load Fireflies data
let meetings = [];
try {
  const ffPath = '/tmp/fireflies_recent.json';
  if (fs.existsSync(ffPath)) {
    meetings = JSON.parse(fs.readFileSync(ffPath, 'utf8'));
  }
} catch (e) {
  console.warn('No Fireflies data found.');
}

// Group meetings by partner using config mappings
function getMeetingPartner(meeting) {
  const title = meeting.title || '';
  // Check fireflies_meeting_mappings
  for (const [pattern, partner] of Object.entries(channelConfig.fireflies_meeting_mappings || {})) {
    if (title.toLowerCase().includes(pattern.toLowerCase())) {
      return partner;
    }
  }
  // Check fireflies_to_company from CRM config
  for (const [pattern, company] of Object.entries(crmConfig.fireflies_to_company || {})) {
    if (title.toLowerCase().includes(pattern.toLowerCase())) {
      return company;
    }
  }
  return null;
}

// Build report
const lines = [];
lines.push(`# Weekly Business Report`);
lines.push(`**Period**: ${dateRange}`);
lines.push(`**Generated**: ${new Date().toISOString().split('T')[0]}`);
lines.push('');

// Section 1: Meeting Summary
const partnerMeetings = meetings.filter(m => m.isPartnership);
const internalMeetings = meetings.filter(m => m.isInternal);

lines.push(`## Meetings Overview`);
lines.push(`- **Total meetings**: ${meetings.length}`);
lines.push(`- **Partnership meetings**: ${partnerMeetings.length}`);
lines.push(`- **Internal meetings**: ${internalMeetings.length}`);
lines.push('');

if (partnerMeetings.length > 0) {
  lines.push(`### Partnership Meetings`);
  lines.push('');

  // Group by partner
  const grouped = {};
  for (const m of partnerMeetings) {
    const partner = getMeetingPartner(m) || 'Other';
    if (!grouped[partner]) grouped[partner] = [];
    grouped[partner].push(m);
  }

  for (const [partner, mList] of Object.entries(grouped)) {
    lines.push(`#### ${partner}`);
    for (const m of mList) {
      lines.push(`- **${m.title}** (${m.dateStr})`);
      if (m.overview) lines.push(`  - ${m.overview.substring(0, 200)}${m.overview.length > 200 ? '...' : ''}`);
      if (m.action_items) lines.push(`  - Action items: ${m.action_items.substring(0, 200)}${m.action_items.length > 200 ? '...' : ''}`);
    }
    lines.push('');
  }
}

// Section 2: Conversation Insights (from extractions)
if (extractions.length > 0) {
  lines.push(`## Conversation Insights`);
  lines.push(`- **Total extracted insights**: ${extractions.length}`);
  lines.push('');

  // Group by source/chat
  const bySource = {};
  for (const e of extractions) {
    const source = e.chatTitle || e.source || 'Unknown';
    if (!bySource[source]) bySource[source] = [];
    bySource[source].push(e);
  }

  for (const [source, items] of Object.entries(bySource)) {
    lines.push(`### ${source}`);
    for (const item of items.slice(0, 10)) {
      if (item.summary) lines.push(`- ${item.summary}`);
      if (item.insight) lines.push(`- ${item.insight}`);
      if (item.action) lines.push(`  - **Action**: ${item.action}`);
    }
    if (items.length > 10) lines.push(`- ... and ${items.length - 10} more`);
    lines.push('');
  }
}

// Section 3: Action Items
lines.push(`## Action Items`);
lines.push('');
lines.push('| Owner | Action | Source | Due |');
lines.push('|-------|--------|--------|-----|');

// Extract action items from meetings
for (const m of partnerMeetings) {
  if (m.action_items) {
    const items = m.action_items.split('\n').filter(l => l.trim());
    for (const item of items.slice(0, 3)) {
      lines.push(`| TBD | ${item.trim().substring(0, 80)} | ${m.title} | - |`);
    }
  }
}

// Extract action items from conversation insights
for (const e of extractions) {
  if (e.action) {
    lines.push(`| TBD | ${e.action.substring(0, 80)} | ${e.chatTitle || 'Chat'} | - |`);
  }
}

lines.push('');
lines.push('---');
lines.push('*Report generated by fbtrack*');

const report = lines.join('\n');
const outPath = '/tmp/merged_report.md';
fs.writeFileSync(outPath, report);
console.log(`Report written to ${outPath}`);
console.log(`Meetings: ${meetings.length}, Extractions: ${extractions.length}`);
