/*************************************************
 * CONFIG JSONBIN
 *************************************************/
const BIN_ID = "69e3de2b36566621a8c98385";
const API_KEY = "$2a$10$O9DeoNpqBSYwuBJUsebAdON/SGrC8KTJ/btm8DGG/LxCTplTcq7LO";

const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

/*************************************************
 * DATI GLOBALI
 *************************************************/
let products = {};
let isDataSaved = true;

const supermarkets = [
    "eurospin",
    "esselunga",
    "adamello",
    "shopping",
    "bennet",
    "MyProtein"
];

/*************************************************
 * INIT
 *************************************************/
window.onload = async function () {
    populateSupermarketDropdown();
    await loadFromCloud();
    sortAndRenderTable();
};

/*************************************************
 * LOAD CLOUD + OFFLINE BACKUP
 *************************************************/
async function loadFromCloud() {
    try {
        const res = await fetch(API_URL, {
            method: "GET",
            headers: {
                "X-Master-Key": API_KEY
            }
        });

        if (!res.ok) throw new Error("Errore cloud");

        const data = await res.json();

        products = data || {};

        // backup locale
        localStorage.setItem("backup_products", JSON.stringify(products));

        console.log("✔ Dati caricati da cloud");

    } catch (err) {
        console.log("⚠ Offline o errore cloud → uso backup locale");

        const backup = localStorage.getItem("backup_products");

        products = backup ? JSON.parse(backup) : {};
    }
}

/*************************************************
 * SAVE CLOUD + LOCAL BACKUP
 *************************************************/
async function saveToCloud() {
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify(products)
        });

        localStorage.setItem("backup_products", JSON.stringify(products));

        isDataSaved = true;
        alert("✔ Salvato su cloud");

    } catch (err) {
        localStorage.setItem("backup_products", JSON.stringify(products));
        alert("⚠ Salvato solo in locale (offline)");
    }
}

/*************************************************
 * DROPDOWN SUPERMERCATI
 *************************************************/
function populateSupermarketDropdown() {
    const select = document.getElementById("storeName");

    supermarkets.forEach(s => {
        const option = document.createElement("option");
        option.value = s;
        option.textContent = s;
        select.appendChild(option);
    });
}

/*************************************************
 * AGGIUNGI PRODOTTO
 *************************************************/
function addProduct() {
    const name = document.getElementById("productName").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value);
    const store = document.getElementById("storeName").value;

    if (!name || isNaN(price)) {
        alert("Compila correttamente i campi");
        return;
    }

    if (products[name]) {
        products[name].prices.push(price);
        products[name].store = store;
    } else {
        products[name] = {
            prices: [price],
            store: store,
            quantity: 0
        };
    }

    isDataSaved = false;
    sortAndRenderTable();
    clearInputs();
}

/*************************************************
 * ELIMINA PRODOTTO
 *************************************************/
function deleteProduct(name) {
    if (!confirm("Eliminare prodotto?")) return;

    delete products[name];

    isDataSaved = false;
    sortAndRenderTable();
}

/*************************************************
 * QUANTITÀ
 *************************************************/
function updateQuantity(name, value) {
    if (!products[name]) return;

    products[name].quantity = parseInt(value) || 0;
    isDataSaved = false;
}

/*************************************************
 * RENDER TABELLA
 *************************************************/
function sortAndRenderTable() {
    const tbody = document.querySelector("#productTable tbody");
    tbody.innerHTML = "";

    Object.keys(products).forEach(name => {
        const p = products[name];
        const prices = p.prices;

        const avg = (prices.reduce((a,b)=>a+b,0)/prices.length).toFixed(2);
        const max = Math.max(...prices).toFixed(2);
        const min = Math.min(...prices).toFixed(2);
        const last = prices[prices.length - 1].toFixed(2);

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
                <input type="number"
                    value="${p.quantity || 0}"
                    min="0"
                    onchange="updateQuantity('${name}', this.value)">
            </td>
        `;

        tbody.appendChild(row);
    });
}

/*************************************************
 * INPUT CLEAN
 *************************************************/
function clearInputs() {
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
}

/*************************************************
 * SALVA MANUALE
 *************************************************/
function saveData() {
    saveToCloud();
}

/*************************************************
 * IMPORT JSON
 *************************************************/
function importData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        products = JSON.parse(e.target.result);
        sortAndRenderTable();
    };

    reader.readAsText(file);
}

/*************************************************
 * RICERCA
 *************************************************/
document.addEventListener("input", function(e) {
    if (e.target.id !== "searchProduct") return;

    const value = e.target.value.toLowerCase();
    const rows = document.querySelectorAll("#productTable tbody tr");

    rows.forEach(r => {
        const name = r.cells[0].textContent.toLowerCase();
        r.style.display = name.includes(value) ? "" : "none";
    });
});