// Global IndexedDB variables
let db; // Database connection object
const STORE_NAME = 'transactions'; // Name of our object store (like a table in SQL)
const DB_NAME = 'transactionDB'; // Name of our database
const DB_VERSION = 1; // Database version - increment this when changing database structure

/**
 * Initialize IndexedDB database
 * IndexedDB is a low-level API for client-side storage of significant amounts of structured data
 * It's like SQLite but built into the browser
 */
async function initDB() {
    return new Promise((resolve, reject) => {
        // Open a connection to the database (creates it if it doesn't exist)
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Handle database connection errors
        request.onerror = (event) => {
            console.error('Error opening database:', event.target.error);
            reject(event.target.error);
        };

        // Called when connection is successful
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('IndexedDB connected successfully');
            resolve(db);
        };

        // Called when database needs to be created/upgraded
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object store if it doesn't exist (like creating a table)
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                
                // Create indexes for searching (like creating indexes in SQL)
                store.createIndex('customerName', 'customerName', { unique: false });
                store.createIndex('customerId', 'customerId', { unique: false });
                store.createIndex('mobile', 'mobile', { unique: false });
                store.createIndex('referralId', 'referralId', { unique: false });
                console.log('Database structure created');
            }
        };
    });
}

/**
 * Clear only IndexedDB data
 * This function will remove all client-side stored data
 */
async function clearIndexedDBOnly() {
    showClearConfirmation();
}

function showClearConfirmation() {
    const clearButton = document.querySelector('.clear-data-container > .warning-button');
    const confirmationBox = document.getElementById('clear-confirmation-box');
    clearButton.style.display = 'none';
    confirmationBox.classList.remove('hidden');
    document.getElementById('clear-confirmation').value = ''; // Clear any previous input
    document.getElementById('clear-confirmation').focus(); // Focus the input
}

function cancelClear() {
    const clearButton = document.querySelector('.clear-data-container > .warning-button');
    const confirmationBox = document.getElementById('clear-confirmation-box');
    clearButton.style.display = 'block';
    confirmationBox.classList.add('hidden');
}

async function confirmClear() {
    const confirmInput = document.getElementById('clear-confirmation');
    const confirmText = confirmInput.value.toLowerCase().trim();
    
    if (confirmText !== 'clear') {
        alert("Please type 'clear' to confirm data deletion");
        return;
    }

    if (!confirm('WARNING: This will delete all locally stored transaction data. This action cannot be undone. Are you sure?')) {
        cancelClear(); // Hide the confirmation box if user cancels
        return;
    }

    try {
        // Close current database connection if it exists
        if (db) {
            db.close();
            db = null;
        }
        
        // Request to delete the database
        const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
        
        deleteRequest.onsuccess = () => {
            console.log('IndexedDB database deleted successfully');
            alert('Local data has been cleared successfully. The page will now reload.');
            // Reload page to reinitialize IndexedDB
            window.location.reload();
        };

        deleteRequest.onerror = (event) => {
            console.error('Error deleting IndexedDB database:', event.target.error);
            alert('Error clearing local data. Please try again.');
            cancelClear(); // Hide the confirmation box on error
        };

    } catch (error) {
        console.error('Error in clearIndexedDBOnly:', error);
        alert('Error clearing local data. Please try again.');
        cancelClear(); // Hide the confirmation box on error
    }
}

/**
 * Save a new transaction to IndexedDB
 * @param {Object} transaction - Transaction object to save
 */
async function saveTransaction(transaction) {
    if (!db) {
        throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
        // Start a transaction (not to be confused with our business transactions)
        // 'readwrite' means we want to write data
        const dbTransaction = db.transaction([STORE_NAME], 'readwrite');
        const store = dbTransaction.objectStore(STORE_NAME);

        // Attempt to add the transaction to the store
        const request = store.add(transaction);

        request.onsuccess = () => {
            console.log('Transaction saved successfully');
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('Error saving transaction:', request.error);
            reject(request.error);
        };
    });
}

