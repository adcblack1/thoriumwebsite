#!/usr/bin/env python3
"""
Export every subscriber with:
- Beehiiv engagement data (emails sent, opened, clicked, open rate, CTR)
- Supabase UTM data (utm_source, utm_medium, utm_campaign, utm_content)
Joined by email. Output as CSV.
"""

import requests
import json
import csv
import time
import os

# Beehiiv
API_KEY = "McVENKziZPPcXB5fNUU3mNZTJBYMzEiOyDOEDwkqyOkqBPUhGprvSOk3CSvrPqAz"
PUBS = {
    "thorium_valley": "pub_6c3bff32-b1eb-4069-919e-953a45d61d61",
    "catalyst": "pub_fa376b28-d99e-4ef0-8788-26e9db50b70f",
    "lab": "pub_c248791e-d935-4c60-bbf5-efde481bbd69",
}
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}
BASE = "https://api.beehiiv.com/v2"

# Supabase
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://iyaypvpkozntojbasjuh.supabase.co")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")


def get_all_beehiiv_subs(pub_id, pub_label):
    """Pull all active subscribers with stats from a Beehiiv publication."""
    subs = []
    page = 1
    while True:
        resp = requests.get(
            f"{BASE}/publications/{pub_id}/subscriptions",
            headers=HEADERS,
            params={"limit": 100, "page": page, "status": "active", "expand[]": "stats"},
        )
        if resp.status_code == 429:
            print(f"  [{pub_label}] Rate limited, waiting...")
            time.sleep(5)
            continue
        if resp.status_code != 200:
            print(f"  [{pub_label}] Error {resp.status_code}")
            break

        data = resp.json()
        batch = data.get("data", [])
        if not batch:
            break
        subs.extend(batch)
        print(f"  [{pub_label}] Page {page}: {len(subs)}/{data.get('total_results', '?')}")
        if len(batch) < 100:
            break
        page += 1
        time.sleep(0.3)
    return subs


def get_supabase_utm():
    """Pull UTM data for all subscribers from Supabase."""
    # Read the key from .env.local
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
    sb_url = SUPABASE_URL
    sb_key = SUPABASE_KEY

    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("NEXT_PUBLIC_SUPABASE_URL="):
                    sb_url = line.split("=", 1)[1]
                elif line.startswith("NEXT_PUBLIC_SUPABASE_ANON_KEY="):
                    sb_key = line.split("=", 1)[1]

    print(f"\n  Pulling UTM data from Supabase...")
    resp = requests.get(
        f"{sb_url}/rest/v1/subscribers",
        headers={
            "apikey": sb_key,
            "Authorization": f"Bearer {sb_key}",
        },
        params={
            "select": "email,utm_source,utm_medium,utm_campaign,utm_content,completed,created_at,seniority,job_function,industry,company_size",
            "limit": 10000,
        },
    )
    if resp.status_code != 200:
        print(f"  Supabase error {resp.status_code}: {resp.text[:200]}")
        return {}

    rows = resp.json()
    print(f"  Got {len(rows)} subscribers from Supabase")
    # Index by email
    return {r["email"]: r for r in rows if r.get("email")}


def main():
    # 1. Pull Supabase UTM data
    utm_by_email = get_supabase_utm()

    # 2. Pull Beehiiv engagement data for all 3 pubs
    beehiiv_data = {}
    for label, pub_id in PUBS.items():
        print(f"\nPulling Beehiiv: {label}")
        subs = get_all_beehiiv_subs(pub_id, label)
        for s in subs:
            email = s.get("email", "")
            if not email:
                continue
            stats = s.get("stats") or {}
            if email not in beehiiv_data:
                beehiiv_data[email] = {
                    "email": email,
                    "beehiiv_created": s.get("created", ""),
                }
            beehiiv_data[email][f"{label}_status"] = s.get("status", "")
            beehiiv_data[email][f"{label}_sent"] = stats.get("total_sent", 0) or 0
            beehiiv_data[email][f"{label}_received"] = stats.get("total_received", 0) or 0
            beehiiv_data[email][f"{label}_opened"] = stats.get("total_unique_opened", 0) or 0
            beehiiv_data[email][f"{label}_clicked"] = stats.get("total_unique_clicked", 0) or 0
            beehiiv_data[email][f"{label}_open_rate"] = stats.get("open_rate", 0) or 0
            beehiiv_data[email][f"{label}_click_rate"] = stats.get("click_rate", 0) or 0

    # 3. Merge with Supabase UTM
    rows = []
    for email, bh in beehiiv_data.items():
        sb = utm_by_email.get(email, {})
        row = {
            "email": email,
            # Supabase UTM
            "utm_source": sb.get("utm_source", ""),
            "utm_medium": sb.get("utm_medium", ""),
            "utm_campaign": sb.get("utm_campaign", ""),
            "utm_content": sb.get("utm_content", ""),
            "survey_completed": sb.get("completed", False),
            "signup_date": sb.get("created_at", ""),
            "seniority": sb.get("seniority", ""),
            "job_function": sb.get("job_function", ""),
            "industry": sb.get("industry", ""),
            "company_size": sb.get("company_size", ""),
        }
        # Add all beehiiv columns
        for key in ["beehiiv_created"]:
            row[key] = bh.get(key, "")
        for pub_label in PUBS.keys():
            for metric in ["status", "sent", "received", "opened", "clicked", "open_rate", "click_rate"]:
                col = f"{pub_label}_{metric}"
                row[col] = bh.get(col, "")
        rows.append(row)

    # 4. Write CSV
    if not rows:
        print("No data to export!")
        return

    fieldnames = list(rows[0].keys())
    out_path = "subscriber_export.csv"
    with open(out_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    # Also JSON
    with open("subscriber_export.json", "w") as f:
        json.dump(rows, f, indent=2, default=str)

    print(f"\n{'='*60}")
    print(f"EXPORTED {len(rows)} subscribers to {out_path}")
    print(f"{'='*60}")

    # Quick summary
    has_utm = [r for r in rows if r["utm_campaign"] or r["utm_content"]]
    no_utm = len(rows) - len(has_utm)
    print(f"  With ad UTM data: {len(has_utm)}")
    print(f"  Without UTM (organic/direct): {no_utm}")

    # Per-pub summary for ad cohort
    if has_utm:
        for pub_label in PUBS.keys():
            active = [r for r in has_utm if r.get(f"{pub_label}_status") == "active"]
            if active:
                sent = sum(r[f"{pub_label}_sent"] for r in active if r[f"{pub_label}_sent"])
                opened = sum(r[f"{pub_label}_opened"] for r in active if r[f"{pub_label}_opened"])
                clicked = sum(r[f"{pub_label}_clicked"] for r in active if r[f"{pub_label}_clicked"])
                o_rate = (opened / sent * 100) if sent > 0 else 0
                c_rate = (clicked / sent * 100) if sent > 0 else 0
                print(f"\n  {pub_label} (ad cohort: {len(active)} subs)")
                print(f"    Emails sent: {sent} | Opened: {opened} | Clicked: {clicked}")
                print(f"    Open Rate: {o_rate:.1f}% | CTR: {c_rate:.1f}%")


if __name__ == "__main__":
    main()
