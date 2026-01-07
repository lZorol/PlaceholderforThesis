# 🚀 IPCR Management System - Complete Setup Guide

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Tesseract OCR** - Required for PDF text extraction
  - Windows: [Download installer](https://github.com/UB-Mannheim/tesseract/wiki)
  - Mac: `brew install tesseract`
  - Linux: `sudo apt-get install tesseract-ocr`

## 📁 Project Structure

Create this folder structure:

```
ipcr-system/
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
└── ml-service/
    ├── app.py
    ├── classifier.py
    ├── requirements.txt
    ├── hybrid_pdf_ocr_model.pt (your model file)
    └── label_map.pkl (your label map file)
```

## 🛠️ Step-by-Step Installation

### Step 1: Create Project Folder

```bash
mkdir ipcr-system
cd ipcr-system
```

### Step 2: Setup Backend

```bash
# Create backend folder
mkdir backend
cd backend

# Copy backend files from artifacts:
# - server.js
# - database.js
# - package.json
# - .env

# Install dependencies
npm install

# Go back to root
cd ..
```

### Step 3: Setup Frontend

```bash
# Create frontend with Vite
npm create vite@latest frontend -- --template react
cd frontend

# Copy frontend files from artifacts:
# - src/App.jsx
# - package.json

# Install dependencies
npm install
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p
```

**Create/Update these files:**

**frontend/tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**frontend/src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**frontend/src/main.jsx:**
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

```bash
# Go back to root
cd ..
```

### Step 4: Setup ML Service

```bash
# Create ml-service folder
mkdir ml-service
cd ml-service

# Copy ML service files from artifacts:
# - app.py
# - classifier.py
# - requirements.txt

# IMPORTANT: Copy your trained model files here:
# - hybrid_pdf_ocr_model.pt
# - label_map.pkl

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Go back to root
cd ..
```

## 🎯 Running the Application

You need to run 3 services in separate terminals:

### Terminal 1: ML Service

```bash
cd ml-service

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Run the service
python app.py
```

You should see:
```
✅ ML Model loaded successfully
🚀 Starting ML Classification Service on http://localhost:5000
```

### Terminal 2: Backend

```bash
cd backend
node server.js
```

You should see:
```
✅ Connected to SQLite database
✅ Database tables ready
✅ Backend server running on http://localhost:3001
```

### Terminal 3: Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🌐 Access the Application

Open your browser and go to: **http://localhost:5173**

Click "Sign in with Google" to start using the system.

## ✅ Testing the System

1. **Upload a PDF document**
   - Go to "Upload Documents" tab
   - Select one or more PDF files
   - Wait for AI classification
   - Check results in the dashboard

2. **View IPCR Dashboard**
   - See your overall rating
   - Check progress for each category
   - View targets vs accomplished

3. **Check Uploaded Files**
   - All uploaded files appear in the "Upload Documents" page
   - Each file shows its category and confidence level

## ⚠️ Troubleshooting

### ML Service Issues

**Problem:** `FileNotFoundError: hybrid_pdf_ocr_model.pt`
- **Solution:** Make sure you copied your model files to `ml-service/` folder

**Problem:** `pytesseract.TesseractNotFoundError`
- **Solution:** Install Tesseract OCR and add it to your PATH

**Problem:** PDF conversion fails
- **Solution:** Install poppler-utils
  - Windows: Download from [here](https://github.com/oschwartz10612/poppler-windows/releases/)
  - Mac: `brew install poppler`
  - Linux: `sudo apt-get install poppler-utils`

### Backend Issues

**Problem:** `Cannot find module 'xyz'`
- **Solution:** Run `npm install` in the backend folder

**Problem:** Database errors
- **Solution:** Delete `ipcr.db` and restart the backend

### Frontend Issues

**Problem:** Tailwind styles not working
- **Solution:** Make sure you have:
  1. Installed Tailwind: `npm install -D tailwindcss postcss autoprefixer`
  2. Created `tailwind.config.js`
  3. Added Tailwind directives to `index.css`

**Problem:** Upload not working
- **Solution:** Check if ML service is running on port 5000

## 📝 Default Test Data

The system comes with default IPCR targets:
- Syllabus: 4
- Course Guide: 4
- SLM: 10
- Grading Sheet: 0
- TOS: 0

You can modify these in the backend code or through the API.

## 🔑 Google Drive Integration (Coming Soon)

To enable Google Drive integration:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add credentials to `backend/.env`

## 📊 Rating Formula

Current formula (can be customized):
- 5.0 = 100%+ of target
- 4.0 = 80-99% of target
- 3.0 = 60-79% of target
- 2.0 = 40-59% of target
- 1.0 = 0-39% of target

## 🎓 Next Steps

1. ✅ Test the system with sample PDFs
2. ✅ Customize IPCR targets for your needs
3. ⏳ Implement Google Drive integration
4. ⏳ Add Excel export functionality
5. ⏳ Deploy to production

## 📞 Support

If you encounter issues:
1. Check all services are running
2. Check console logs for errors
3. Ensure all dependencies are installed
4. Verify model files are in correct location

---

**🎉 You're all set! Start uploading documents and let the AI classify them automatically!**