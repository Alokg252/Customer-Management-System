
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
