@echo off
echo ========================================================
echo  🦸 Launching Marvel Omniverse Nexus Live Preview...
echo ========================================================
echo.
echo Starting local web server at http://localhost:8000
echo Opening your web browser...
start http://localhost:8000
python -m http.server 8000
pause
