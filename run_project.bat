@echo off
TITLE Explainable AI Zero-Day Cyber Attack Detection Framework
echo ==================================================================
echo   EXPLAINABLE AI-BASED FRAMEWORK FOR DETECTING ZERO-DAY ATTACKS
echo ==================================================================
echo.

set PATH=C:\Users\aadar\AppData\Local\Programs\node-full\node-v20.18.0-win-x64;%PATH%

if not exist venv (
    echo [*] Creating Python Virtual Environment...
    python -m venv venv
)

echo [*] Verifying Python Dependencies...
call venv\Scripts\activate.bat
pip install -r backend\requirements.txt > nul

if not exist backend\models\random_forest.joblib (
    echo [*] Models not found. Generating sample data and training ML pipeline...
    python train.py
)

echo.
echo [+] Starting FastAPI Backend Server on http://127.0.0.1:8000 ...
start "Backend API Server" cmd /k "venv\Scripts\activate.bat && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --app-dir backend"

echo [+] Starting React Frontend Server on http://localhost:5173 ...
start "React Frontend App" cmd /k "cd frontend && npm run dev"

echo.
echo ==================================================================
echo [+] Application launched successfully!
echo     - API Documentation : http://127.0.0.1:8000/docs
echo     - Web Interface     : http://localhost:5173
echo ==================================================================
pause
