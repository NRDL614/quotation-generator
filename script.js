// Currency symbols map
const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
  IDR: 'Rp',
  CAD: 'C$',
  AUD: 'A$',
  CNY: '¥',
  RUB: '₽',
  BRL: 'R$'
};

// Initialize items array
let items = [];
let nextItemId = 1;

// Initialize form with default values when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Set default dates
  const today = new Date();
  const validUntil = new Date();
  validUntil.setDate(today.getDate() + 30);
  
  document.getElementById('quoteDate').valueAsDate = today;
  document.getElementById('validUntil').valueAsDate = validUntil;
  
  // Generate a default quote number
  const year = today.getFullYear();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  document.getElementById('quoteNumber').value = `QT-${year}-${randomNum}`;
  
  // Add first empty item
  addItem();
  
  // Setup event listeners
  setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
  // Company Info
  document.getElementById('companyName').addEventListener('input', updatePrintView);
  document.getElementById('companyAddress').addEventListener('input', updatePrintView);
  document.getElementById('companyPhone').addEventListener('input', updatePrintView);
  document.getElementById('companyEmail').addEventListener('input', updatePrintView);
  document.getElementById('companyWebsite').addEventListener('input', updatePrintView);
  
  // Client Info
  document.getElementById('clientName').addEventListener('input', updatePrintView);
  document.getElementById('clientContactPerson').addEventListener('input', updatePrintView);
  document.getElementById('clientEmail').addEventListener('input', updatePrintView);
  document.getElementById('clientPhone').addEventListener('input', updatePrintView);
  document.getElementById('clientAddress').addEventListener('input', updatePrintView);
  
  // Quote Details
  document.getElementById('quoteNumber').addEventListener('input', updatePrintView);
  document.getElementById('quoteDate').addEventListener('input', updatePrintView);
  document.getElementById('validUntil').addEventListener('input', updatePrintView);
  document.getElementById('paymentTerms').addEventListener('input', updatePrintView);
  document.getElementById('notes').addEventListener('input', updatePrintView);
  document.getElementById('currency').addEventListener('change', updateCurrency);
  
  // Logo Upload
  document.getElementById('logoUpload').addEventListener('change', handleLogoUpload);
  
  // Buttons
  document.getElementById('addItemButton').addEventListener('click', addItem);
  document.getElementById('generatePDFButton').addEventListener('click', generatePDF);
  document.getElementById('sendQuoteButton').addEventListener('click', sendQuote);
}

// Handle logo upload
function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (file && file.type.match('image.*')) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('companyLogo').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Add a new item to the table
function addItem() {
  const newItem = {
    id: nextItemId++,
    description: '',
    quantity: 1,
    unitPrice: 0,
    tax: 0,
    discount: 0,
    total: 0
  };
  
  items.push(newItem);
  renderItems();
}

// Remove an item from the table
function removeItem(id) {
  items = items.filter(item => item.id !== id);
  renderItems();
}

// Update item data when inputs change
function updateItem(id, field, value) {
  items = items.map(item => {
    if (item.id === id) {
      const updatedItem = { ...item, [field]: value };
      
      // Calculate total for this item
      const quantity = parseFloat(updatedItem.quantity) || 0;
      const unitPrice = parseFloat(updatedItem.unitPrice) || 0;
      const tax = parseFloat(updatedItem.tax) || 0;
      const discount = parseFloat(updatedItem.discount) || 0;
      
      const subtotal = quantity * unitPrice;
      const taxAmount = subtotal * (tax / 100);
      const discountAmount = subtotal * (discount / 100);
      updatedItem.total = subtotal + taxAmount - discountAmount;
      
      return updatedItem;
    }
    return item;
  });
  
  renderItems();
  calculateTotals();
}

