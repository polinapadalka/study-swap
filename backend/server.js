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
  cloud_name: 'dpg4smpad', 
  api_key: '763126622969787',
  api_secret: '8bysRFPvQzdkJ7ifOUHy9Two5g0'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'study-swap' }
});
const upload = multer({ storage });

// Схема бази даних (Додано timestamps для дати)
const ItemSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    imageUrl: String
}, { timestamps: true });

const Item = mongoose.model('Item', ItemSchema);

// Підключення до БД
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error(err));

// Ендпоінт: Отримати всі оголошення
app.get('/api/items', async (req, res) => {
    const items = await Item.find().sort({ createdAt: -1 }); // Нові зверху
    res.json(items);
});

// Ендпоінт: Створити оголошення
app.post('/api/items', upload.single('image'), async (req, res) => {
    const newItem = new Item({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        imageUrl: req.file ? req.file.path : ""
    });
    await newItem.save();
    res.json(newItem);
});

// Ендпоінт: ВИДАЛИТИ оголошення (Нове!)
app.delete('/api/items/:id', async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));