/**
 * Retrieve all transactions from IndexedDB
 * @returns {Promise<Array>} Array of transactions
 */
async function getAllTransactions() {
    if (!db) {
        throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result || []);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

/**
 * Search transactions using an index
 * @param {string} indexName - Name of the index to search (e.g., 'customerName')
 * @param {string} searchValue - Value to search for
 */
async function searchByIndex(indexName, searchValue) {
    if (!db) {
        throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index(indexName);
        const request = index.getAll(searchValue);

        request.onsuccess = () => {
            resolve(request.result || []);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

async function loadAllTransactions() {
    if (!db) {
        console.log('Database not initialized yet');
        return;
    }

    try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        const transactions = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });

        const container = document.getElementById('all-transactions');
        if (!container) {
            console.log('Container not found');
            return;
        }

        container.innerHTML = '';
        
        if (transactions.length === 0) {
            container.innerHTML = '<p>No transactions found</p>';
            return;
        }
        
        transactions.forEach(transaction => {
            const card = createTransactionCard(transaction);
            if (card) {
                container.appendChild(card);
            }
        });
    } catch (error) {
        console.error('Error loading transactions:', error);
        const container = document.getElementById('all-transactions');
        if (container) {
            container.innerHTML = '<p>Error loading transactions</p>';
        }
    }
}

async function searchTransactions() {
    if (!db) {
        alert('Database not initialized. Please refresh the page.');
        return;
    }

    const searchType = document.querySelector('#search-transactions #search-type').value;
    const searchValue = document.querySelector('#search-transactions #search-input').value.trim();
    
    console.log('Searching with type:', searchType, 'and value:', searchValue); // Debug log
    
    if (!searchValue) {
        showError('Please enter a search value');
        return;
    }

    try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        // Get all records first
        const allRecords = await getAllRecords(store);
        console.log('All records from store:', allRecords); // Debug log
        
        let results = [];

        if (searchType === 'all') {
            results = allRecords.filter(record => {
                const searchLower = searchValue.toLowerCase();
                return (
                    (record.customerName && record.customerName.toLowerCase().includes(searchLower)) ||
                    (record.customerId && record.customerId.toLowerCase().includes(searchLower)) ||
                    (record.mobile && record.mobile.toLowerCase().includes(searchLower)) ||
                    (record.referralId && record.referralId.toLowerCase().includes(searchLower))
                );
            });
        } else {
            results = allRecords.filter(record => {
                const fieldValue = record[searchType];
                return fieldValue && fieldValue.toLowerCase().includes(searchValue.toLowerCase());
            });
        }

        console.log('Filtered results:', results); // Debug log
        
        const resultsContainer = document.querySelector('#search-transactions #search-results');
        if (resultsContainer) {
            displaySearchResults(results, searchValue);
        } else {
            console.error('Results container not found');
        }
    } catch (error) {
        console.error('Search error:', error);
        showError('Failed to search transactions. Please try again.');
    }
}

