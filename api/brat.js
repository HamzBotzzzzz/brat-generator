const { createCanvas } = require('@napi-rs/canvas');

// Fungsi untuk membuat gambar dengan teks
async function generateLowQualityImage(text) {
    const width = 500;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Latar belakang putih
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Setup font - pakai font generic yang tersedia
    ctx.fillStyle = 'black';
    ctx.font = '30px sans-serif'; // Gunakan sans-serif generic
    ctx.textBaseline = 'top'; // Ganti ke 'top' untuk alignment yang lebih predictable
    ctx.textAlign = 'left';

    const words = text.split(" ");
    const positions = [];

    // Acak posisi untuk setiap kata
    words.forEach((word) => {
        let x, y;
        const maxAttempts = 50;
        let attempts = 0;

        do {
            x = Math.random() * (width - ctx.measureText(word).width - 20) + 10;
            y = Math.random() * (height - 40) + 20;
            attempts++;
            
            if (attempts > maxAttempts) break;
        } while (positions.some((pos) => 
            Math.abs(pos.x - x) < 100 && Math.abs(pos.y - y) < 40
        ));

        positions.push({ x, y });
        
        // Tambah stroke untuk visibility lebih baik
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(word, x, y);
        
        // Fill text
        ctx.fillStyle = 'black';
        ctx.fillText(word, x, y);
    });

    return canvas.encode('png');
}

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