// Render all items in the table
function renderItems() {
  const tableBody = document.getElementById('itemsTableBody');
  tableBody.innerHTML = '';
  
  items.forEach(item => {
    const row = document.createElement('tr');
    
    // Get currency symbol
    const currencySelect = document.getElementById('currency');
    const currencySymbol = currencySymbols[currencySelect.value];
    
    row.innerHTML = `
      <td class="border p-2">${item.id}</td>
      <td class="border p-2">
        <input
          type="text"
          class="w-full p-1 no-print"
          value="${item.description}"
          onchange="updateItem(${item.id}, 'description', this.value)"
        />
        <span class="show-print">${item.description}</span>
      </td>
      <td class="border p-2">
        <input
          type="number"
          class="w-16 p-1 no-print"
          value="${item.quantity}"
          onchange="updateItem(${item.id}, 'quantity', this.value)"
        />
        <span class="show-print">${item.quantity}</span>
      </td>
      <td class="border p-2">
        <input
          type="number"
          class="w-24 p-1 currency-input no-print"
          value="${item.unitPrice}"
          onchange="updateItem(${item.id}, 'unitPrice', this.value)"
        />
        <span class="show-print">${currencySymbol}${parseFloat(item.unitPrice).toFixed(2)}</span>
      </td>
      <td class="border p-2">
        <input
          type="number"
          class="w-16 p-1 no-print"
          value="${item.tax}"
          onchange="updateItem(${item.id}, 'tax', this.value)"
        />
        <span class="show-print">${item.tax}%</span>
      </td>
      <td class="border p-2">
        <input
          type="number"
          class="w-16 p-1 no-print"
          value="${item.discount}"
          onchange="updateItem(${item.id}, 'discount', this.value)"
        />
        <span class="show-print">${item.discount}%</span>
      </td>
      <td class="border p-2">${currencySymbol}${item.total.toFixed(2)}</td>
      <td class="border p-2 no-print">
        <button
          onclick="removeItem(${item.id})"
          class="btn btn-danger"
        >
          Remove
        </button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Calculate and update totals
function calculateTotals() {
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0), 0);
  const taxTotal = items.reduce((sum, item) => {
    const itemSubtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
    return sum + itemSubtotal * ((parseFloat(item.tax) || 0) / 100);
  }, 0);
  const discountTotal = items.reduce((sum, item) => {
    const itemSubtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
    return sum + itemSubtotal * ((parseFloat(item.discount) || 0) / 100);
  }, 0);
  const total = subtotal + taxTotal - discountTotal;
  
  // Get currency symbol
  const currencySelect = document.getElementById('currency');
  const currencySymbol = currencySymbols[currencySelect.value];
  
  // Update totals display
  document.getElementById('subtotal').textContent = `${currencySymbol}${subtotal.toFixed(2)}`;
  document.getElementById('tax').textContent = `${currencySymbol}${taxTotal.toFixed(2)}`;
  document.getElementById('discount').textContent = `${currencySymbol}${discountTotal.toFixed(2)}`;
  document.getElementById('total').textContent = `${currencySymbol}${total.toFixed(2)}`;
}

// Update currency symbol when currency changes
function updateCurrency() {
  renderItems();
  calculateTotals();
}

// Update the print view with current values
function updatePrintView() {
  // Company info
  document.getElementById('printCompanyName').textContent = document.getElementById('companyName').value;
  document.getElementById('printCompanyAddress').textContent = document.getElementById('companyAddress').value;
  document.getElementById('printCompanyPhone').textContent = document.getElementById('companyPhone').value;
  document.getElementById('printCompanyEmail').textContent = document.getElementById('companyEmail').value;
  document.getElementById('printCompanyWebsite').textContent = document.getElementById('companyWebsite').value;
  
  // Client info
  document.getElementById('printClientName').textContent = document.getElementById('clientName').value;
  document.getElementById('printClientContactPerson').textContent = document.getElementById('clientContactPerson').value;
  document.getElementById('printClientEmail').textContent = document.getElementById('clientEmail').value;
  document.getElementById('printClientPhone').textContent = document.getElementById('clientPhone').value;
  document.getElementById('printClientAddress').textContent = document.getElementById('clientAddress').value;
  
  // Quote details
  document.getElementById('printQuoteNumber').textContent = document.getElementById('quoteNumber').value;
  
  // Format dates
  const quoteDate = document.getElementById('quoteDate').valueAsDate;
  const validUntil = document.getElementById('validUntil').valueAsDate;
  
  if (quoteDate) {
    document.getElementById('printQuoteDate').textContent = quoteDate.toLocaleDateString();
  }
  
  if (validUntil) {
    document.getElementById('printValidUntil').textContent = validUntil.toLocaleDateString();
  }
  
  document.getElementById('printPaymentTerms').textContent = document.getElementById('paymentTerms').value;
  document.getElementById('printNotes').textContent = document.getElementById('notes').value;
}

// Generate PDF (uses browser print functionality)
function generatePDF() {
  // Show print elements and hide edit elements
  const printElements = document.querySelectorAll('.show-print');
  const noPrintElements = document.querySelectorAll('.no-print');
  
  printElements.forEach(el => el.classList.add('active-print'));
  noPrintElements.forEach(el => el.classList.add('hidden-print'));
  
  // Print
  window.print();
  
  // Restore display after printing
  printElements.forEach(el => el.classList.remove('active-print'));
  noPrintElements.forEach(el => el.classList.remove('hidden-print'));
}

// Send quote (placeholder function)
function sendQuote() {
  // In a real implementation, this would send the quote via email
  alert('In a production environment, this would send the quote via email.');
}
