import {Router} from "express";
const router = Router();
import fs from "fs";
import path from "path";
const productsFilePath = path.resolve("./src/data/products.json");
import ProductManager from "../controllers/productManager.js";
const productManager = new ProductManager("./src/data/products.json");

// Lee y devuelve el contenido de products.Json, el cual contiene los datos de los productos.
const getProducts = () => {
	try {
		const data = fs.readFileSync(productsFilePath, "utf-8");
		return JSON.parse(data) || [];
	} catch (error) {
		console.error("Error en la lectura del archivo de productos:", error);
		return [];
	}
};

// Convierte un array de productos en una cadena JSON y lo guarda en el archivo especificado por productsFilePath.
const saveProducts = (products) => {
	try {
		fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
	} catch (error) {
		console.error("Error al guardar en el archivo de productos:", error);
	}
};

// Rutas productos:
// Devuelve el listado de productos:
router.get("/", (req, res) => {
	const {limit} = req.query;
	const products = getProducts();

	if (limit) {
		res.json(products.slice(0, limit));
	} else {
		res.json(products);
	}
});

// Retorna un producto especifico por ID:
router.get("/:pid", (req, res) => {
	const products = getProducts();
	const product = products.find((i) => i.id == req.params.pid);

	if (!product) {
		return res.json({
			error: `Producto ID: ${req.params.pid} no fue encontrado.`,
		});
	} else {
		res.json({product});
	}
});

// Crea un nuevo producto y valida que se ingresen todos los datos requeridos:
router.post("/", (req, res) => {
	const {
		title,
		description,
		code,
		price,
		status = true,
		stock,
		category,
		thumbnails = [],
	} = req.body;
	if (!title || !description || !code || !price || !stock || !category) {
		return res.json({
			message: "Todos los campos son requeridos, excepto thumbnails",
		});
	}

	const products = getProducts();
	const id =
		(products.length ? Math.max(...products.map((p) => parseInt(p.id))) : 0) +
		1;
	const newProduct = {
		id: id.toString(),
		title,
		description,
		code,
		price,
		status,
		stock,
		category,
		thumbnails,
	};
	products.push(newProduct);
	saveProducts(products);
	res.json({
		message: "El producto fue creado con exito!",
		newProduct,
	});
});

// Actualiza un producto:
router.put("/:pid", async (req, res) => {
	const id = req.params.pid;
	const productoActualizado = req.body;

	try {
		const actualizado = await productManager.updateProduct(
			parseInt(id),
			productoActualizado
		);
		if (actualizado) {
			res.json({
				message: "Producto actualizado exitosamente.",
			});
		} else {
			res.json({
				error: "Producto no nencontrado.",
			});
		}
	} catch (error) {
		console.error("Error al actualizar producto.", error);
		res.json({
			error: "Error interno del servidor",
		});
	}
});

// Elimina un producto:
router.delete("/:pid", async (req, res) => {
	const id = req.params.pid;

	try {
		await productManager.deleteProduct(parseInt(id));
		res.json({
			message: "Producto eliminado exitosamente.",
		});
	} catch (error) {
		console.error("Error al eliminar producto.", error);
		res.json({
			error: "Error interno del servidor.",
		});
	}
});

export default router;
