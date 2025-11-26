const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');

// Register font atau gunakan font fallback
try {
    // Coba load font Arial, jika tidak tersedia gunakan font default
    GlobalFonts.registerFromPath('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 'Arial');
} catch (error) {
    console.log('Font Arial tidak tersedia, menggunakan font default');
}

// Fungsi untuk membuat teks dengan posisi acak
function generateRandomPositionText(ctx, text, canvasWidth, canvasHeight) {
    const words = text.split(" ");
    const positions = [];

    // Acak posisi untuk setiap kata
    words.forEach((word) => {
        let x, y;

        // Pastikan posisi acak tidak terlalu dekat
        do {
            x = Math.random() * (canvasWidth - 100) + 50;
            y = Math.random() * (canvasHeight - 100) + 50;
        } while (positions.some((pos) => Math.hypot(pos.x - x, pos.y - y) < 50));

        positions.push({ x, y });
        
        // Tambahkan stroke untuk membuat teks lebih jelas
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText(word, x, y);
        ctx.fillStyle = 'black';
        ctx.fillText(word, x, y);
    });
}

// Fungsi untuk membuat gambar dengan teks acak dan kualitas rendah
async function generateLowQualityImage(text) {
    const width = 500;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Latar belakang putih
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Pengaturan font dan warna teks - gunakan font yang tersedia
    ctx.fillStyle = 'black';
    ctx.font = 'bold 30px "Arial", "Helvetica", "Liberation Sans", "DejaVu Sans", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    // Tulis teks dengan posisi acak
    generateRandomPositionText(ctx, text, width, height);

    // Debug: cek apakah font tersedia
    console.log('Available fonts:', GlobalFonts.families);

    return canvas.encode('png');
}

// Fungsi serverless untuk menangani permintaan
module.exports = async (req, res) => {
    const text = req.query.text;

    if (!text) {
        return res.status(400).send('Parameter "text" diperlukan.');
    }

    try {
        const imageBuffer = await generateLowQualityImage(text);
        res.setHeader('Content-Type', 'image/png');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Gagal membuat gambar:', error.message);
        res.status(500).send('Gagal membuat gambar.');
    }
};
