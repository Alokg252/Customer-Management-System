// Global variables
const API_BASE_URL = '/api/transactions';
var UserId = null;
var COST_RATE = 52;
var SHORT_ORD = 0;

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
        // const newTransactionForm = document.getElementById('transaction-form');
        // if (newTransactionForm) {
        //     newTransactionForm.addEventListener('submit', handleNewTransaction);
        // }
        
        
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
                    showCustomerDetails(button.dataset.transactionId,'transaction');
                });
            });
        }
        
        // Add event listener for show customer details button
        const showCustomerDetailsButtons = document.querySelectorAll('.show-customer-details');
        if (showCustomerDetailsButtons) {
            showCustomerDetailsButtons.forEach(button => {
                button.addEventListener('click', () => {
                    showCustomerDetails(button.dataset.customerId, 'customer');
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


