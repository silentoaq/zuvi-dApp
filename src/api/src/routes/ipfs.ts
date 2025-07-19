import { Router } from 'express';
import multer from 'multer';
import { ipfsService } from '../services/ipfs.js';

const router = Router();

// multer 設定
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支援的檔案類型'));
    }
  }
});

// 上傳單一檔案
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '沒有上傳檔案' });
    }

    const { buffer, originalname, mimetype } = req.file;
    const hash = await ipfsService.uploadFile(buffer, originalname, mimetype);
    
    res.json({
      success: true,
      data: {
        hash,
        url: ipfsService.getFileUrl(hash),
        filename: originalname,
        size: buffer.length
      }
    });
  } catch (error) {
    console.error('檔案上傳失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '檔案上傳失敗' 
    });
  }
});

// 上傳多個檔案
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: '沒有上傳檔案' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const hash = await ipfsService.uploadFile(file.buffer, file.originalname, file.mimetype);
      return {
        hash,
        url: ipfsService.getFileUrl(hash),
        filename: file.originalname,
        size: file.buffer.length
      };
    });

    const results = await Promise.all(uploadPromises);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('多檔案上傳失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '多檔案上傳失敗' 
    });
  }
});

// 取得檔案資訊
router.get('/file/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const url = ipfsService.getFileUrl(hash);
    
    res.json({
      success: true,
      data: {
        hash,
        url
      }
    });
  } catch (error) {
    console.error('取得檔案資訊失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得檔案資訊失敗' 
    });
  }
});

// 取得 JSON 資料
router.get('/data/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const data = await ipfsService.getData(hash);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('取得 IPFS 資料失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得 IPFS 資料失敗' 
    });
  }
});

export { router as ipfsRoutes };