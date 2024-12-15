
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
            productName: entry.querySelector('input[name="productName[]"]').value,
            quantity: parseInt(entry.querySelector('input[name="quantity[]"]').value),
            amount: parseFloat(entry.querySelector('input[name="amount[]"]').value)
        };
        products.push(product);
        totalAmount += product.quantity * product.amount;
    });

    var transaction = {
        customerName: document.getElementById('customerName').value || null,
        customerId: document.getElementById('customerId').value || null,
        mobile: document.getElementById('mobile').value || null,
        referralId: document.getElementById('referralId').value || null,
        referredBy: document.getElementById('referredBy').value || null,
        referredCustomerId1: document.getElementById('referredCustomerId1').value || null,
        referredCustomerId2: document.getElementById('referredCustomerId2').value || null,
        date: fetchDate().toISOString(),
        totalAmount: totalAmount,
        totalCost:document.getElementById('cost[]').value || totalAmount*(COST_RATE/100),
        details: products || null
    };

    if(UserId != null){
        transaction.id = UserId;
        UserId = null;
    }

    if (products.length === 0) {
        alert('Please add at least one product to the transaction.');
        return;
    }

    try {
        // Save to API
        await saveTransaction(transaction).then(res => {
            if(res == null){
                alert("transaction failed");
            }
            else{
                alert('Transaction created successfully!');
                event.target.reset();
                document.getElementById('products-container').innerHTML = '';
                document.getElementById('total-amount').textContent = '₹0.00';
                loadAllTransactions();
            }
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        alert('Error creating transaction. Please try again.');
    }
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
        
        
        if (!response.ok || response.status != 200) {
            console.log("------------------err1-------------------")
            alert((await response.text()).toString());
        }else{
            return await response;
        }
        return null;

    } catch (error) {
        console.log("------------------err2-------------------")
        console.error('Error saving transaction:', error);
        throw error;
    }
}

function fetchDate(){
    let d = document.getElementById("transactionDate").value;
    if (d === '')
        return new Date();
    else
        return new Date(d);
}