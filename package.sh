#!/bin/bash

echo "Creating Firefox Extension Package..."
echo ""

# Create a temporary directory for packaging
TEMP_DIR="firefox-tts-extension"
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi
mkdir "$TEMP_DIR"

# Copy extension files
cp "manifest.json" "$TEMP_DIR/"
cp "content.js" "$TEMP_DIR/"
cp "background.js" "$TEMP_DIR/"
cp "popup.html" "$TEMP_DIR/"
cp "popup.js" "$TEMP_DIR/"
cp "config.js" "$TEMP_DIR/"

echo "Extension files copied to $TEMP_DIR folder."
echo ""

echo "Zipping extension files into .xpi..."
web-ext sign --source-dir "$TEMP_DIR" --artifacts-dir . --api-key="$AMO_JWT_ISSUER" --api-secret="$AMO_JWT_SECRET" --channel=unlisted

echo ""
echo "Cleaning up temporary directory..."
rm -rf "$TEMP_DIR"
echo ""

echo "Firefox Extension Package created: firefox-tts-extension.xpi"
echo ""
echo "For permanent installation on Firefox:"
echo "1. Open Firefox."
echo "2. Drag and drop 'firefox-tts-extension.xpi' into any open Firefox window."
echo "3. Confirm installation when prompted."
echo ""