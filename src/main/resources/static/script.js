// Global variables
const API_BASE_URL = '/api/transactions';

/**
 * Initialize page
 * This function is called when the page loads
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadAllTransactions();
        
        // Add event listeners
        const searchButton = document.querySelector('#search-transactions button');
        if (searchButton) {
            searchButton.addEventListener('click', handleSearchButtonClick);
        }
        
        const searchInput = document.querySelector('#search-input');
        if (searchInput) {
            searchInput.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {
                    handleSearchButtonClick();
                }
            });
        }
        
        const customerSearchInput = document.getElementById('customer-search-input');
        if (customerSearchInput) {
            customerSearchInput.addEventListener('input', handleSearchInput);
        }
        
        // Add event listener for new transaction form submission
        const newTransactionForm = document.getElementById('transaction-form');
        if (newTransactionForm) {
            newTransactionForm.addEventListener('submit', handleNewTransaction);
        }
        
        // Add event listener for clear database button
        const clearDatabaseButton = document.querySelector('.clear-data-container > .warning-button');
        if (clearDatabaseButton) {
            clearDatabaseButton.addEventListener('click', showClearConfirmation);
        }
        
        // Add event listener for cancel clear button
        const cancelClearButton = document.getElementById('cancel-clear');
        if (cancelClearButton) {
            cancelClearButton.addEventListener('click', cancelClear);
        }
        
        // Add event listener for confirm clear button
        const confirmClearButton = document.getElementById('confirm-clear');
        if (confirmClearButton) {
            confirmClearButton.addEventListener('click', clearDatabase);
        }
        
        // Add event listener for add product entry button
        const addProductEntryButton = document.getElementById('add-product-entry');
        if (addProductEntryButton) {
            addProductEntryButton.addEventListener('click', addProductEntry);
        }
        
        // Add event listener for remove product entry button
        const removeProductEntryButtons = document.querySelectorAll('.remove-product-entry');
        if (removeProductEntryButtons) {
            removeProductEntryButtons.forEach(button => {
                button.addEventListener('click', removeProductEntry);
            });
        }
        
        // Add event listener for update total button
        const updateTotalButton = document.getElementById('update-total');
        if (updateTotalButton) {
            updateTotalButton.addEventListener('click', updateTotal);
        }
        
        // Add event listener for generate customer ID button
        const generateCustomerIdButton = document.getElementById('generate-customer-id');
        if (generateCustomerIdButton) {
            generateCustomerIdButton.addEventListener('click', generateAndSetCustomerId);
        }
        
        // Add event listener for generate referral ID button
        const generateReferralIdButton = document.getElementById('generate-referral-id');
        if (generateReferralIdButton) {
            generateReferralIdButton.addEventListener('click', generateAndSetReferralId);
        }
        
        // Add event listener for reset form button
        const resetFormButton = document.getElementById('reset-form');
        if (resetFormButton) {
            resetFormButton.addEventListener('click', resetForm);
        }
        
        // Add event listener for show section button
        const showSectionButtons = document.querySelectorAll('.show-section');
        if (showSectionButtons) {
            showSectionButtons.forEach(button => {
                button.addEventListener('click', () => {
                    showSection(button.dataset.section);
                });
            });
        }
        
        // Add event listener for load all transactions button
        const loadAllTransactionsButton = document.getElementById('load-all-transactions');
        if (loadAllTransactionsButton) {
            loadAllTransactionsButton.addEventListener('click', loadAllTransactions);
        }
        
        // Add event listener for view transaction button
        const viewTransactionButtons = document.querySelectorAll('.view-transaction');
        if (viewTransactionButtons) {
            viewTransactionButtons.forEach(button => {
                button.addEventListener('click', () => {
                    viewTransaction(button.dataset.transactionId);
                });
            });
        }
        
        // Add event listener for show customer details button
        const showCustomerDetailsButtons = document.querySelectorAll('.show-customer-details');
        if (showCustomerDetailsButtons) {
            showCustomerDetailsButtons.forEach(button => {
                button.addEventListener('click', () => {
                    showCustomerDetails(button.dataset.customerId);
                });
            });
        }
        
        // Add event listener for close modal button
        const closeModalButtons = document.querySelectorAll('.close-modal');
        if (closeModalButtons) {
            closeModalButtons.forEach(button => {
                button.addEventListener('click', closeModal);
            });
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

/**
 * Load all transactions
 * This function loads all transactions from the API and displays them on the page
 */
