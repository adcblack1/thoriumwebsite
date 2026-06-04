#!/usr/bin/env python3
"""
Split a newsletter HTML export into 4 Beehiiv-ready chunks.

Chunk 1: Banner only
Chunk 2: TOC + intro + poll + Article 1
Chunk 3: Article 2
Chunk 4: Article 3 + games + links + footer (everything else)

Usage:
  python3 split-newsletter.py <type>
  
  type: main | catalyst | lab | vibe3

Outputs: <type>_chunk1.html through <type>_chunk4.html
"""

import sys, json, re, urllib.request, os

BASE = "http://localhost:3000"
VIBE3_BASE = "http://localhost:3001"

def fetch_html(nl_type: str) -> str:
    """Fetch the full HTML from the appropriate API."""
    if nl_type == "main":
        url = f"{BASE}/api/beehiiv-export?slug=may-29-2026"
    elif nl_type == "catalyst":
        url = f"{BASE}/api/beehiiv-export?catalyst=true"
    elif nl_type == "lab":
        url = f"{BASE}/api/beehiiv-export?lab=true"
    elif nl_type == "vibe3":
        url = f"{VIBE3_BASE}/api/beehiiv-export"
    else:
        print(f"Unknown type: {nl_type}"); sys.exit(1)
    
    try:
        resp = urllib.request.urlopen(url, timeout=30)
        data = json.loads(resp.read())
        if "error" in data:
            print(f"API error: {data['error']}"); sys.exit(1)
        return data["html"]
    except Exception as e:
        print(f"Failed to fetch: {e}"); sys.exit(1)


def split_html(html: str, nl_type: str) -> list[str]:
    """Split HTML into 4 chunks."""
    
    # The wrapper div
    wrapper_open = html[:html.index('>') + 1]  # <div style="max-width:780px;...">
    wrapper_close = "\n</div>"
    
    # Find the banner div end — it's the first child div (padding:0 25px)
    # Banner ends right before the TOC header div
    banner_pattern = r'(<div style="padding:0 25px[^"]*;text-align:center;">[\s\S]*?</div>\n)'
    banner_match = re.search(banner_pattern, html)
    
    if not banner_match:
        # Try alternate banner pattern
        banner_pattern = r'(<div style="padding:0[^"]*;text-align:center;">[\s\S]*?</div>\n)'
        banner_match = re.search(banner_pattern, html)
    
    if not banner_match:
        print("Could not find banner div"); sys.exit(1)
    
    banner_end = banner_match.end()
    banner_html = html[len(wrapper_open):banner_end].strip()
    
    # Everything after banner
    rest = html[banner_end:]
    
    # Find article card boundaries — they start with <div style="border:1px solid #CDCDCD
    card_pattern = r'<div style="border:1px solid #CDCDCD;border-radius:10px;'
    
    # Find all card start positions in `rest`
    card_starts = [m.start() for m in re.finditer(re.escape(card_pattern), rest)]
    
    if len(card_starts) < 2:
        print(f"Found only {len(card_starts)} article cards, need at least 2")
        # If only 1 card or none, do best effort
        if len(card_starts) == 0:
            return [
                wrapper_open + "\n" + banner_html + wrapper_close,
                wrapper_open + "\n" + rest.strip() + wrapper_close,
                "",
                ""
            ]
    
    # For each card, find its closing </div> — cards are nested, so we need to count div depth
    def find_card_end(text: str, start: int) -> int:
        """Find the end of an article card div (matching closing tag)."""
        depth = 0
        i = start
        while i < len(text):
            if text[i:i+4] == '<div':
                depth += 1
                i += 4
            elif text[i:i+6] == '</div>':
                depth -= 1
                if depth == 0:
                    return i + 6
                i += 6
            else:
                i += 1
        return len(text)
    
    # Find end of each card
    card_ends = [find_card_end(rest, s) for s in card_starts]
    
    if len(card_starts) >= 3:
        # Normal 3-article case
        before_cards = rest[:card_starts[0]]
        card1 = rest[card_starts[0]:card_ends[0]]
        card2 = rest[card_starts[1]:card_ends[1]]
        after_card2 = rest[card_ends[1]:]  # card 3 + games + links + footer
        
        chunk1 = wrapper_open + "\n" + banner_html + wrapper_close
        chunk2 = wrapper_open + "\n" + before_cards.strip() + "\n" + card1.strip() + wrapper_close
        chunk3 = wrapper_open + "\n" + card2.strip() + wrapper_close
        chunk4 = wrapper_open + "\n" + after_card2.strip() + wrapper_close
    elif len(card_starts) == 2:
        before_cards = rest[:card_starts[0]]
        card1 = rest[card_starts[0]:card_ends[0]]
        after_card1 = rest[card_ends[0]:]
        
        chunk1 = wrapper_open + "\n" + banner_html + wrapper_close
        chunk2 = wrapper_open + "\n" + before_cards.strip() + "\n" + card1.strip() + wrapper_close
        chunk3 = wrapper_open + "\n" + after_card1.strip() + wrapper_close
        chunk4 = ""
    else:
        chunk1 = wrapper_open + "\n" + banner_html + wrapper_close
        chunk2 = wrapper_open + "\n" + rest.strip() + wrapper_close
        chunk3 = ""
        chunk4 = ""
    
    return [chunk1, chunk2, chunk3, chunk4]


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 split-newsletter.py <main|catalyst|lab|vibe3>")
        sys.exit(1)
    
    nl_type = sys.argv[1].lower()
    print(f"Fetching {nl_type} newsletter...")
    html = fetch_html(nl_type)
    print(f"  Full HTML: {len(html)} bytes")
    
    chunks = split_html(html, nl_type)
    
    for i, chunk in enumerate(chunks, 1):
        if not chunk:
            print(f"  Chunk {i}: (empty)")
            continue
        fname = f"{nl_type}_chunk{i}.html"
        with open(fname, 'w') as f:
            f.write(chunk)
        print(f"  Chunk {i}: {len(chunk):,} bytes → {fname}")
    
    print("✅ Done")


if __name__ == "__main__":
    main()
