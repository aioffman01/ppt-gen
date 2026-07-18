import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Target directories
const FONT_DIR = path.resolve(__dirname, '../FONT');
const DATA_FILE = path.resolve(__dirname, 'data.json');

// Ensure directories exist
if (!fs.existsSync(FONT_DIR)) {
  fs.mkdirSync(FONT_DIR, { recursive: true });
}

// Initialize local JSON storage if not exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ fonts: [], references: [] }, null, 2));
}

// Read data helper
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { fonts: [], references: [] };
  }
};

// Write data helper
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Configure Multer for font uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FONT_DIR);
  },
  filename: (req, file, cb) => {
    // Keep original extension, replace spaces/special chars in name
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9가-힣_-]/g, '');
    cb(null, `${Date.now()}-${baseName}${ext}`);
  }
});

const upload = multer({ storage });

// Serve static font files
app.use('/FONT', express.static(FONT_DIR));

// --- API Endpoints ---

// 1. Get all fonts
app.get('/api/fonts', (req, res) => {
  const data = readData();
  res.json(data.fonts);
});

// 2. Register font (Upload)
app.post('/api/fonts', upload.single('file'), (req, res) => {
  const { title } = req.body;
  const file = req.file;

  if (!title || !file) {
    return res.status(400).json({ error: '제목과 폰트 파일을 모두 등록해주세요.' });
  }

  const data = readData();
  
  const newFont = {
    id: Date.now().toString(),
    title,
    originalName: file.originalname,
    filename: file.filename,
    url: `/FONT/${file.filename}`, // Serves relative to backend
    registeredAt: new Date().toISOString()
  };

  data.fonts.push(newFont);
  writeData(data);

  res.status(201).json(newFont);
});

// 3. Delete font
app.delete('/api/fonts/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();
  const fontIndex = data.fonts.findIndex(f => f.id === id);

  if (fontIndex === -1) {
    return res.status(404).json({ error: '해당 폰트를 찾을 수 없습니다.' });
  }

  const font = data.fonts[fontIndex];
  const filePath = path.join(FONT_DIR, font.filename);

  // Remove from file system if exists
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Remove from data list
  data.fonts.splice(fontIndex, 1);
  writeData(data);

  res.json({ message: '폰트가 삭제되었습니다.' });
});

// 4. Get all references (Color, Links, etc.)
app.get('/api/references', (req, res) => {
  const data = readData();
  res.json(data.references);
});

// 5. Add reference
app.post('/api/references', (req, res) => {
  const { type, title, content, description } = req.body;

  if (!type || !title || !content) {
    return res.status(400).json({ error: '유형, 제목, 내용을 모두 입력해주세요.' });
  }

  const data = readData();
  const newRef = {
    id: Date.now().toString(),
    type, // 'color' (palette), 'link' (web URL), 'memo' (text memo)
    title,
    content, // hex values for colors, url for link, text for memo
    description: description || '',
    createdAt: new Date().toISOString()
  };

  data.references.push(newRef);
  writeData(data);

  res.status(201).json(newRef);
});

// 6. Delete reference
app.delete('/api/references/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();
  const refIndex = data.references.findIndex(r => r.id === id);

  if (refIndex === -1) {
    return res.status(404).json({ error: '해당 자료를 찾을 수 없습니다.' });
  }

  data.references.splice(refIndex, 1);
  writeData(data);

  res.json({ message: '자료가 삭제되었습니다.' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
