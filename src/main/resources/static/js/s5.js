
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
    
    UserId = customer['id'];
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
    
    if (generateReferralIdBtn && customer['referralId']) {
        generateReferralIdBtn.disabled = true;
        generateReferralIdBtn.classList.add('disabled-button');
    }
    
    // Clear and enable product section
    clearProductSection();
    enableProductSection();
}
