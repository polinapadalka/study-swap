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

// Налаштування Cloudinary (назви змінено згідно з твоїм скриншотом Render)
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

// Схема бази даних з категоріями та часом створення
const ItemSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    imageUrl: String
}, { timestamps: true });

const Item = mongoose.model('Item', ItemSchema);

// Підключення до БД (назва MONGODB_URI як на скриншоті)
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ База підключена успішно"))
    .catch(err => console.error("❌ Помилка підключення до БД:", err));

// Отримати всі оголошення (нові будуть зверху)
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Помилка сервера при отриманні даних" });
    }
});

// Створити нове оголошення
app.post('/api/items', upload.single('image'), async (req, res) => {
    try {
        const newItem = new Item({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            imageUrl: req.file ? req.file.path : ""
        });
        await newItem.save();
        res.json(newItem);
    } catch (err) {
        res.status(500).json({ message: "Помилка при створенні оголошення" });
    }
});

// Видалити оголошення
app.delete('/api/items/:id', async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: "Оголошення видалено" });
    } catch (err) {
        res.status(500).json({ message: "Помилка при видаленні" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Сервер запущено на порту ${PORT}`));