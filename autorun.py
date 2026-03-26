#!/usr/bin/env python3
"""
First-run setup: writes formData config to .secrets/transcribe-config.json
"""

import json
import os
import sys

def main():
    form_data = os.environ.get("AGENT_FORM_DATA")
    if not form_data:
        print("No formData provided — skipping config setup.")
        print("You can configure the transcription API key later via environment variables.")
        return

    try:
        data = json.loads(form_data)
    except json.JSONDecodeError:
        print("Warning: Could not parse AGENT_FORM_DATA as JSON.", file=sys.stderr)
        return

    secrets_dir = os.path.join(os.path.dirname(__file__), ".secrets")
    os.makedirs(secrets_dir, exist_ok=True)

    config_path = os.path.join(secrets_dir, "transcribe-config.json")
    with open(config_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Transcription config saved to {config_path}")

if __name__ == "__main__":
    main()