function displaySearchResults(results, searchValue) {
    const container = document.querySelector('#search-transactions #search-results');
    
    if (!container) {
        console.error('Search results container not found');
        return;
    }
    
    // Clear previous results
    container.innerHTML = '';

    if (!results || results.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No transactions found</div>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'transaction-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Customer Name</th>
                <th>Customer ID</th>
                <th>Mobile</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    results.forEach(transaction => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${highlightMatch(transaction.customerName || '', searchValue)}</td>
            <td>${highlightMatch(transaction.customerId || '', searchValue)}</td>
            <td>${highlightMatch(transaction.mobile || '', searchValue)}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewTransaction('${transaction.id}')">View Transaction</button>
                <button class="btn btn-sm btn-primary" onclick="showCustomerDetails('${transaction.customerId}')">Customer History</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    container.appendChild(table);
}

// Helper function to highlight search matches
function highlightMatch(text, searchValue) {
    if (!searchValue || !text) return text || '';
    
    const regex = new RegExp(searchValue, 'gi');
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
}

async function getAllRecords(store) {
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function viewTransaction(transactionId) {
    if (!db) {
        alert('Database not initialized. Please refresh the page.');
        return;
    }

    try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const result = await new Promise((resolve, reject) => {
            const request = store.get(transactionId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        if (!result) {
            alert('Transaction not found');
            return;
        }

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content transaction-details';

        const transactionDate = new Date(result.date);
        modalContent.innerHTML = `
            <h2>Transaction Details</h2>
            <div class="transaction-info">
                <p><strong>Date:</strong> ${transactionDate.toLocaleDateString()} ${transactionDate.toLocaleTimeString()}</p>
                <p><strong>Customer Name:</strong> ${result.customerName}</p>
                <p><strong>Customer ID:</strong> ${result.customerId}</p>
                <p><strong>Mobile:</strong> ${result.mobile}</p>
            </div>
            <div class="products-section">
                <h3>Products</h3>
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${result.products.map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.quantity}</td>
                                <td>₹${product.amount.toFixed(2)}</td>
                                <td>₹${(product.quantity * product.amount).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><strong>Total Amount</strong></td>
                            <td><strong>₹${result.totalAmount.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '×';
        closeButton.onclick = closeModal;
        modalContent.appendChild(closeButton);

        // Show modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

    } catch (error) {
        console.error('Error viewing transaction:', error);
        alert('Error loading transaction details');
    }
}

async function showCustomerDetails(customerId) {
    if (!db) {
        console.error('Database not initialized');
        return;
    }

    try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const customerIndex = store.index('customerId');
        
        const customerTransactions = await new Promise((resolve, reject) => {
            const request = customerIndex.getAll(customerId);
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });

        if (!customerTransactions || customerTransactions.length === 0) {
            alert('No transactions found for this customer');
            return;
        }

        // Sort transactions by date (newest first)
        customerTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Calculate total amount spent
        const totalSpent = customerTransactions.reduce((sum, t) => sum + (parseFloat(t.totalAmount) || 0), 0);

        // Get customer info from first transaction
        const customer = customerTransactions[0];

        const modalContent = document.createElement('div');
        modalContent.className = 'customer-details-modal';
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>Customer Details</h2>
                <button onclick="closeModal()" class="close-btn">&times;</button>
            </div>
            <div class="customer-info">
                <p><strong>Name:</strong> ${customer.customerName || 'N/A'}</p>
                <p><strong>Customer ID:</strong> ${customer.customerId || 'N/A'}</p>
                <p><strong>Mobile:</strong> ${customer.mobile || 'N/A'}</p>
                <p><strong>Total Spent:</strong> ₹${totalSpent.toFixed(2)}</p>
            </div>
            <div class="transaction-history">
                <h3>Transaction History</h3>
                <div class="transaction-list">
                    ${customerTransactions.map(t => `
                        <div class="transaction-item">
                            <div class="transaction-header">
                                <span class="date">${formatDate(t.date)}</span>
                                <span class="amount">₹${(parseFloat(t.totalAmount) || 0).toFixed(2)}</span>
                            </div>
                            ${t.products ? `
                                <div class="products-list">
                                    ${t.products.map(p => `
                                        <div class="product-item">
                                            <span>${p.name}</span>
                                            <span>${p.quantity} × ₹${parseFloat(p.price).toFixed(2)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Show modal
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = '';
        modalContainer.appendChild(modalContent);
        modalContainer.style.display = 'flex';

    } catch (error) {
        console.error('Error showing customer details:', error);
        alert('Error loading customer details. Please try again.');
    }
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.style.display = 'none';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function createSearchResultCard(transaction) {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    
    card.innerHTML = `
        <div class="customer-info">
            <h3>${transaction.customerName}</h3>
            <p>Customer ID: ${transaction.customerId}</p>
            <p>Mobile: ${transaction.mobile}</p>
            <p>Referral ID: ${transaction.referralId}</p>
        </div>
        <div class="actions">
            <button onclick="showCustomerDetails('${transaction.customerId}')" class="details-button">Show Details</button>
        </div>
    `;
    
    return card;
}

// Function to clear browser sync data
function clearBrowserData() {
    try {
        // Clear localStorage
        localStorage.clear();
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Clear cookies
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        
        // Clear cache data
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }

        alert('Browser sync data cleared successfully!');
    } catch (error) {
        console.error('Error clearing browser data:', error);
        alert('Error clearing browser data');
    }
}

function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger';
    alert.textContent = message;
    document.getElementById('alerts').appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
}

function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.textContent = message;
    document.getElementById('alerts').appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
}

function resetForm() {
    const form = document.getElementById('transaction-form');
    form.reset();
    delete form.dataset.customerId;
    
    // Enable all inputs and remove readonly
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.readOnly = false;
        input.classList.remove('readonly-input');
    });
    
    // Clear the date input
    const dateInput = document.getElementById('transactionDate');
    if (dateInput) {
        dateInput.value = '';
    }
    
    // Re-enable ID generation buttons
    const generateCustomerIdBtn = document.querySelector('button[onclick="generateAndSetCustomerId()"]');
    const generateReferralIdBtn = document.querySelector('button[onclick="generateAndSetReferralId()"]');
    
    if (generateCustomerIdBtn) {
        generateCustomerIdBtn.disabled = false;
        generateCustomerIdBtn.classList.remove('disabled-button');
    }
    
    if (generateReferralIdBtn) {
        generateReferralIdBtn.disabled = false;
        generateReferralIdBtn.classList.remove('disabled-button');
    }
    
    clearProductSection();
    window.products = [];
    updateTotal();
}

// Add click event listener to close dropdown when clicking outside
document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('search-results-dropdown');
    const searchBox = document.querySelector('.customer-search');
    
    if (!searchBox.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// UI Functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
        
        // If showing search transactions, load all transactions by default
        if (sectionId === 'search-transactions') {
            loadAllTransactionsForSearch();
        }
    }
}

async function loadAllTransactionsForSearch() {
    if (!db) {
        alert('Database not initialized. Please refresh the page.');
        return;
    }

    try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const results = await getAllRecords(store);
        
        console.log('All transactions:', results); // Debug log
        
        if (results && results.length > 0) {
            displaySearchResults(results, '');
        } else {
            const container = document.getElementById('search-results');
            if (container) {
                container.innerHTML = '<div class="alert alert-info">No transactions found. Create some transactions first.</div>';
            }
        }
    } catch (error) {
        console.error('Error loading all transactions:', error);
        showError('Failed to load transactions');
    }
}

async function handleNewTransaction(event) {
    if (!db) {
        alert('Database not initialized. Please refresh the page.');
        return;
    }

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

    // Generate unique ID using timestamp
    const transaction = {
        id: Date.now().toString(),
        customerName: document.getElementById('customerName').value,
        customerId: document.getElementById('customerId').value,
        referralId: document.getElementById('referralId').value,
        mobile: document.getElementById('mobile').value,
        referredBy: document.getElementById('referredBy').value,
        referredCustomerId1: document.getElementById('referredCustomerId1').value,
        referredCustomerId2: document.getElementById('referredCustomerId2').value,
        date: new Date().toISOString(),
        joinedDate: new Date().toISOString().split('T')[0],
        products: products,
        totalAmount: totalAmount,
        status: 'completed'
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

async function loadAllTransactions() {
    if (!db) {
        console.log('Database not initialized yet');
        return;
    }

    try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        const transactions = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });

        const container = document.getElementById('all-transactions');
        if (!container) {
            console.log('Container not found');
            return;
        }

        container.innerHTML = '';
        
        if (transactions.length === 0) {
            container.innerHTML = '<p>No transactions found</p>';
            return;
        }
        
        transactions.forEach(transaction => {
            const card = createTransactionCard(transaction);
            if (card) {
                container.appendChild(card);
            }
        });
    } catch (error) {
        console.error('Error loading transactions:', error);
        const container = document.getElementById('all-transactions');
        if (container) {
            container.innerHTML = '<p>Error loading transactions</p>';
        }
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

function createTransactionCard(transaction) {
    if (!transaction) {
        console.log('Invalid transaction data');
        return null;
    }

    const card = document.createElement('div');
    card.className = 'transaction-card';
    
    try {
        card.innerHTML = `
            <div class="transaction-header">
                <h3>${transaction.customerName || 'Unknown Customer'}</h3>
                <span class="transaction-date">${formatDate(transaction.date)}</span>
            </div>
            <div class="transaction-details">
                <p><strong>Customer ID:</strong> ${transaction.customerId || 'N/A'}</p>
                <p><strong>Mobile:</strong> ${transaction.mobile || 'N/A'}</p>
                <p><strong>Total Amount:</strong> ₹${(transaction.totalAmount || 0).toFixed(2)}</p>
            </div>
            <div class="transaction-actions">
                <button onclick="viewTransaction('${transaction.id}')" class="btn btn-sm btn-info">View Details</button>
            </div>
        `;
        return card;
    } catch (error) {
        console.error('Error creating transaction card:', error);
        return null;
    }
}

// Customer Search Functions for New Transaction
let searchTimeout = null;

function handleSearchInput() {
    const searchValue = document.getElementById('customer-search-input').value.trim();
    const dropdown = document.getElementById('search-results-dropdown');
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Hide dropdown if search is empty
    if (!searchValue) {
        dropdown.classList.add('hidden');
        return;
    }
    
    // Set new timeout for debouncing
    searchTimeout = setTimeout(() => {
        searchCustomerForNewTransaction(searchValue);
    }, 300); // Wait 300ms after user stops typing
}

async function searchCustomerForNewTransaction(searchValue) {
    if (!db) {
        alert('Database not initialized. Please refresh the page.');
        return;
    }

    if (!searchValue) return;

    const searchType = document.getElementById('search-type').value;
    
    try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        let results = [];

        // Get all records first
        const allRecords = await getAllRecords(store);

        if (searchType === 'all') {
            // Filter records across all searchable fields
            results = allRecords.filter(record => {
                const searchLower = searchValue.toLowerCase();
                return (
                    (record.customerName && record.customerName.toLowerCase().includes(searchLower)) ||
                    (record.customerId && record.customerId.toLowerCase().includes(searchLower)) ||
                    (record.mobile && record.mobile.toLowerCase().includes(searchLower)) ||
                    (record.referralId && record.referralId.toLowerCase().includes(searchLower))
                );
            });
        } else {
            // Filter by specific field
            results = allRecords.filter(record => {
                const fieldValue = record[searchType];
                return fieldValue && fieldValue.toLowerCase().includes(searchValue.toLowerCase());
            });
        }

        // Sort results by relevance
        results.sort((a, b) => {
            const aValue = a[searchType === 'all' ? 'customerName' : searchType]?.toLowerCase() || '';
            const bValue = b[searchType === 'all' ? 'customerName' : searchType]?.toLowerCase() || '';
            const searchLower = searchValue.toLowerCase();
            
            // Exact matches first
            if (aValue === searchLower && bValue !== searchLower) return -1;
            if (bValue === searchLower && aValue !== searchLower) return 1;
            
            // Starts with search term next
            if (aValue.startsWith(searchLower) && !bValue.startsWith(searchLower)) return -1;
            if (bValue.startsWith(searchLower) && !aValue.startsWith(searchLower)) return 1;
            
            // Alphabetical order for remaining results
            return aValue.localeCompare(bValue);
        });

        // Limit to top 10 results for performance
        results = results.slice(0, 10);
        
        displayCustomerSearchResults(results, searchValue);
    } catch (error) {
        console.error('Search error:', error);
        // Show error in the dropdown instead of alert
        const dropdown = document.getElementById('search-results-dropdown');
        dropdown.innerHTML = '<div class="search-result-item error">Error searching. Please try again.</div>';
        dropdown.classList.remove('hidden');
    }
}

function displayCustomerSearchResults(results, searchValue) {
    const dropdown = document.getElementById('search-results-dropdown');
    dropdown.innerHTML = '';

    if (results.length === 0) {
        dropdown.innerHTML = '<div class="search-result-item">No matching customers found</div>';
        dropdown.classList.remove('hidden');
        return;
    }

    results.forEach(customer => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        
        // Show only essential information
        div.innerHTML = `
            <div class="customer-info">
                <div>
                    <strong>${highlightMatch(customer.customerName, searchValue)}</strong><br>
                    <span class="text-muted">ID: ${highlightMatch(customer.customerId, searchValue)}</span><br>
                    <span class="text-muted">Mobile: ${highlightMatch(customer.mobile, searchValue)}</span><br>
                    <span class="text-muted">Ref ID: ${highlightMatch(customer.referralId || '', searchValue)}</span>
                </div>
                <button class="btn btn-sm btn-primary select-customer">Select</button>
            </div>
        `;

        // Add click handler for the select button
        const selectBtn = div.querySelector('.select-customer');
        selectBtn.addEventListener('click', () => {
            loadCustomerDetails(customer);
            dropdown.classList.add('hidden');
        });

        dropdown.appendChild(div);
    });

    dropdown.classList.remove('hidden');
}

