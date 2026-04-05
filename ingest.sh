#!/bin/bash
set -e

SRC="/Users/alexchun/Downloads/Thorium Valley Website/MARCH 29 CONTENT"
DST="/Users/alexchun/Downloads/Thorium Valley Website/thorium-valley/public/thumbnails"
BANNER_SRC="/Users/alexchun/Downloads/Main Thumnails/t10.png"

echo "Step 2a: Copying banner..."
cp "$BANNER_SRC" "$DST/banner-2026-03-29.png"
echo "  ✓ banner-2026-03-29.png"

echo "Step 2a: Copying article thumbnails..."
cp "$SRC/thumbnail_1_vA.png" "$DST/a-leaked-model-name-crashed-an-entire-sector.png"
echo "  ✓ a-leaked-model-name-crashed-an-entire-sector.png"
cp "$SRC/thumbnail_2_vA.png" "$DST/every-person-who-built-xai-has-left.png"
echo "  ✓ every-person-who-built-xai-has-left.png"
cp "$SRC/thumbnail_3_vA.png" "$DST/google-wants-you-to-dump-chatgpt-and-made-it-easy.png"
echo "  ✓ google-wants-you-to-dump-chatgpt-and-made-it-easy.png"

echo "Step 2a-ii: Copying kicker images..."
cp "$SRC/kickers/2026-03-29_kicker_unsplash.jpg" "$DST/kicker-2026-03-29-real.jpg"
echo "  ✓ kicker-2026-03-29-real.jpg"
cp "$SRC/kickers/Gemini_Generated_Image_1prb131prb131prb.jpeg" "$DST/kicker-2026-03-29-ai.jpeg"
echo "  ✓ kicker-2026-03-29-ai.jpeg"

echo ""
echo "✅ All assets copied successfully!"
