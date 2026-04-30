#!/usr/bin/env python3
"""
Backfill Beehiiv custom fields (ad_campaign, ad_creative) from Supabase UTM data.
Only updates subs that have UTM in Supabase but are missing custom fields in Beehiiv.
"""

import requests
import json
import time
import os

API_KEY = "McVENKziZPPcXB5fNUU3mNZTJBYMzEiOyDOEDwkqyOkqBPUhGprvSOk3CSvrPqAz"
PUB_TV = "pub_6c3bff32-b1eb-4069-919e-953a45d61d61"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}
BASE = "https://api.beehiiv.com/v2"


def get_supabase_utm():
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
    sb_url = ""
    sb_key = ""
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("NEXT_PUBLIC_SUPABASE_URL="):
                    sb_url = line.split("=", 1)[1]
                elif line.startswith("NEXT_PUBLIC_SUPABASE_ANON_KEY="):
                    sb_key = line.split("=", 1)[1]

    resp = requests.get(
        f"{sb_url}/rest/v1/subscribers",
        headers={"apikey": sb_key, "Authorization": f"Bearer {sb_key}"},
        params={
            "select": "email,utm_source,utm_medium,utm_campaign,utm_content",
            "limit": 10000,
        },
    )
    rows = resp.json()
    # Only keep subs with real UTM data
    result = {}
    for r in rows:
        email = r.get("email", "")
        campaign = r.get("utm_campaign") or ""
        content = r.get("utm_content") or ""
        if email and campaign and campaign != "{{campaign.name}}" and content != "{{ad.name}}":
            result[email] = r
    print(f"Supabase: {len(result)} subs with valid UTM data")
    return result


def get_all_beehiiv_subs():
    """Get all Beehiiv subs with custom_fields to find who's missing."""
    subs = {}
    page = 1
    while True:
        resp = requests.get(
            f"{BASE}/publications/{PUB_TV}/subscriptions",
            headers=HEADERS,
            params={"limit": 100, "page": page, "status": "active", "expand[]": "custom_fields"},
        )
        if resp.status_code != 200:
            print(f"Error {resp.status_code}")
            break
        data = resp.json()
        batch = data.get("data", [])
        if not batch:
            break
        for s in batch:
            email = s.get("email", "")
            cf = s.get("custom_fields", [])
            has_ad_fields = any(f.get("name") in ("ad_campaign", "ad_creative") for f in cf)
            subs[email] = {
                "id": s.get("id"),
                "has_ad_fields": has_ad_fields,
            }
        print(f"  Beehiiv page {page}: {len(subs)} total")
        if len(batch) < 100:
            break
        page += 1
        time.sleep(0.3)
    
    has = sum(1 for s in subs.values() if s["has_ad_fields"])
    missing = sum(1 for s in subs.values() if not s["has_ad_fields"])
    print(f"Beehiiv: {has} have custom fields, {missing} missing")
    return subs


def update_subscriber(sub_id, email, campaign, creative):
    """Update a Beehiiv subscriber with custom fields."""
    custom_fields = []
    if campaign:
        custom_fields.append({"name": "ad_campaign", "value": campaign})
    if creative:
        custom_fields.append({"name": "ad_creative", "value": creative})

    if not custom_fields:
        return False

    resp = requests.patch(
        f"{BASE}/publications/{PUB_TV}/subscriptions/{sub_id}",
        headers=HEADERS,
        json={"custom_fields": custom_fields},
    )
    if resp.status_code == 200:
        return True
    else:
        print(f"  FAILED {email}: {resp.status_code} {resp.text[:100]}")
        return False


def main():
    print("=== Step 1: Pull Supabase UTM data ===")
    supabase_utm = get_supabase_utm()

    print("\n=== Step 2: Pull Beehiiv subscribers ===")
    beehiiv_subs = get_all_beehiiv_subs()

    # Find subs that need updating: have UTM in Supabase but missing custom fields in Beehiiv
    to_update = []
    for email, utm_data in supabase_utm.items():
        bh = beehiiv_subs.get(email)
        if bh and not bh["has_ad_fields"]:
            to_update.append({
                "sub_id": bh["id"],
                "email": email,
                "campaign": utm_data.get("utm_campaign", ""),
                "creative": utm_data.get("utm_content", ""),
            })

    print(f"\n=== Step 3: Backfill {len(to_update)} subscribers ===")
    
    if not to_update:
        print("Nothing to backfill!")
        return

    # Show preview
    for t in to_update[:5]:
        print(f"  {t['email']} → campaign: {t['campaign']} | creative: {t['creative']}")
    if len(to_update) > 5:
        print(f"  ... and {len(to_update) - 5} more")

    # Execute
    success = 0
    failed = 0
    for i, t in enumerate(to_update):
        ok = update_subscriber(t["sub_id"], t["email"], t["campaign"], t["creative"])
        if ok:
            success += 1
            print(f"  [{i+1}/{len(to_update)}] ✓ {t['email']}")
        else:
            failed += 1
        time.sleep(0.3)  # Rate limit

    print(f"\n=== DONE ===")
    print(f"  Updated: {success}")
    print(f"  Failed: {failed}")
    print(f"  Total with custom fields now: {sum(1 for s in beehiiv_subs.values() if s['has_ad_fields']) + success}")


if __name__ == "__main__":
    main()
