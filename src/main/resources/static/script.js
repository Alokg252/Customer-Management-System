// Initialize IndexedDB
let db;
const DB_NAME = 'transactionDB';
const DB_VERSION = 1;
const STORE_NAME = 'transactions';

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onerror = (event) => {
    console.error('IndexedDB error:', event.target.error);
};

request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('customerName', 'customerName', { unique: false });
        store.createIndex('customerId', 'customerId', { unique: true });
        store.createIndex('referralId', 'referralId', { unique: true });
        store.createIndex('joinedDate', 'joinedDate', { unique: false });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadAllTransactions();
};

// UI Functions
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
    
    if (sectionId === 'transaction-list') {
        loadAllTransactions();
    }
}

async function handleNewTransaction(event) {
    event.preventDefault();
    
    const products = [];
    const productEntries = document.querySelectorAll('.product-entry');
    let totalAmount = 0;

    productEntries.forEach(entry => {
        const product = {
            name: entry.querySelector('input[name="productName[]"]').value,
            quantity: parseInt(entry.querySelector('input[name="quantity[]"]').value),
            amount: parseFloat(entry.querySelector('input[name="amount[]"]').value)
        };
        products.push(product);
        totalAmount += product.quantity * product.amount;
    });

    const transaction = {
        customerName: document.getElementById('customerName').value,
        customerId: document.getElementById('customerId').value,
        referralId: document.getElementById('referralId').value,
        mobile: document.getElementById('mobile').value,
        referredBy: document.getElementById('referredBy').value,
        referredCustomerId1: document.getElementById('referredCustomerId1').value,
        referredCustomerId2: document.getElementById('referredCustomerId2').value,
        joinedDate: new Date().toISOString().split('T')[0],
        details: products,
        totalAmount: totalAmount
    };

    if (products.length === 0) {
        alert('Please add at least one product to the transaction.');
        return;
    }

    try {
        // Save locally
        await saveToIndexedDB(transaction);
        
        // Try to sync with server
        await syncWithServer(transaction);
        
        alert('Transaction created successfully!');
        event.target.reset();
        document.getElementById('products-container').innerHTML = '';
        document.getElementById('total-amount').textContent = '₹0.00';
        loadAllTransactions();
    } catch (error) {
        console.error('Error creating transaction:', error);
        alert('Transaction saved offline. Will sync when online.');
    }
}

function addProductEntry() {
    const container = document.getElementById('products-container');
    const entryDiv = document.createElement('div');
    entryDiv.className = 'product-entry';
    
    entryDiv.innerHTML = `
        <input type="text" name="productName[]" placeholder="Product Name" required>
        <input type="number" name="quantity[]" placeholder="Quantity" min="1" value="1" required onchange="updateTotal()">
        <input type="number" name="amount[]" placeholder="Amount" step="0.01" required onchange="updateTotal()">
        <button type="button" onclick="removeProductEntry(this)">×</button>
    `;
    
    container.appendChild(entryDiv);
    updateTotal();
}

function removeProductEntry(button) {
    button.parentElement.remove();
    updateTotal();
}

function updateTotal() {
    let total = 0;
    const productEntries = document.querySelectorAll('.product-entry');
    
    productEntries.forEach(entry => {
        const quantity = parseInt(entry.querySelector('input[name="quantity[]"]').value) || 0;
        const amount = parseFloat(entry.querySelector('input[name="amount[]"]').value) || 0;
        total += quantity * amount;
    });
    
    document.getElementById('total-amount').textContent = `₹${total.toFixed(2)}`;
}

function generateAndSetCustomerId() {
    const customerId = generateCustomerId();
    document.getElementById('customerId').value = customerId;
}

function generateAndSetReferralId() {
    const referralId = generateReferralId();
    document.getElementById('referralId').value = referralId;
}

async function saveToIndexedDB(transaction) {
    return new Promise((resolve, reject) => {
        const transaction_db = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction_db.objectStore(STORE_NAME);
        const request = store.add(transaction);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function syncWithServer(transaction) {
    try {
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transaction)
        });
        
        if (!response.ok) {
            throw new Error('Server sync failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Sync error:', error);
        throw error;
    }
}

function generateCustomerId() {
    return Date.now().toString(36).toUpperCase();
}

function generateReferralId() {
    const date = new Date();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-1);
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 26 + 65);
    return `${month}${year}${day}${String.fromCharCode(random)}`;
}

async function searchTransactions() {
    const searchType = document.getElementById('search-type').value;
    const searchValue = document.getElementById('search-input').value;
    
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index(searchType);
    
    try {
        const results = await new Promise((resolve, reject) => {
            const request = index.getAll(searchValue);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        alert('Error searching transactions');
    }
}

function displaySearchResults(transactions) {
    const container = document.getElementById('search-results');
    container.innerHTML = '';
    
    if (transactions.length === 0) {
        container.innerHTML = '<p>No transactions found</p>';
        return;
    }
    
    transactions.forEach(transaction => {
        container.appendChild(createTransactionCard(transaction));
    });
}

function createTransactionCard(transaction) {
    const card = document.createElement('div');
    card.className = 'transaction-card';
    
    let productsHtml = '<div class="product-list">';
    transaction.details.forEach(product => {
        productsHtml += `
            <div class="product-item">
                <span>${product.name}</span>
                <span>${product.quantity} × ₹${product.amount}</span>
                <span>₹${(product.quantity * product.amount).toFixed(2)}</span>
            </div>
        `;
    });
    productsHtml += '</div>';

    card.innerHTML = `
        <h3>${transaction.customerName}</h3>
        <p>Customer ID: ${transaction.customerId}</p>
        <p>Referral ID: ${transaction.referralId}</p>
        <p>Mobile: ${transaction.mobile}</p>
        <p>Joined Date: ${transaction.joinedDate}</p>
        ${transaction.referredBy ? `<p>Referred By: ${transaction.referredBy}</p>` : ''}
        ${transaction.referredCustomerId1 ? `<p>Referred Customer 1: ${transaction.referredCustomerId1}</p>` : ''}
        ${transaction.referredCustomerId2 ? `<p>Referred Customer 2: ${transaction.referredCustomerId2}</p>` : ''}
        <h4>Products:</h4>
        ${productsHtml}
        <h4 class="total">Total Amount: ₹${transaction.totalAmount.toFixed(2)}</h4>
    `;
    
    return card;
}

async function loadAllTransactions() {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    try {
        const transactions = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        const container = document.getElementById('all-transactions');
        container.innerHTML = '';
        
        if (transactions.length === 0) {
            container.innerHTML = '<p>No transactions found</p>';
            return;
        }
        
        transactions.forEach(transaction => {
            container.appendChild(createTransactionCard(transaction));
        });
    } catch (error) {
        console.error('Error loading transactions:', error);
        alert('Error loading transactions');
    }
}

// Check online status and sync when online
window.addEventListener('online', async () => {
    try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const transactions = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        for (const transaction of transactions) {
            if (!transaction.synced) {
                await syncWithServer(transaction);
                // Mark as synced
                const updateTx = db.transaction([STORE_NAME], 'readwrite');
                const updateStore = updateTx.objectStore(STORE_NAME);
                transaction.synced = true;
                updateStore.put(transaction);
            }
        }
    } catch (error) {
        console.error('Sync error:', error);
    }
});
