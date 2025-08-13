@echo off
echo Starting Screw Dimension App...

REM Activate virtual environment
call .venv\Scripts\activate.bat

REM Start the server
echo Server starting at http://localhost:8000
uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause