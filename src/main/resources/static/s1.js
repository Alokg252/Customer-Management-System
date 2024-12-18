
/**
 * Load all transactions
 * This function loads all transactions from the API and displays them on the page
 */
async function loadAllTransactions(sort = "date") {
    try {
        const transactions = await getAllTransactions();
        console.log(transactions);
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

        // short total spent

        switch (sort) {
            case "totalAmount":
                transactions.sort((a,b)=> b.totalAmount - a.totalAmount);
                break;
            case "totalCost":
                transactions.sort((a,b)=> b.totalCost - a.totalCost);
                break;
            case "totalEarn":
                transactions.sort((a,b)=> (b.totalAmount - b.totalCost) - (a.totalAmount - a.totalCost));
                break;
            case "avgord":
                transactions.sort((a,b)=> (b.totalAmount / b.occurance) - (a.totalAmount / a.occurance));
                break;
            case "visited":
                transactions.sort((a,b)=> b.occurance - a.occurance);
                break;
            default:
                transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }


        transactions.forEach(transaction => {
            const card = createTransactionCard(transaction);
            if (card) {
                if(SHORT_ORD==1){
                    container.prepend(card);
                }
                else{
                    container.appendChild(card);
                }
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
                <span class="transaction-date">${formatDate(transaction.date)}</span>
            </div>
            <div class="transaction-details">
                <p><strong>Customer ID:</strong> ${transaction.customerId || 'N/A'}</p>
                <p><strong>Mobile:</strong> ${transaction.mobile || 'N/A'}</p>
                <p><strong>Referral ID:</strong> ${transaction.referralId || 'N/A'}</p>
            </div>
            <div class="transaction-actions">
                <button onclick="showCustomerDetails('${transaction.customerId}', 'customer')" class="btn btn-sm btn-info">View Details</button>
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
async function showCustomerDetails(Id, field) {
    try {
        const transactions = await getCustomerTransactions(Id, field);
        
        if (!transactions || transactions.length === 0) {
            alert('No transactions found for this customer');
            return;
        }

        // Sort transactions by date (newest first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Calculate total amount spent
        const totalSpent = transactions.reduce((sum, t) => sum + (parseFloat(t.totalAmount) || 0), 0);
        const totalCosting = transactions.reduce((sum, t) => sum + (parseFloat(t.totalCost) || 0), 0);

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
                <p><strong>Mobile:</strong> ${customer.mobile || 'N/A'}</p>
                <p><strong>Customer ID:</strong> ${customer.customerId || 'N/A'}</p>
                ${customer.referralId ? `<p><strong>Referral ID:</strong> ${customer.referralId}</p>` : ''}
                <p><strong>Total Spent:</strong> ₹${totalSpent.toFixed(2)}</p>
                <p><strong>Total Costs:</strong> ₹${totalCosting.toFixed(2)}</p>
                <p><strong>Total Earning:</strong> ₹${(totalSpent-totalCosting).toFixed(2)}</p>
                <p><strong>Avg.Ord. Value:</strong> ₹${(totalSpent/customer.occurance).toFixed(2)}</p>
                <p><strong>Visited:</strong> ${customer.occurance} times</p>
                <p><strong>Last Visited:</strong> ${new Date(customer.date).toLocaleString() || 'N/A'}</p>
                ${customer.referredBy ? `<p><strong>Referred By:</strong> ${customer.referredBy} &nbsp; <button onclick="showCustomerDetails('${customer.referredBy}', 'referral')" id="detail-btn">View Details</button></p>` : ''}
                ${customer.referredCustomerId2 ? `<p><strong>Referred Customer 2:</strong> ${customer.referredCustomerId2} &nbsp; <button onclick="showCustomerDetails('${customer.referredCustomerId2}', 'customer')" id="detail-btn">View Details</button></p>` : ''}
                ${customer.referredCustomerId1 ? `<p><strong>Referred Customer 1:</strong> ${customer.referredCustomerId1} &nbsp; <button onclick="showCustomerDetails('${customer.referredCustomerId1}', 'customer')" id="detail-btn">View Details</button></p>` : ''}
            </div>
            <div class="transaction-history">
                <h3>Transaction History</h3>
                <div class="transaction-list">
                    ${transactions.map(t => `
                        <div class="transaction-item">
                            ${t.details ? `
                                <div class="products-list">
                                    ${t.details.map(p => `
                                        <div class="product-item">
                                            <span>${p.productName}</span>
                                            <span>${p.quantity} × ₹${parseFloat(p.amount).toFixed(2)}</span>
                                            <span>${new Date(p.date).toLocaleString()}</span>
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
 * Show customer details
 * This function shows the customer details modal for a given customer ID
 * @param {string} customerId - Customer ID
 */
async function editCustomerDetails(Id, field) {
    try {
        const transactions = await getCustomerTransactions(Id, field);
        
        if (!transactions || transactions.length === 0) {
            alert('No transactions found for this customer');
            return;
        }

        // Sort transactions by date (newest first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

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
                <p><strong>Name:</strong> <span contenteditable="true">${customer.customerName || 'N/A'}</span></p>
                <p><strong>Mobile:</strong> <span contenteditable="true">${customer.mobile || 'N/A'}</span></p>
            </div>
            <div class="transaction-history">
                <h3>Transaction History</h3>
                <div class="transaction-list">
                    ${transactions.map(t => `
                        <div class="transaction-item">
                            ${t.details ? `
                                <div class="products-list">
                                    ${t.details.map(p => `
                                        <div class="product-item">
                                            <span contenteditable="true">${p.productName}</span>
                                            <span contenteditable="true">${p.quantity} × ₹${parseFloat(p.amount).toFixed(2)}</span>
                                            <span contenteditable="true">${new Date(p.date).toLocaleString()}</span>
                                            <button type="button" id="remove-btn" onclick="removeProductEntry(this)">×</button>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                <br>
                <div><button>save</button></div>
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
