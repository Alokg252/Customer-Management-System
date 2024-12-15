
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
        console.log(queryParams);
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
async function getCustomerTransactions(Id, field) {
    try {
        const response = await fetch(`${API_BASE_URL}/${field}/${Id}`);
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
