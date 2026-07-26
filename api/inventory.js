// Memoria compartida simulada para prueba gratuita en Vercel
// (En producción puedes conectar Vercel KV con 1 solo clic)
let inventory = [
    { id: 1, name: "Ópticas Kiroshi MK-IV", category: "Cyberware", price: 2500, stock: 12, img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500" },
    { id: 2, name: "Procesador Neural Quantum", category: "Hardware", price: 1800, stock: 5, img: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500" },
    { id: 3, name: "Icebreaker Protocol v3.0", category: "Software", price: 750, stock: 50, img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500" },
    { id: 4, name: "Brazo Mecánico Mantis", category: "Cyberware", price: 4200, stock: 3, img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500" }
];

export default function handler(req, res) {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        return res.status(200).json(inventory);
    }

    if (req.method === 'POST') {
        const { productId, change } = req.body;
        const item = inventory.find(p => p.id === productId);
        
        if (item) {
            item.stock = Math.max(0, item.stock + change);
            return res.status(200).json({ success: true, newStock: item.stock });
        }
        return res.status(404).json({ error: "Producto no encontrado" });
    }
}

