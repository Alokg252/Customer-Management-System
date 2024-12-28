
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
    try {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
    } catch (error) {
        console.log(error);
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
