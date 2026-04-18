const BIN_ID = "69e3de2b36566621a8c98385";
const API_KEY = "$2a$10$O9DeoNpqBSYwuBJUsebAdON/SGrC8KTJ/btm8DGG/LxCTplTcq7LO";

const URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

let products = {};

const stores = ["eurospin","esselunga","adamello","bennet","shopping"];

window.onload = async () => {
    const sel = document.getElementById("storeName");

    stores.forEach(s => {
        const o = document.createElement("option");
        o.value = s;
        o.textContent = s;
        sel.appendChild(o);
    });

    await loadFromCloud();
    render();
};

async function loadFromCloud() {
    try {
        const r = await fetch(URL, {
            headers: { "X-Master-Key": API_KEY }
        });

        products = await r.json() || {};
        localStorage.setItem("backup", JSON.stringify(products));
    } catch {
        products = JSON.parse(localStorage.getItem("backup") || "{}");
    }
}

async function saveToCloud() {
    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": API_KEY
        },
        body: JSON.stringify(products)
    });

    localStorage.setItem("backup", JSON.stringify(products));
    alert("Salvato ✔");
}

function addProduct() {
    const name = productName.value.trim();
    const price = parseFloat(productPrice.value);
    const store = storeName.value;

    if (!name || !price) return;

    if (!products[name]) {
        products[name] = { prices:[price], store, quantity:0 };
    } else {
        products[name].prices.push(price);
        products[name].store = store;
    }

    render();
}

function deleteProduct(n) {
    delete products[n];
    render();
}

function updateQty(n,v){
    products[n].quantity = +v;
}

function render() {
    const tb = document.querySelector("tbody");
    tb.innerHTML = "";

    Object.keys(products).forEach(n => {
        const p = products[n];
        const last = p.prices.at(-1);

        tb.innerHTML += `
        <tr>
        <td>${n}</td>
        <td>${last}</td>
        <td>${p.store}</td>
        <td><button onclick="deleteProduct('${n}')">X</button></td>
        <td><input type="number" value="${p.quantity||0}" onchange="updateQty('${n}',this.value)"></td>
        </tr>`;
    });
}

document.addEventListener("input", e => {
    if (e.target.id !== "searchProduct") return;

    const v = e.target.value.toLowerCase();
    document.querySelectorAll("tbody tr").forEach(r => {
        r.style.display = r.children[0].textContent.toLowerCase().includes(v) ? "" : "none";
    });
});