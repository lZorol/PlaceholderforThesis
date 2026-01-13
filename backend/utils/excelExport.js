const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const templatePath = path.join(__dirname, 'Template.xlsx');

// Cell mapping: These must match the sheet names and cell locations in your Template.xlsx
const CELL_MAPPING = {
  'Syllabus': 'C19',
  'Course Guide': 'C20',
  'SLM': 'C21',
  'TOS': 'C30',
  'Grading Sheet': 'C34'
};

/**
 * Export IPCR data by filling an existing template
 */
async function exportIPCRToExcel(ipcrData, userData, tPath = templatePath) {
  const workbook = new ExcelJS.Workbook();

  try {
    // 1. Load the existing template
    if (!fs.existsSync(tPath)) {
      throw new Error(`Template not found at: ${tPath}`);
    }
    
    await workbook.xlsx.readFile(tPath);
    const worksheet = workbook.getWorksheet('IPCR') || workbook.worksheets[0];
    console.log('✅ Template loaded successfully');

    // 2. Insert User Metadata (Optional: Adjust cells to match your template header)
    // worksheet.getCell('B3').value = userData.name;
    // worksheet.getCell('B4').value = userData.department;

    // 3. Map the data into specific cells
    const categoryNames = {
      'syllabus': 'Syllabus',
      'courseGuide': 'Course Guide',
      'slm': 'SLM',
      'gradingSheet': 'Grading Sheet',
      'tos': 'TOS'
    };

    Object.entries(ipcrData).forEach(([key, data]) => {
      const categoryLabel = categoryNames[key];
      const cellAddress = CELL_MAPPING[categoryLabel];

      if (cellAddress) {
        // We only update the value. ExcelJS preserves existing borders/fonts of that cell.
        worksheet.getCell(cellAddress).value = data.accomplished;
      }
    });

    // 4. Calculate and insert Overall Rating (Example: putting it in a specific cell like E40)
    // const overallRating = calculateOverallRating(ipcrData);
    // worksheet.getCell('E40').value = overallRating;

    // 5. Generate buffer (or write to file)
    const buffer = await workbook.xlsx.writeBuffer();
    console.log('✅ IPCR populated without altering template structure');
    
    return buffer;

  } catch (error) {
    console.error('❌ Error generating Excel:', error);
    throw error;
  }
}

// Utility for Overall Rating (unchanged logic)
function calculateRating(target, accomplished) {
  if (target === 0) return 0;
  const ratio = accomplished / target;
  if (ratio >= 1.0) return 5;
  if (ratio >= 0.8) return 4;
  if (ratio >= 0.6) return 3;
  if (ratio >= 0.4) return 2;
  return 1;
}

module.exports = { exportIPCRToExcel };