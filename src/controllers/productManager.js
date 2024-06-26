import {promises as fs} from "fs";

class ProductManager {
	static id = 0;

	constructor(path) {
		this.products = [];
		this.path = path;
	}

	// Si las validaciones son exitosas, crea un nuevo producto con los datos proporcionados y un ID único:
	async addProduct({
		title,
		description,
		code,
		price,
		status = true,
		stock,
		category,
		thumbnails: [],
	}) {
		try {
			const arrayProductos = await this.leerArchivo();

			if (!title || !description || !code || !price || !stock || !category) {
				console.log("Todos los campos son obligatorios.");
				return;
			}

			if (arrayProductos.some((item) => item.code === code)) {
				console.log("El código debe ser único.");
				return;
			}

			const newProduct = {
				title,
				description,
				code,  
				price,
				status: true,
				stock,
				category,
				thumbnails: [],
			};

			if (arrayProductos.length > 0) {
				ProductManager.id = arrayProductos.reduce(
					(maxid, product) => Math.max(maxid, product.id),
					0
				);
			}

			newProduct.id = ++ProductManager.id;

			arrayProductos.push(newProduct);
			await this.guardarArchivo(arrayProductos);
		} catch (error) {
			console.log("Error al agregar producto.", error);
			throw error;
		}
	}

	// Lee y devuelve todos los productos:
	async getProducts() {
		try {
			const arrayProductos = await this.leerArchivo();
			return arrayProductos;
		} catch (error) {
			console.log("Error al leer el archivo.", error);
			throw error;
		}
	}

	// Devuelve un producto especifico por ID:
	async getProductById(id) {
		try {
			const arrayProductos = await this.leerArchivo();
			const buscado = arrayProductos.find((item) => item.id === id);

			if (!buscado) {
				console.log("Producto no encontrado.");
				return null;
			} else {
				console.log("Producto encontrado.");
				return buscado;
			}
		} catch (error) {
			console.log("Error al leer el archivo.", error);
			throw error;
		}
	}

	async leerArchivo() {
		try {
			const respuesta = await fs.readFile(this.path, "utf-8");
			const arrayProductos = JSON.parse(respuesta);
			return arrayProductos;
		} catch (error) {
			console.log("Error al leer un archivo.", error);
			throw error;
		}
	}

	async guardarArchivo(arrayProductos) {
		try {
			await fs.writeFile(this.path, JSON.stringify(arrayProductos, null, 2));
		} catch (error) {
			console.log("Error al guardar el archivo.", error);
			throw error;
		}
	}

	// Actualiza un producto específico por su ID:
	async updateProduct(id, productoActualizado) {
		try {
			const arrayProductos = await this.leerArchivo();
			const index = arrayProductos.findIndex((item) => item.id == id);

			if (index !== -1) {
				arrayProductos[index] = {
					...arrayProductos[index],
					...productoActualizado,
				};
				await this.guardarArchivo(arrayProductos);
				console.log("Producto actualizado.");
				return true;
			} else {
				console.log("No se encontró el producto.");
				return false;
			}
		} catch (error) {
			console.log("Error al actualizar el producto.", error);
			throw error;
		}
	}

	// Elimina un producto específico por su ID:
	async deleteProduct(id) {
		try {
			const arrayProductos = await this.leerArchivo();

			const index = arrayProductos.findIndex((item) => item.id == id);

			if (index !== -1) {
				arrayProductos.splice(index, 1);
				await this.guardarArchivo(arrayProductos);
				console.log("Producto eliminado.");
			} else {
				console.log("No se encontró el producto.");
			}
		} catch (error) {
			console.log("Error al eliminar el producto.", error);
			throw error;
		}
	}
}

export default ProductManager;