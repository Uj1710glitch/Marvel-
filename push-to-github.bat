@echo off
setlocal
echo ========================================================
echo  🚀 Push Marvel Omniverse Nexus to GitHub
echo ========================================================
echo.
echo Make sure you have created a public repository on https://github.com/new
echo Example URL: https://github.com/your-username/marvel-nexus.git
echo.
set "DEFAULT_URL=https://github.com/Uj1710glitch/Marvel-.git"
echo Default repository: %DEFAULT_URL%
set /p REPO_URL="Enter your GitHub Repository URL (or press ENTER to use default): "

if "%REPO_URL%"=="" (
    set "REPO_URL=%DEFAULT_URL%"
)

echo.
echo [1/3] Setting default branch to main...
"C:\Program Files\Git\cmd\git.exe" branch -M main

echo [2/3] Adding remote origin...
"C:\Program Files\Git\cmd\git.exe" remote remove origin 2>nul
"C:\Program Files\Git\cmd\git.exe" remote add origin %REPO_URL%

echo [3/3] Pushing code to GitHub...
"C:\Program Files\Git\cmd\git.exe" push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo  ✅ SUCCESS! Code pushed to GitHub!
    echo ========================================================
    echo.
    echo Next step to make it a live public website:
    echo 1. Go to your GitHub repository in your browser
    echo 2. Click Settings -^> Pages (on the left menu)
    echo 3. Under Branch, select 'main' and '/ (root)'
    echo 4. Click Save!
    echo.
    echo Your website will be live in 1-2 minutes!
) else (
    echo.
    echo [ERROR] Push failed. Please check your GitHub URL and credentials.
)

echo.
pause
