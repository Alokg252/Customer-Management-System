
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
        document.querySelector('button[onclick="generateAndSetReferralId()"]').disabled = true;
        document.querySelector('button[onclick="generateAndSetReferralId()"]').style.backgroundColor = "#bbb";
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
    let day = date.getDate();
    let month = date.getMonth()+1; // starts from 0
    let year = date.getFullYear();
    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;
    // return date.toLocaleDateString();
    return `${day}/${month}/${year}`;
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
                <p>Date: ${formatDate(transaction.date)}</p>
            </div>
            <div class="transaction-actions">
                <button onclick="showCustomerDetails('${transaction.customerId}','customer')" class="view-btn">View Details</button>
                &nbsp;<button onclick="editCustomerDetails('${transaction.customerId}','customer')" class="edit-btn">Edit Details</button>
            </div>
        </div>
    `).join('');

    searchResults.innerHTML = resultsHtml;
}
