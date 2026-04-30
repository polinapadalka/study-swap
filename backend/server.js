const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ВСТАВ СВОЇ КЛЮЧІ ТУТ (Dashboard Cloudinary)
cloudinary.config({
  cloud_name: 'dpg4smpad', 
  api_key: '763126622969787',
  api_secret: '8bysRFPvQzdkJ7ifOUHy9Two5g0'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { 
    folder: 'study_swap', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'webp'] 
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Ліміт 10МБ
});

mongoose.connect("mongodb+srv://polinapadalka10:study123@cluster0.8olw6zy.mongodb.net/studyswap")
  .then(() => console.log("✅ База підключена"))
  .catch(err => console.error("❌ Помилка бази:", err));

const Material = mongoose.model("Material", {
  title: String,
  subject: String,
  file: String,
  likes: { type: Number, default: 0 },
});

app.get("/materials", async (req, res) => {
  const data = await Material.find().sort({ likes: -1 });
  res.json(data);
});

app.post("/materials", upload.single("file"), async (req, res) => {
  try {
    console.log("--- Новий запит ---");
    const material = new Material({
      title: req.body.title,
      subject: req.body.subject,
      file: req.file ? req.file.path : null,
    });

    await material.save();
    console.log("✅ Збережено успішно!");
    res.json(material);
  } catch (err) {
    console.error("❌ Помилка сервера:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/materials/:id/like", async (req, res) => {
  const mat = await Material.findById(req.params.id);
  if(mat) { mat.likes++; await mat.save(); }
  res.json(mat);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Сервер: http://localhost:${PORT}`));