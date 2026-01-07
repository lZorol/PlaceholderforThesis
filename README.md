# 🎓 IPCR Management System

An AI-powered document management system for Laguna State Polytechnic University's Individual Performance Commitment and Review (IPCR) process.

## ✨ Features

- 🤖 **AI Document Classification** - Automatically categorizes uploaded PDFs using DistilBERT + ResNet-18
- 📊 **Real-time Dashboard** - Track IPCR progress with visual statistics
- 📁 **Smart Upload** - Multi-file upload with automatic processing
- 🔐 **Role-based Access** - Separate views for Professors and Admins
- 💾 **SQLite Database** - Lightweight and efficient data storage
- 📈 **Rating Calculation** - Automatic performance rating based on targets
- ☁️ **Google Drive Integration** - (Coming soon) Auto-upload to organized folders

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   React     │────▶│  Express    │────▶│   Python     │
│  Frontend   │     │   Backend   │     │ ML Service   │
│  (Port 5173)│     │ (Port 3001) │     │ (Port 5000)  │
└─────────────┘     └─────────────┘     └──────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   SQLite    │
                    │  Database   │
                    └─────────────┘
```

## 📦 Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)

### Backend
- Node.js
- Express
- SQLite3
- Multer (file upload)
- Axios

### ML Service
- Python Flask
- PyTorch
- Transformers (DistilBERT)
- Torchvision (ResNet-18)
- Tesseract OCR
- PDF2Image

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18+) - [Download](https://nodejs.org/)
2. **Python** (v3.8+) - [Download](https://www.python.org/)
3. **Tesseract OCR** - [Installation Guide](https://tesseract-ocr.github.io/tessdoc/Installation.html)

### Installation

#### Option 1: Automatic Installation (Recommended)

**On Mac/Linux:**
```bash
chmod +x install.sh
./install.sh
```

**On Windows:**
```bash
install.bat
```

#### Option 2: Manual Installation

**1. Clone/Create project structure:**
```bash
mkdir ipcr-system
cd ipcr-system
```

**2. Setup Backend:**
```bash
mkdir backend
cd backend
# Copy files: server.js, database.js, package.json, .env
npm install
cd ..
```

**3. Setup Frontend:**
```bash
mkdir frontend
cd frontend
# Copy files from frontend folder
npm install
cd ..
```

**4. Setup ML Service:**
```bash
mkdir ml-service
cd ml-service
# Copy files: app.py, classifier.py, requirements.txt
# IMPORTANT: Copy your model files here:
# - hybrid_pdf_ocr_model.pt
# - label_map.pkl

python -m venv venv
# Activate virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cd ..
```

## 🎮 Running the Application

You need **3 terminal windows**:

### Terminal 1: ML Service
```bash
cd ml-service
source venv/bin/activate  # Windows: venv\Scripts\activate
python app.py
```
✅ Should show: `🚀 Starting ML Classification Service on http://localhost:5000`

### Terminal 2: Backend
```bash
cd backend
node server.js
```
✅ Should show: `✅ Backend server running on http://localhost:3001`

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```
✅ Should show: `➜ Local: http://localhost:5173/`

### Access the Application
Open your browser: **http://localhost:5173**

## 📖 Usage Guide

### For Professors

1. **Login** - Click "Sign in with Google"
2. **View Dashboard** - See your IPCR ratings and progress
3. **Upload Documents** - Go to Upload tab, select PDFs
4. **Monitor Progress** - Check auto-categorized documents
5. **Export IPCR** - Download Excel report (coming soon)

### For Admins (Dean)

1. **Access Admin Panel** - Navigate to Admin Panel tab
2. **View Faculty Data** - See all professors' IPCR status
3. **Monitor Submissions** - Track document uploads

## 📊 Document Categories

The system automatically classifies documents into:

- **Syllabus** (Target: 4)
- **Course Guide** (Target: 4)
- **Student Learning Materials (SLM)** (Target: 10)
- **Grading Sheet** (Target: 0)
- **Table of Specifications (TOS)** (Target: 0)

## 🎯 Rating System

| Rating | Criteria |
|--------|----------|
| 5.0 | 100%+ of target achieved |
| 4.0 | 80-99% of target achieved |
| 3.0 | 60-79% of target achieved |
| 2.0 | 40-59% of target achieved |
| 1.0 | 0-39% of target achieved |

## 🗂️ Database Schema

### Users Table
- id, google_id, email, name, role, department

### Documents Table
- id, user_id, filename, category, confidence, google_drive_link

### IPCR Records Table
- id, user_id, category, target, accomplished, rating

## 🔧 Configuration

### Backend (.env)
```env
PORT=3001
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
ML_SERVICE_URL=http://localhost:5000
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User authentication |
| GET | /api/ipcr/:userId | Get IPCR data |
| POST | /api/documents/upload | Upload documents |
| GET | /api/documents/:userId | Get user documents |
| GET | /api/admin/ipcr | Get all faculty IPCR |

## 🐛 Troubleshooting

### ML Service Issues

**Problem:** Model files not found
```bash
# Solution: Copy your model files to ml-service/
cp /path/to/hybrid_pdf_ocr_model.pt ml-service/
cp /path/to/label_map.pkl ml-service/
```

**Problem:** Tesseract not found
```bash
# Mac: brew install tesseract
# Ubuntu: sudo apt-get install tesseract-ocr
# Windows: Download from GitHub and add to PATH
```

**Problem:** PDF conversion fails
```bash
# Install poppler
# Mac: brew install poppler
# Ubuntu: sudo apt-get install poppler-utils
```

### Backend Issues

**Problem:** Port 3001 already in use
```bash
# Change PORT in backend/.env
PORT=3002
```

**Problem:** Database errors
```bash
# Delete database and restart
rm backend/ipcr.db
cd backend && node server.js
```

### Frontend Issues

**Problem:** Tailwind not working
```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 🚧 Roadmap

- [x] AI Document Classification
- [x] Real-time Dashboard
- [x] Multi-file Upload
- [x] SQLite Database
- [x] Role-based Access
- [ ] Google Drive Integration
- [ ] Excel Export with Template
- [ ] Email Notifications
- [ ] Document Approval Workflow
- [ ] Advanced Analytics

## 📝 License

MIT License - feel free to use for educational purposes

## 👥 Contributors

Developed for Laguna State Polytechnic University

## 📞 Support

For issues or questions:
1. Check the SETUP_GUIDE.md
2. Review console logs
3. Verify all services are running
4. Ensure model files are present

---

**Made with ❤️ for LSPU Faculty**