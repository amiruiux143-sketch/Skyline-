const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаем всем подключаться к нашему серверу
app.use(cors());
app.use(express.json());

// Создаем папку для APK, если её нет
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Делаем папку с файлами доступной для скачивания
app.use('/download', express.static(uploadDir));

// Настройка хранилища
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// База данных в памяти (список приложений)
let apps = [];

// Эндпоинт: Получить список всех приложений
app.get('/api/apps', (req, res) => {
    res.json(apps);
});

// Эндпоинт: Загрузить новое приложение
app.post('/api/upload', upload.single('apk'), (req, res) => {
    if (!req.file) return res.status(400).send('Файл не выбран');

    const newApp = {
        id: Date.now(),
        name: req.body.name || "Без названия",
        filename: req.file.filename,
        size: (req.file.size / (1024 * 1024)).toFixed(2) + " MB",
        downloadUrl: `https://${req.get('host')}/download/${req.file.filename}`
    };

    apps.push(newApp);
    console.log("Добавлено новое приложение:", newApp.name);
    res.json(newApp);
});

app.listen(PORT, () => {
    console.log(`Skyline Server Engine запущен на порту ${PORT}`);
});

