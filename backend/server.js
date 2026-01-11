const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const path = require('path');
const db = require('./database');
const authRoutes = require('./routes/auth');
const GoogleDriveService = require('./utils/googleDrive');
require('dotenv').config();

console.log('🔍 Checking environment variables:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Loaded' : '❌ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
fs.ensureDirSync('uploads');

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Get IPCR data
app.get('/api/ipcr/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT category, target, accomplished, rating, submission_date, completion_date, remarks
    FROM ipcr_records
    WHERE user_id = ?
  `;
  
  db.all(query, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const ipcrData = {
      syllabus: { target: 4, accomplished: 0, submitted: null },
      courseGuide: { target: 4, accomplished: 0, submitted: null },
      slm: { target: 10, accomplished: 0, submitted: null },
      gradingSheet: { target: 0, accomplished: 0, submitted: null },
      tos: { target: 0, accomplished: 0, submitted: null }
    };
    
    rows.forEach(row => {
      const categoryMap = {
        'Syllabus': 'syllabus',
        'Course Guide': 'courseGuide',
        'SLM': 'slm',
        'Grading Sheet': 'gradingSheet',
        'TOS': 'tos'
      };
      const key = categoryMap[row.category];
      if (key) {
        ipcrData[key] = {
          target: row.target,
          accomplished: row.accomplished,
          submitted: row.submission_date
        };
      }
    });
    
    res.json(ipcrData);
  });
});

// Set IPCR targets
app.post('/api/ipcr/targets', (req, res) => {
  const { userId, targets } = req.body;
  
  const categoryMap = {
    'syllabus': 'Syllabus',
    'courseGuide': 'Course Guide',
    'slm': 'SLM',
    'gradingSheet': 'Grading Sheet',
    'tos': 'TOS'
  };
  
  Object.entries(targets).forEach(([key, value]) => {
    const category = categoryMap[key];
    const query = `
      INSERT INTO ipcr_records (user_id, category, target, accomplished)
      VALUES (?, ?, ?, 0)
      ON CONFLICT(user_id, category, academic_year, semester) 
      DO UPDATE SET target = ?
    `;
    db.run(query, [userId, category, value, value]);
  });
  
  res.json({ success: true });
});

// Upload documents with Google Drive integration
app.post('/api/documents/upload', upload.array('files'), async (req, res) => {
  try {
    const { userId, tokens } = req.body;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Parse tokens if it's a string
    let userTokens = null;
    if (tokens) {
      userTokens = typeof tokens === 'string' ? JSON.parse(tokens) : tokens;
    }

    const results = [];

    for (const file of files) {
      try {
        console.log(`\n📄 Processing: ${file.originalname}`);

        // Send to ML service for classification
        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.path), {
          filename: file.originalname,
          contentType: 'application/pdf'
        });

        const mlResponse = await axios.post('http://localhost:5000/classify', formData, {
          headers: formData.getHeaders(),
          timeout: 60000
        });

        const { category, confidence } = mlResponse.data;
        console.log(`✅ Classification: ${category} (${confidence.toFixed(2)}% confidence)`);

        // Upload to Google Drive if tokens are available
        let driveResult = null;
        if (userTokens) {
          try {
            const driveService = new GoogleDriveService(userTokens);
            driveResult = await driveService.uploadFile(
              file.path,
              file.originalname,
              category
            );
          } catch (driveError) {
            console.error('⚠️ Google Drive upload failed:', driveError.message);
            // Continue without Drive upload
          }
        }

        // Use Drive link or create mock link
        const driveId = driveResult ? driveResult.fileId : Math.random().toString(36).substring(7);
        const driveLink = driveResult ? driveResult.webViewLink : `https://drive.google.com/file/d/${driveId}`;

        // Save to database
        const insertDocQuery = `
          INSERT INTO documents (user_id, filename, original_filename, file_size, category, confidence, google_drive_id, google_drive_link)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertDocQuery, [userId, file.filename, file.originalname, file.size, category, confidence, driveId, driveLink]);

        // Update IPCR records
        const updateQuery = `
          INSERT INTO ipcr_records (user_id, category, target, accomplished, submission_date)
          VALUES (?, ?, 0, 1, DATE('now'))
          ON CONFLICT(user_id, category, academic_year, semester) DO UPDATE SET
          accomplished = accomplished + 1,
          submission_date = DATE('now')
        `;

        db.run(updateQuery, [userId, category]);

        results.push({
          filename: file.originalname,
          category,
          confidence,
          driveLink,
          driveUploaded: !!driveResult
        });

        // Clean up uploaded file
        await fs.remove(file.path);
      } catch (fileError) {
        console.error(`❌ Error processing ${file.originalname}:`, fileError.message);
        // Clean up on error
        if (fs.existsSync(file.path)) {
          await fs.remove(file.path);
        }
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get uploaded documents
app.get('/api/documents/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT id, original_filename as name, file_size as size, category, confidence, 
           google_drive_link as driveLink, upload_date as uploadDate, status
    FROM documents
    WHERE user_id = ?
    ORDER BY upload_date DESC
  `;
  
  db.all(query, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Admin: Get all users' IPCR
app.get('/api/admin/ipcr', (req, res) => {
  const query = `
    SELECT 
      u.id, u.name, u.department, u.email,
      COUNT(DISTINCT d.id) as document_count,
      (SELECT AVG(
        CASE 
          WHEN ir.target = 0 THEN 0
          WHEN ir.accomplished >= ir.target THEN 5
          WHEN ir.accomplished >= ir.target * 0.8 THEN 4
          WHEN ir.accomplished >= ir.target * 0.6 THEN 3
          WHEN ir.accomplished >= ir.target * 0.4 THEN 2
          ELSE 1
        END
      ) FROM ipcr_records ir WHERE ir.user_id = u.id AND ir.target > 0) as avg_rating
    FROM users u
    LEFT JOIN documents d ON u.id = d.user_id
    LEFT JOIN ipcr_records ir ON u.id = ir.user_id
    WHERE u.role = 'professor'
    GROUP BY u.id
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔐 Google OAuth configured: ${!!process.env.GOOGLE_CLIENT_ID}`);
});