async function loadAllTransactions() {
    try {
        const transactions = await getAllTransactions();
        const container = document.getElementById('all-transactions');
        
        if (!container) {
            console.error('Transactions container not found');
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

/**
 * Create transaction card
 * This function creates a transaction card element from a transaction object
 * @param {Object} transaction - Transaction object
 * @returns {HTMLElement} Transaction card element
 */
function createTransactionCard(transaction) {
    if (!transaction) return null;

    const card = document.createElement('div');
    card.className = 'transaction-card';
    
    try {
        card.innerHTML = `
            <div class="transaction-header">
                <h3>${transaction.customerName || 'Unknown Customer'}</h3>
                <span class="transaction-date">${formatDate(transaction.joinedDate)}</span>
            </div>
            <div class="transaction-details">
                <p><strong>Customer ID:</strong> ${transaction.customerId || 'N/A'}</p>
                <p><strong>Mobile:</strong> ${transaction.mobile || 'N/A'}</p>
                <p><strong>Referral ID:</strong> ${transaction.referralId || 'N/A'}</p>
            </div>
            <div class="transaction-actions">
                <button onclick="showCustomerDetails('${transaction.customerId}')" class="btn btn-sm btn-info">View Details</button>
            </div>
        `;
        return card;
    } catch (error) {
        console.error('Error creating transaction card:', error);
        return null;
    }
}

/**
 * Show customer details
 * This function shows the customer details modal for a given customer ID
 * @param {string} customerId - Customer ID
 */
async function showCustomerDetails(customerId) {
    try {
        const transactions = await getCustomerTransactions(customerId);
        
        if (!transactions || transactions.length === 0) {
            alert('No transactions found for this customer');
            return;
        }

        // Sort transactions by date (newest first)
        transactions.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));

        // Calculate total amount spent
        const totalSpent = transactions.reduce((sum, t) => sum + (parseFloat(t.totalAmount) || 0), 0);

        // Get customer info from first transaction
        const customer = transactions[0];

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
                <p><strong>Referral ID:</strong> ${customer.referralId || 'N/A'}</p>
                ${customer.referredBy ? `<p><strong>Referred By:</strong> ${customer.referredBy}</p>` : ''}
            </div>
            <div class="transaction-history">
                <h3>Transaction History</h3>
                <div class="transaction-list">
                    ${transactions.map(t => `
                        <div class="transaction-item">
                            <div class="transaction-header">
                                <span class="date">${formatDate(t.joinedDate)}</span>
                                <span class="amount">₹${(parseFloat(t.totalAmount) || 0).toFixed(2)}</span>
                            </div>
                            ${t.details ? `
                                <div class="products-list">
                                    ${t.details.map(p => `
                                        <div class="product-item">
                                            <span>${p.productName}</span>
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

        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = '';
        modalContainer.appendChild(modalContent);
        modalContainer.style.display = 'flex';

    } catch (error) {
        console.error('Error showing customer details:', error);
        alert('Error loading customer details. Please try again.');
    }
}

/**
 * Close modal
 * This function closes the modal
 */
function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.style.display = 'none';
        modalContainer.innerHTML = '';
    }
}

/**
 * Clear database
 * This function clears the database
 */
async function clearDatabase() {
    const confirmInput = document.getElementById('clear-confirmation');
    const confirmText = confirmInput.value.toLowerCase().trim();
    
    if (confirmText !== 'clear') {
        alert("Please type 'clear' to confirm data deletion");
        return;
    }

    if (!confirm('WARNING: This will delete all transaction data. This action cannot be undone. Are you sure?')) {
        cancelClear();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/clear`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to clear database');
        }

        alert('Database cleared successfully. The page will now reload.');
        window.location.reload();
    } catch (error) {
        console.error('Error clearing database:', error);
        alert('Error clearing database. Please try again.');
        cancelClear();
    }
}

/**
 * Show clear confirmation
 * This function shows the clear confirmation modal
 */
function showClearConfirmation() {
    const clearButton = document.querySelector('.clear-data-container > .warning-button');
    const confirmationBox = document.getElementById('clear-confirmation-box');
    clearButton.style.display = 'none';
    confirmationBox.classList.remove('hidden');
    document.getElementById('clear-confirmation').value = '';
    document.getElementById('clear-confirmation').focus();
}

/**
 * Cancel clear
 * This function cancels the clear operation
 */
function cancelClear() {
    const clearButton = document.querySelector('.clear-data-container > .warning-button');
    const confirmationBox = document.getElementById('clear-confirmation-box');
    clearButton.style.display = 'block';
    confirmationBox.classList.add('hidden');
}

/**
 * Handle new transaction form submission
 * This function handles the new transaction form submission
 * @param {Event} event - Form submission event
 */
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
        // Save to API
        await saveTransaction(transaction);
        
        alert('Transaction created successfully!');
        event.target.reset();
        document.getElementById('products-container').innerHTML = '';
        document.getElementById('total-amount').textContent = '₹0.00';
        loadAllTransactions();
    } catch (error) {
        console.error('Error creating transaction:', error);
        alert('Error creating transaction. Please try again.');
    }
}

/**
 * Add product entry
 * This function adds a new product entry to the form
 */
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

/**
 * Remove product entry
 * This function removes a product entry from the form
 * @param {HTMLElement} button - Remove button element
 */
function removeProductEntry(button) {
    button.parentElement.remove();
    updateTotal();
}

/**
 * Update total
 * This function updates the total amount
 */
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

/**
 * Generate and set customer ID
 * This function generates a new customer ID and sets it in the form
 */
async function generateAndSetCustomerId() {
    try {
        const customerId = await generateCustomerId();
        document.getElementById('customerId').value = customerId;
    } catch (error) {
        console.error('Error generating customer ID:', error);
        alert('Error generating customer ID. Please try again.');
    }
}

/**
 * Generate and set referral ID
 * This function generates a new referral ID and sets it in the form
 */
async function generateAndSetReferralId() {
    try {
        const referralId = await generateReferralId();
        document.getElementById('referralId').value = referralId;
    } catch (error) {
        console.error('Error generating referral ID:', error);
        alert('Error generating referral ID. Please try again.');
    }
}

/**
 * Reset form
 * This function resets the form
 */
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

/**
 * Clear product section
 * This function clears the product section
 */
function clearProductSection() {
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        productsContainer.innerHTML = '';
    }
    window.products = [];
    updateTotal();
}

/**
 * Enable product section
 * This function enables the product section
 */
function enableProductSection() {
    const addProductButton = document.querySelector('button[onclick="addProductEntry()"]');
    if (addProductButton) {
        addProductButton.disabled = false;
    }
}

/**
 * Show section
 * This function shows a section
 * @param {string} sectionId - Section ID
 */
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
    }
}

