let products = {};
let isSaved = true;

const supermarkets = [
  "eurospin",
  "esselunga",
  "adamello",
  "shopping",
  "bennet",
  "MyProtein"
];

/* INIT */
window.onload = async () => {
    fillStores();
    await loadFromCloud();
    render();
    setupSearch();
};

/* DROPDOWN */
function fillStores() {
    const sel = document.getElementById("storeName");
    supermarkets.forEach(s => {
        const o = document.createElement("option");
        o.value = s;
        o.textContent = s;
        sel.appendChild(o);
    });
}

/* ADD PRODUCT */
function addProduct() {
    const name = productName.value.trim();
    const price = parseFloat(productPrice.value);
    const store = storeName.value;

    if (!name || isNaN(price)) return alert("Dati non validi");

    if (!products[name]) {
        products[name] = { prices: [], store, quantity: 0 };
    }

    products[name].prices.push(price);
    products[name].store = store;

    isSaved = false;
    render();

    productName.value = "";
    productPrice.value = "";
}

/* DELETE */
function deleteProduct(name) {
    delete products[name];
    isSaved = false;
    render();
}

/* QUANTITY */
function updateQty(name, val) {
    products[name].quantity = parseInt(val) || 0;
    isSaved = false;
}

/* CALCOLI */
function avg(arr) {
    return (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2);
}
function max(arr) {
    return Math.max(...arr).toFixed(2);
}
function min(arr) {
    return Math.min(...arr).toFixed(2);
}

/* RENDER TABLE */
function render() {
    const body = document.getElementById("tableBody");
    body.innerHTML = "";

    Object.keys(products).forEach(name => {
        const p = products[name];
        const prices = p.prices;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${name}</td>
            <td>${prices.at(-1)}</td>
            <td>${p.store}</td>
            <td>${avg(prices)}</td>
            <td>${max(prices)}</td>
            <td>${min(prices)}</td>
            <td><button onclick="deleteProduct('${name}')">X</button></td>
            <td>
                <input type="number" value="${p.quantity || 0}"
                onchange="updateQty('${name}', this.value)">
            </td>
        `;

        body.appendChild(tr);
    });
}

/* CLOUD LOAD */
async function loadFromCloud() {
    try {
        const res = await fetch(`${API_URL}/latest`, {
            headers: { "X-Master-Key": API_KEY }
        });

        const data = await res.json();
        products = data.record || {};
        localStorage.setItem("backup", JSON.stringify(products));

    } catch (e) {
        products = JSON.parse(localStorage.getItem("backup")) || {};
    }
}

/* CLOUD SAVE */
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

        localStorage.setItem("backup", JSON.stringify(products));
        isSaved = true;
        alert("Salvato cloud");

    } catch {
        alert("Salvato solo locale");
    }
}

/* SEARCH */
function setupSearch() {
    searchProduct.addEventListener("input", e => {
        const v = e.target.value.toLowerCase();
        document.querySelectorAll("#tableBody tr").forEach(r => {
            r.style.display =
                r.children[0].textContent.toLowerCase().includes(v)
                ? "" : "none";
        });
    });
}