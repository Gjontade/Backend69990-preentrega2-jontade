import {Router} from "express";
const router = Router();
import fs from "fs";
import path from "path";
const cartsFilePath = path.resolve("./src/data/carts.json");
const productsFilePath = path.resolve("./src/data/products.json");

// Lee y devuelve el contenido de carts.Json, el cual contiene los datos del carrito.
const getCarts = () => {
	try {
		const data = fs.readFileSync(cartsFilePath, "utf-8");
		return JSON.parse(data) || [];
	} catch (error) {
		console.error("Error en la lectura del archivo del carrito:", error);
		return [];
	}
};

// Convierte un array de carritos en una cadena JSON y lo guarda en el archivo especificado por cartsFilePath.
const saveCarts = (carts) => {
	try {
		fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
	} catch (error) {
		console.error("Error al guardar en el archivo del carrito:", error);
	}
};

// Lee y devuelve el contenido de products.Json, el cual contiene los datos de los productos.
const getProducts = () => {
	try {
		const data = fs.readFileSync(productsFilePath, "utf-8");
		return JSON.parse(data) || [];
	} catch (error) {
		console.error("Error reading products file:", error);
		return [];
	}
};

// Rutas Carrito:
// Devuelve el listado de los carritos:
router.get("/", (req, res) => {
	const {limit} = req.query;
	const carts = getCarts();

	if (limit) {
		res.json(carts.slice(0, limit));
	} else {
		res.json(carts);
	}
});

// Crea un nuevo carrito:
router.post("/", (req, res) => {
	const carts = getCarts();
	const id =
		(carts.length ? Math.max(...carts.map((c) => parseInt(c.id))) : 0) + 1;
	const newCart = {id: id.toString(), products: []};
	carts.push(newCart);
	saveCarts(carts);
	res.json({
		message: `El carrito con ID ${id}, fue creado con exito!`,
		newCart,
	});
});

// Retorna un carrito especifico por ID:
router.get("/:cid", (req, res) => {
	const carts = getCarts();
	const cart = carts.find((c) => c.id === req.params.cid);
	if (cart) {
		res.json(cart.products);
	} else {
		res.json({
			message: `El carrito ID: ${req.params.cid}, no fue encontrado.`,
		});
	}
});

// Agrega un producto a un carrito segun los IDs indicados:
router.post("/:cid/product/:pid", (req, res) => {
	const carts = getCarts();
	const products = getProducts();

	const cart = carts.find((c) => c.id === req.params.cid);
	if (!cart) {
		return res.json({
			message: `El carrito ID: ${req.params.cid}, no fue encontrado.`,
		});
	}

	const product = products.find((p) => p.id === req.params.pid);
	if (!product) {
		return res.json({
			message: `El producto ID: ${req.params.pid}, no fue encontrado.`,
		});
	}

	const productIndex = cart.products.findIndex(
		(p) => p.product === req.params.pid
	);
	if (productIndex === -1) {
		cart.products.push({product: req.params.pid, quantity: 1});
	} else {
		cart.products[productIndex].quantity += 1;
	}

	saveCarts(carts);
	res.json(cart);
});

export default router;
