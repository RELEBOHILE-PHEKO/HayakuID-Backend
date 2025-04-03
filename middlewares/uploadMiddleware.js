import multer from 'multer';
import path from 'path';

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define the uploads directory
        const uploadDir = path.join(__dirname, '../uploads');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Append timestamp to filename to prevent overwrites
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        // Allowed file types: images and PDFs
        const filetypes = /jpeg|jpg|png|gif|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File type not supported! Only JPEG, PNG, GIF, and PDF are allowed.'));
    }
});

// Export the upload middleware
export default upload;