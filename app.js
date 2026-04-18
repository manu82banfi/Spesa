const BIN_ID = "69e3de2b36566621a8c98385";
const API_KEY = "$2a$10$O9DeoNpqBSYwuBJUsebAdON/SGrC8KTJ/btm8DGG/LxCTplTcq7LO";

const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let products = {};
let isDataSaved = true;

const supermarkets = [
    "eurospin","esselunga","adamello","shopping","bennet","MyProtein"
];

// =======================
// INIT
// =======================
window.onload = async function () {
    populateSupermarketDropdown();
    await loadFromCloud();
    sortTable('name');
};

// =======================
// JSONBIN
// =======================

async function loadFromCloud() {
    try {
        const res = await fetch(API_URL, {
            headers: { "X-Master-Key": API_KEY }
        });

        const data = await res.json();
        products = data.record || {};

        localStorage.setItem("backup_products", JSON.stringify(products));
    } catch (e) {
        console.log("Offline → uso backup locale");
        const backup = localStorage.getItem("backup_products");
        if (backup) products = JSON.parse(backup);
    }
}

async function saveToCloud() {
    try {
        await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify(products)
        });

        localStorage.setItem("backup_products", JSON.stringify(products));

        alert("Salvato su cloud ✔");
        isDataSaved = true;

    } catch {
        alert("Errore cloud → salvato solo in locale");
        localStorage.setItem("backup_products", JSON.stringify(products));
    }
}

// =======================
// TUO CODICE (LEGGERMENTE ADATTATO)
// =======================

function populateSupermarketDropdown() {
    const storeSelect = document.getElementById('storeName');
    supermarkets.forEach(s => {
        const option = document.createElement('option');
        option.value = s;
        option.textContent = s;
        storeSelect.appendChild(option);
    });
}

function addProduct() {
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const store = document.getElementById('storeName').value;

    if (!name || isNaN(price)) {
        alert("Compila i campi");
        return;
    }

    if (products[name]) {
        if (!confirm("Aggiornare prodotto?")) return;
        products[name].prices.push(price);
        products[name].store = store;
    } else {
        products[name] = { prices: [price], store, quantity: 0 };
    }

    isDataSaved = false;
    sortAndRenderTable();
}

function deleteProduct(name) {
    if (!confirm("Eliminare?")) return;
    delete products[name];
    isDataSaved = false;
    sortAndRenderTable();
}

function updateQuantity(name, q) {
    products[name].quantity = parseInt(q) || 0;
    isDataSaved = false;
}

function sortTable(col) {
    window.sortColumn = col;
    sortAndRenderTable();
}

function sortAndRenderTable() {
    const tbody = document.querySelector("#productTable tbody");
    tbody.innerHTML = "";

    Object.keys(products).sort().forEach(name => {
        const p = products[name];
        const prices = p.prices;

        const avg = (prices.reduce((a,b)=>a+b,0)/prices.length).toFixed(2);
        const max = Math.max(...prices).toFixed(2);
        const min = Math.min(...prices).toFixed(2);
        const last = prices[prices.length-1].toFixed(2);

        const row = document.createElement("tr");

        row.innerHTML = `
        <td>${name}</td>
        <td>${last}</td>
        <td>${p.store}</td>
        <td>${avg}</td>
        <td>${max}</td>
        <td>${min}</td>
        <td>${last}</td>
        <td>
            <button onclick="deleteProduct('${name}')">Elimina</button>
        </td>
        <td>
            <input type="number" value="${p.quantity||0}" onchange="updateQuantity('${name}',this.value)">
        </td>
        `;

        tbody.appendChild(row);
    });
}

// =======================
// BOTTONI
// =======================

function saveData() {
    saveToCloud();
}

function importData(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(ev) {
        products = JSON.parse(ev.target.result);
        sortAndRenderTable();
    };

    reader.readAsText(file);
}