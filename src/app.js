// Levantando el servidor.
import express from "express";
const app = express();

import productosRouter from "./routes/productos.router.js";
import carritoRouter from "./routes/carrito.router.js";
import {engine} from "express-handlebars";
import {Server} from "socket.io";
import viewsRouter from "./routes/views.router.js";
import ProductManager from "./controllers/productManager.js";
const productManager = new ProductManager("./src/data/products.json");

// Middleware para recibir datos en Json:
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("./src/public"));

// Configuracion Express-Handlebars:
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

const PUERTO = 8080;
const httpServer = app.listen(PUERTO, () => {
	console.log(`Listening in port: http://localhost:${PUERTO}`);
});

// Ruta productos
app.use("/api/products", productosRouter);

// Ruta carritos
app.use("/api/carts", carritoRouter);

app.use("/", viewsRouter);

// Ruta inexistente
app.get("*", (req, res) => {
	res.send("ERROR: Esta ruta no esta definida.");
});

// Instancia del lado del SERVIDOR:
const io = new Server(httpServer);

// Escucha si un cliente se conecto:
io.on("connection", async (socket) => {
	console.log("un cliente se conecto.");

	// Envia el array de productos:
	socket.emit("productos", await productManager.getProducts());

	// Recibe el evento 'eliminarProducto' desde el cliente:
	socket.on("eliminarProducto", async (id) => {
		await productManager.deleteProduct(id);

		// Devuelve al cliente la lista actualizada:
		io.sockets.emit("productos", await productManager.getProducts());
	});

	// Agrega productos por medio del formulario:
	socket.on("agregarProducto", async (product) => {
		await productManager.addProduct(product);

		// Devuelve al cliente la lista actualizada:
		io.sockets.emit("productos", await productManager.getProducts());
	});
});
