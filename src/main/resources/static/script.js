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
    
    // Create object store for transactions if it doesn't exist
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        
        // Create indexes for transaction search
        store.createIndex('customerName', 'customerName', { unique: false });
        store.createIndex('customerId', 'customerId', { unique: false });
        store.createIndex('mobile', 'mobile', { unique: false });
        store.createIndex('referralId', 'referralId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('amount', 'amount', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        
        // Compound indexes for better search
        store.createIndex('customer_date', ['customerName', 'date'], { unique: false });
        store.createIndex('customer_amount', ['customerName', 'amount'], { unique: false });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    console.log('IndexedDB connected successfully');
};

// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initDB();
    
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
});

async function searchTransactions() {
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
                <button class="btn btn-sm btn-primary" onclick="viewTransaction('${transaction.id}')">View Details</button>
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

function viewTransaction(transactionId) {
    try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(transactionId);

        request.onsuccess = function(event) {
            const transactionData = event.target.result;
            if (transactionData) {
                showTransactionDetails(transactionData);
            } else {
                showError('Transaction not found');
            }
        };

        request.onerror = function(event) {
            console.error('Error loading transaction:', event.target.error);
            showError('Failed to load transaction details');
        };
    } catch (error) {
        console.error('Error viewing transaction:', error);
        showError('Failed to view transaction details');
    }
}

function showTransactionDetails(transaction) {
    // Create modal for transaction details
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Transaction Details</h2>
            <div class="transaction-info">
                <p><strong>Date:</strong> ${new Date(transaction.date).toLocaleDateString()}</p>
                <p><strong>Customer Name:</strong> ${transaction.customerName}</p>
                <p><strong>Customer ID:</strong> ${transaction.customerId}</p>
                <p><strong>Mobile:</strong> ${transaction.mobile}</p>
                <p><strong>Status:</strong> <span class="status-badge ${transaction.status.toLowerCase()}">${transaction.status}</span></p>
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
                        ${transaction.products.map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.quantity}</td>
                                <td>₹${product.price.toFixed(2)}</td>
                                <td>₹${(product.quantity * product.price).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <h3>Total Amount: ₹${transaction.totalAmount.toFixed(2)}</h3>
            </div>
        </div>
    `;

    // Add close functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        document.body.removeChild(modal);
    };

    // Close when clicking outside the modal
    modal.onclick = function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    };

    document.body.appendChild(modal);
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

    // Get the date from input or use current date if empty
    const dateInput = document.getElementById('transactionDate');
    let transactionDate;
    
    if (dateInput.value) {
        // If user provided a date, use it
        transactionDate = new Date(dateInput.value);
        // Set time to noon to avoid timezone issues
        transactionDate.setHours(12, 0, 0, 0);
    } else {
        // If no date provided, use current date
        transactionDate = new Date();
        transactionDate.setHours(12, 0, 0, 0);
        // Also update the input field with today's date
        dateInput.value = transactionDate.toISOString().split('T')[0];
    }

    const transaction = {
        customerName: document.getElementById('customerName').value,
        customerId: document.getElementById('customerId').value,
        referralId: document.getElementById('referralId').value,
        mobile: document.getElementById('mobile').value,
        referredBy: document.getElementById('referredBy').value,
        referredCustomerId1: document.getElementById('referredCustomerId1').value,
        referredCustomerId2: document.getElementById('referredCustomerId2').value,
        date: transactionDate.toISOString(),
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

function createTransactionCard(transaction) {
    const card = document.createElement('div');
    card.className = 'transaction-card';
    
    let productsHtml = '<div class="product-list">';
    transaction.products.forEach(product => {
        productsHtml += `
            <div class="product-item">
                <span>${product.name}</span>
                <span>${product.quantity} × ₹${product.price.toFixed(2)}</span>
                <span>₹${(product.quantity * product.price).toFixed(2)}</span>
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
