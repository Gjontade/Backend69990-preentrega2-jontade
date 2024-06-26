import {Router} from "express";
const router = Router();
import ProductManager from '../controllers/productManager.js';
const productManager = new ProductManager('./src/data/products.json'); 

router.get('/home', async (req, res) => {
	try {
		const products = await productManager.getProducts();
		console.log("Productos obtenidos:", products);
		res.render('home', { products });
	} catch (error) {
		console.error("Error al obtener productos.", error);
		res.status(500).json({ error: "Error interno del servidor." });
	}
});

router.get("/realtimeproducts", async (req, res) => {
	res.render("realTimeProducts");
});


export default router;