function loadCustomerDetails(customer) {
    // Fill in the customer details and make them readonly
    const fields = [
        'customerName',
        'customerId',
        'mobile',
        'referralId',
        'referredBy',
        'referredCustomerId1',
        'referredCustomerId2'
    ];
    
    fields.forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            input.value = customer[field] || '';
            input.readOnly = true;
            input.classList.add('readonly-input');
        }
    });

    // Store customer ID for later use
    document.getElementById('transaction-form').dataset.customerId = customer.id;
    
    // Disable ID generation buttons
    const generateCustomerIdBtn = document.querySelector('button[onclick="generateAndSetCustomerId()"]');
    const generateReferralIdBtn = document.querySelector('button[onclick="generateAndSetReferralId()"]');
    
    if (generateCustomerIdBtn) {
        generateCustomerIdBtn.disabled = true;
        generateCustomerIdBtn.classList.add('disabled-button');
    }
    
    if (generateReferralIdBtn) {
        generateReferralIdBtn.disabled = true;
        generateReferralIdBtn.classList.add('disabled-button');
    }
    
    // Clear and enable product section
    clearProductSection();
    enableProductSection();
}

function clearProductSection() {
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        productsContainer.innerHTML = '';
    }
    window.products = [];
    updateTotal();
}

function enableProductSection() {
    const addProductButton = document.querySelector('button[onclick="addProductEntry()"]');
    if (addProductButton) {
        addProductButton.disabled = false;
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDB();
        console.log('Database initialized, loading transactions...');
        await loadAllTransactions();
        // Load initial data
        loadAllTransactionsForSearch();
        
        // Add event listeners when the page loads
        // Add event listener for search button
        const searchButton = document.querySelector('#search-transactions button');
        if (searchButton) {
            searchButton.addEventListener('click', searchTransactions);
        }
        
        // Add event listener for search input (optional: search as you type)
        const searchInput = document.querySelector('#search-input');
        if (searchInput) {
            searchInput.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {
                    searchTransactions();
                }
            });
        }
        
        // Add event listener for customer search input
        const customerSearchInput = document.getElementById('customer-search-input');
        if (customerSearchInput) {
            customerSearchInput.addEventListener('input', handleSearchInput);
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});
