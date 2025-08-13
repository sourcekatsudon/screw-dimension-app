@echo off
echo Setting up Screw Dimension App environment...

REM Check if uv is installed
where uv >nul 2>&1
if %errorlevel% neq 0 (
    echo UV is not installed. Please install UV first.
    echo Visit: https://github.com/astral-sh/uv
    pause
    exit /b 1
)

REM Create virtual environment using uv
echo Creating virtual environment...
uv venv

REM Install dependencies
echo Installing dependencies...
uv pip install fastapi uvicorn

echo Setup complete!
pause