/**
 * Handle search input
 * This function handles the search input
 */
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

/**
 * Search customer for new transaction
 * This function searches for a customer for a new transaction
 * @param {string} searchValue - Search value
 */
async function searchCustomerForNewTransaction(searchValue) {
    if (!searchValue) return;

    const searchType = document.getElementById('search-type').value;
    
    try {
        let endpoint;
        switch(searchType) {
            case 'customerId':
                endpoint = `${API_BASE_URL}/customer/${searchValue}`;
                break;
            case 'customerName':
                endpoint = `${API_BASE_URL}/customer/name/${searchValue}`;
                break;
            case 'mobile':
                endpoint = `${API_BASE_URL}/mobile/${searchValue}`;
                break;
            case 'referralId':
                endpoint = `${API_BASE_URL}/referral/${searchValue}`;
                break;
            default:
                endpoint = `${API_BASE_URL}/search?query=${encodeURIComponent(searchValue)}`;
        }

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to search customers');
        }
        
        const customers = await response.json();
        
        // Sort results by relevance
        customers.sort((a, b) => {
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
        const limitedCustomers = customers.slice(0, 10);
        
        displayCustomerSearchResults(limitedCustomers, searchValue);
    } catch (error) {
        console.error('Search error:', error);
        // Show error in the dropdown instead of alert
        const dropdown = document.getElementById('search-results-dropdown');
        dropdown.innerHTML = '<div class="search-result-item error">Error searching. Please try again.</div>';
        dropdown.classList.remove('hidden');
    }
}

/**
 * Display customer search results
 * This function displays the customer search results
 * @param {Array} customers - Customer array
 * @param {string} searchValue - Search value
 */
function displayCustomerSearchResults(customers, searchValue) {
    const dropdown = document.getElementById('search-results-dropdown');
    dropdown.innerHTML = '';

    if (customers.length === 0) {
        dropdown.innerHTML = '<div class="search-result-item">No matching customers found</div>';
        dropdown.classList.remove('hidden');
        return;
    }

    customers.forEach(customer => {
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

/**
 * Highlight match
 * This function highlights the match in the search result
 * @param {string} text - Text to highlight
 * @param {string} searchValue - Search value
 * @returns {string} Highlighted text
 */
function highlightMatch(text, searchValue) {
    if (!searchValue || !text) return text || '';
    
    const regex = new RegExp(searchValue, 'gi');
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
}

/**
 * Load customer details
 * This function loads the customer details
 * @param {Object} customer - Customer object
 */
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

/**
 * Save transaction
 * This function saves a transaction to the API
 * @param {Object} transaction - Transaction object
 * @returns {Promise} Promise that resolves when the transaction is saved
 */
async function saveTransaction(transaction) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transaction)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save transaction');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error saving transaction:', error);
        throw error;
    }
}

