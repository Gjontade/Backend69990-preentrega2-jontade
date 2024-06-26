import {promises as fs} from "fs";

class CartManager {
	constructor(path) {
		this.carts = [];
		this.path = path;
		this.id = 0;

		// Cargar los carritos almacenados en el archivo:
		this.cargarCarritos();
	}

	// Verifica si hay por lo menos un carrito creado:
	async cargarCarritos() {
		try {
			const data = await fs.readFile(this.path, "utf8");
			this.carts = JSON.parse(data);
			if (this.carts.length > 0) {
				this.id = Math.max(...this.carts.map((cart) => cart.id));
			}
		} catch (error) {
			console.error("Error al cargar los carritos desde el archivo.", error);
			// Si no existe el archivo, lo crea:
			await this.guardarCarritos();
		}
	}

	// Guarda el listado de carritos:
	async guardarCarritos() {
		await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2));
	}

	// Crea un nuevo carrito y lo agrega al array:
	async crearCarrito() {
		const nuevoCarrito = {
			id: ++this.id,
			products: [],
		};

		this.carts.push(nuevoCarrito);

		await this.guardarCarritos();
		return nuevoCarrito;
	}

	// Busta un carrito por su ID:
	async getCarritoById(cartId) {
		try {
			const carrito = this.carts.find((c) => c.id === cartId);

			if (!carrito) {
				throw new Error(`No existe un carrito con el ID ${cartId}`);
			}

			return carrito;
		} catch (error) {
			console.error("Error al obtener el carrito por ID.", error);
			throw error;
		}
	}


  // Agrega un producto al carrito. Si el producto ya existe, incrementa su cantidad:
	async agregarProductoAlCarrito(cartId, productId, quantity = 1) {
		const carrito = await this.getCarritoById(cartId);
		const existeProducto = carrito.products.find(
			(p) => p.product === productId
		);

		if (existeProducto) {
			existeProducto.quantity += quantity;
		} else {
			carrito.products.push({product: productId, quantity});
		}

		await this.guardarCarritos();
		return carrito;
	}
}

export default CartManager;
