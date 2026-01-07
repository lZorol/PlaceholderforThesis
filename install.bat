@echo off
echo ==================================
echo 🚀 IPCR System Installation Script
echo ==================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python is not installed. Please install Python first.
    echo    Download from: https://www.python.org/
    pause
    exit /b 1
)

echo ✅ Node.js installed
echo ✅ Python installed
echo.

REM Install Backend
echo 📦 Installing Backend...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend installation failed
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
cd ..
echo.

REM Install Frontend
echo 📦 Installing Frontend...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend installation failed
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed
cd ..
echo.

REM Setup ML Service
echo 🤖 Setting up ML Service...
cd ml-service

REM Create virtual environment
python -m venv venv
echo ✅ Virtual environment created

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ML Service installation failed
    pause
    exit /b 1
)
echo ✅ ML Service dependencies installed
call deactivate
cd ..
echo.

echo ==================================
echo ✅ Installation Complete!
echo ==================================
echo.
echo 📝 Next Steps:
echo 1. Copy your model files to ml-service\:
echo    - hybrid_pdf_ocr_model.pt
echo    - label_map.pkl
echo.
echo 2. Run the services (in 3 separate command prompts):
echo.
echo    Command Prompt 1 (ML Service):
echo    cd ml-service
echo    venv\Scripts\activate
echo    python app.py
echo.
echo    Command Prompt 2 (Backend):
echo    cd backend
echo    node server.js
echo.
echo    Command Prompt 3 (Frontend):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open http://localhost:5173 in your browser
echo.
echo ==================================
pause