/**
 * Get all transactions
 * This function gets all transactions from the API
 * @returns {Promise} Promise that resolves with an array of transactions
 */
async function getAllTransactions() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

/**
 * Search transactions
 * This function searches for transactions in the API
 * @param {Object} params - Search parameters
 * @returns {Promise} Promise that resolves with an array of transactions
 */
async function searchTransactions(params = {}) {
    try {
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`${API_BASE_URL}/search?${queryParams}`);
        if (!response.ok) {
            throw new Error('Failed to search transactions');
        }
        return await response.json();
    } catch (error) {
        console.error('Error searching transactions:', error);
        return [];
    }
}

/**
 * Get customer transactions
 * This function gets the transactions for a customer from the API
 * @param {string} customerId - Customer ID
 * @returns {Promise} Promise that resolves with an array of transactions
 */
async function getCustomerTransactions(customerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/customer/${customerId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch customer transactions');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching customer transactions:', error);
        return [];
    }
}

/**
 * Generate customer ID
 * This function generates a new customer ID from the API
 * @returns {Promise} Promise that resolves with the new customer ID
 */
async function generateCustomerId() {
    try {
        const response = await fetch(`${API_BASE_URL}/generate/customerId`, {
            method: 'GET',
            headers: {
                'Accept': 'text/plain'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to generate customer ID');
        }
        const id = await response.text();
        return id;
    } catch (error) {
        console.error('Error generating customer ID:', error);
        throw error;
    }
}

/**
 * Generate referral ID
 * This function generates a new referral ID from the API
 * @returns {Promise} Promise that resolves with the new referral ID
 */
async function generateReferralId() {
    try {
        const response = await fetch(`${API_BASE_URL}/generate/referralId`, {
            method: 'GET',
            headers: {
                'Accept': 'text/plain'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to generate referral ID');
        }
        const id = await response.text();
        return id;
    } catch (error) {
        console.error('Error generating referral ID:', error);
        throw error;
    }
}

/**
 * Format date
 * This function formats a date string
 * @param {string} dateString - Date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

/**
 * Handle search button click
 * This function handles the search button click event
 */
async function handleSearchButtonClick() {
    const searchInput = document.querySelector('#search-input');
    const searchType = document.querySelector('#search-type');
    const searchResults = document.querySelector('#search-results');
    
    if (!searchInput || !searchType || !searchResults) {
        console.error('Required search elements not found');
        return;
    }

    const searchValue = searchInput.value.trim();
    const searchTypeValue = searchType.value;

    if (!searchValue) {
        searchResults.innerHTML = '<p>Please enter a search term</p>';
        return;
    }

    try {
        let endpoint;
        switch(searchTypeValue) {
            case 'customerId':
                endpoint = `${API_BASE_URL}/customer/${encodeURIComponent(searchValue)}`;
                break;
            case 'customerName':
                endpoint = `${API_BASE_URL}/customer/name/${encodeURIComponent(searchValue)}`;
                break;
            case 'mobile':
                endpoint = `${API_BASE_URL}/mobile/${encodeURIComponent(searchValue)}`;
                break;
            case 'referralId':
                endpoint = `${API_BASE_URL}/referral/${encodeURIComponent(searchValue)}`;
                break;
            default:
                endpoint = `${API_BASE_URL}/search?query=${encodeURIComponent(searchValue)}`;
        }

        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Search failed');
        }

        const transactions = await response.json();
        displaySearchResults(transactions);
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = '<p class="error">Error occurred while searching. Please try again.</p>';
    }
}

/**
 * Display search results
 * This function displays the search results
 * @param {Array} transactions - Transaction array
 */
function displaySearchResults(transactions) {
    const searchResults = document.querySelector('#search-results');
    if (!searchResults) return;

    if (!transactions || transactions.length === 0) {
        searchResults.innerHTML = '<p>No results found</p>';
        return;
    }

    const resultsHtml = transactions.map(transaction => `
        <div class="transaction-card">
            <div class="transaction-header">
                <h3>Customer: ${transaction.customerName}</h3>
                <span class="customer-id">ID: ${transaction.customerId}</span>
            </div>
            <div class="transaction-details">
                <p>Mobile: ${transaction.mobile || 'N/A'}</p>
                <p>Referral ID: ${transaction.referralId || 'N/A'}</p>
                <p>Date: ${formatDate(transaction.joinedDate)}</p>
            </div>
            <div class="transaction-actions">
                <button onclick="viewTransaction('${transaction.id}')" class="view-btn">View Details</button>
            </div>
        </div>
    `).join('');

    searchResults.innerHTML = resultsHtml;
}
