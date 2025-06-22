@echo off
echo Creating Firefox Extension Package...
echo.

REM Create a temporary directory for packaging
if exist "firefox-tts-extension" rmdir /s /q "firefox-tts-extension"
mkdir "firefox-tts-extension"

REM Copy extension files
copy "manifest.json" "firefox-tts-extension\"
copy "content.js" "firefox-tts-extension\"
copy "background.js" "firefox-tts-extension\"
copy "popup.html" "firefox-tts-extension\"
copy "popup.js" "firefox-tts-extension\"
copy "config.js" "firefox-tts-extension\"

echo Extension files copied to firefox-tts-extension folder.
echo.
echo To install:
echo 1. Open Firefox and go to about:debugging
echo 2. Click "This Firefox"
echo 3. Click "Load Temporary Add-on..."
echo 4. Select manifest.json from the firefox-tts-extension folder
echo.
echo Zipping extension files into .xpi...
cd firefox-tts-extension
zip -r ..\firefox-tts-extension.xpi .
cd ..
echo.
echo Cleaning up temporary directory...
rmdir /s /q "firefox-tts-extension"
echo.
echo Firefox Extension Package created: firefox-tts-extension.xpi
echo.
echo For permanent installation, drag and drop firefox-tts-extension.xpi into Firefox.
echo.
pause