const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Налаштування Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'study-swap' }
});
const upload = multer({ storage });

// Схема бази даних
const ItemSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    imageUrl: String
}, { timestamps: true });

const Item = mongoose.model('Item', ItemSchema);

// Підключення до БД
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ База підключена"))
    .catch(err => console.error("❌ Помилка БД:", err));

// --- JSON-RPC ЕНДПОІНТ ---
app.post('/rpc', async (req, res) => {
    const { jsonrpc, method, params, id } = req.body;

    if (jsonrpc !== "2.0") {
        return res.status(400).json({ jsonrpc: "2.0", error: { code: -32600, message: "Invalid Request" }, id });
    }

    try {
        let result;
        switch (method) {
            case "getAllItems":
                result = await Item.find().sort({ createdAt: -1 });
                break;
            case "deleteItem":
                await Item.findByIdAndDelete(params.id);
                result = { status: "deleted" };
                break;
            default:
                return res.status(404).json({ jsonrpc: "2.0", error: { code: -32601, message: "Method not found" }, id });
        }
        res.json({ jsonrpc: "2.0", result, id });
    } catch (err) {
        res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: err.message }, id });
    }
});

// REST Маршрут тільки для завантаження файлів 
app.post('/api/items', upload.single('image'), async (req, res) => {
    try {
        const newItem = new Item({
            title: req.body.title,
            description: req.body.description,
            imageUrl: req.file ? req.file.path : ""
        });
        await newItem.save();
        res.json(newItem);
    } catch (err) {
        res.status(500).json({ message: "Помилка завантаження" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 RPC Server on port ${PORT}`));