#!/usr/bin/env python3
import json, base64, urllib.request, urllib.error

TOKEN = "***"
REPO = "Ljx-maker-user/bounty-box"
headers = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json",
    "Content-Type": "application/json"
}

with open("src/lib/auth.ts", "rb") as f:
    content = base64.b64encode(f.read()).decode()

# Get current SHA
url = f"https://api.github.com/repos/{REPO}/contents/src/lib/auth.ts"
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    sha = json.loads(resp.read())["sha"]
    print(f"Current SHA: {sha[:7]}")

# Upload fix
payload = json.dumps({"message": "Fix auth.ts type assertion with unknown", "content": content, "sha": sha}).encode()
req = urllib.request.Request(url, data=payload, headers=headers, method="PUT")
with urllib.request.urlopen(req) as resp:
    result = json.loads(resp.read())
    new_sha = result["commit"]["sha"][:7]
    print(f"New SHA: {new_sha}")
    print("✓ auth.ts uploaded!")
