// Instancia del lado del CLIENTE:
const socket = io();

socket.on("productos", (data) => {
	renderProductos(data);
});

// Funcion para renderizar los productos:
const renderProductos = (data) => {
	const contenedorProductos = document.getElementById("contenedorProductos");
	contenedorProductos.innerHTML = "";

	data.forEach(item => {
		const card = document.createElement("div");

		card.innerHTML = `
    <div class="card card-product">
      <div class="card-body">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <p class="precio">precio: $${item.price}</p>
        <div class="d-flex justify-content-center align-item-center">
          <button class="btn btn-outline-info">Eliminar</button>
        </div>
      </div>
    </div>`;
		contenedorProductos.appendChild(card);

		// Agrega un evento al boton eliminar:
		card.querySelector("button").addEventListener("click", () => {
			eliminarProducto(item.id);
		});
	});
};

const eliminarProducto = (id) => {
	socket.emit("eliminarProducto", id);
};

// Agrega productos por el formulario:
document.getElementById("botonEnviar").addEventListener("click", () => {
	agregarProducto();	
});

const agregarProducto = () => {
	const producto = {
		title: document.getElementById("title").value,
		description: document.getElementById("description").value,
		code: document.getElementById("code").value,
		price: document.getElementById("price").value,
		status: document.getElementById("status").value === "true",
		stock: document.getElementById("stock").value,
		category: document.getElementById("category").value,
		thumbnails: document.getElementById("img").value ? [document.getElementById("img").value] : [],
	};

	socket.emit("agregarProducto", producto);
};