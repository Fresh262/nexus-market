// Memoria compartida de inventario para Vercel Serverless
let inventory = [
    { id: 1, name: "Ópticas Kiroshi MK-IV", category: "Cyberware", price: 2500, stock: 12, img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500" },
    { id: 2, name: "Procesador Neural Quantum", category: "Hardware", price: 1800, stock: 5, img: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500" },
    { id: 3, name: "Icebreaker Protocol v3.0", category: "Software", price: 750, stock: 50, img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500" },
    { id: 4, name: "Brazo Mecánico Mantis", category: "Cyberware", price: 4200, stock: 3, img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500" }
];

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 1. OBTENER INVENTARIO
    if (req.method === 'GET') {
        return res.status(200).json(inventory);
    }

    // 2. MODIFICAR STOCK O CREAR PAGO CON MERCADO PAGO
    if (req.method === 'POST') {
        const { action, productId, change, cartItems } = req.body;

        // Actualización de inventario tradicional
        if (action === 'updateStock') {
            const item = inventory.find(p => p.id === productId);
            if (item) {
                item.stock = Math.max(0, item.stock + change);
                return res.status(200).json({ success: true, newStock: item.stock });
            }
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Crear preferencia de checkout de Mercado Pago
        if (action === 'createPreference') {
            try {
                // Preparamos los items para Mercado Pago
                const itemsMP = cartItems.map(item => ({
                    title: item.name,
                    unit_price: Number(item.price),
                    quantity: Number(item.quantity),
                    currency_id: 'USD' // O tu moneda local: 'PEN', 'ARS', 'MXN', 'CLP', etc.
                }));

                // Llamada a la API de Mercado Pago
                // IMPORTANTE: Reemplaza "TEST-XXXX..." por tu Access Token de producción/prueba de Mercado Pago
                const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer TEST-1234567890123456-101010-XXXXXXXXXXXX-123456789',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        items: itemsMP,
                        back_urls: {
                            success: `https://${req.headers.host}`,
                            failure: `https://${req.headers.host}`,
                            pending: `https://${req.headers.host}`
                        },
                        auto_return: "approved"
                    })
                });

                const data = await response.json();
                
                // Descontamos inventario en servidor al generar la orden
                cartItems.forEach(cartItem => {
                    const product = inventory.find(p => p.id === cartItem.id);
                    if (product) product.stock = Math.max(0, product.stock - cartItem.quantity);
                });

                return res.status(200).json({ init_point: data.init_point });
            } catch (error) {
                return res.status(500).json({ error: "Error procesando Mercado Pago" });
            }
        }
    }
}

