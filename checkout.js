// checkout.js
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Validate Cart Exists & Render Summary
    let cart = JSON.parse(localStorage.getItem('urban_edge_cart')) || [];
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    const summaryBox = document.getElementById('checkout-items-box');
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        
        const markup = `
            <div class="d-flex align-items-center mb-3 position-relative">
                <div class="position-relative me-3">
                    <img src="${item.img}" alt="${item.name}" class="summary-item-img">
                    <span class="summary-badge shadow-sm">${item.qty}</span>
                </div>
                <div class="flex-grow-1">
                    <h6 class="fw-bold mb-1 text-truncate" style="max-width: 200px; font-size: 13px;">${item.name}</h6>
                    <p class="text-muted m-0" style="font-size: 11px;">Size: ${item.size} | Color: ${item.color}</p>
                </div>
                <div class="text-end ps-2">
                    <p class="fw-bold m-0" style="font-size: 13px; color: #555;">Rs. ${itemTotal}</p>
                </div>
            </div>
        `;
        summaryBox.innerHTML += markup;
    });

    const taxAmount = Math.round(subtotal * 0.12);
    const finalTotal = subtotal + taxAmount;

    document.getElementById('chk-subtotal').innerText = `Rs. ${subtotal}`;
    document.getElementById('chk-tax').innerText = `Rs. ${taxAmount}`;
    document.getElementById('chk-total').innerText = `Rs. ${finalTotal}`;

    // 2. Setup Payment Accordion Logic
    const paymentRadios = document.querySelectorAll('input[name="payment_method"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Close all
            document.querySelectorAll('.ue-accordion-header, .ue-accordion-body').forEach(el => {
                el.classList.remove('active');
            });
            // Open selected
            const header = this.closest('.ue-accordion-header');
            const body = document.getElementById('body-' + this.value);
            header.classList.add('active');
            if (body) body.classList.add('active');
            
            // Adjust validation required fields based on selection
            if(this.value === 'card') {
                document.getElementById('card-num').setAttribute('required', 'true');
                document.getElementById('card-name').setAttribute('required', 'true');
                document.getElementById('card-exp').setAttribute('required', 'true');
                document.getElementById('card-cvv').setAttribute('required', 'true');
            } else {
                ['card-num', 'card-name', 'card-exp', 'card-cvv'].forEach(id => {
                    document.getElementById(id).removeAttribute('required');
                });
            }
        });
    });

    // 3. Handle Order Submission
    const checkoutForm = document.getElementById('checkoutSubmitForm');
    const submitBtn = document.querySelector('.submit-order-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner-btn');
    const successModal = document.getElementById('success-modal-overlay');

    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Stop standard form navigation
        
        // Show Loading State
        submitBtn.setAttribute('disabled', 'true');
        btnText.style.display = 'none';
        spinner.style.display = 'inline-block';
        
        // Simulate Network Request
        setTimeout(() => {
            // Clear the Cart!
            localStorage.setItem('urban_edge_cart', JSON.stringify([]));
            
            // Generate Random Order ID
            const orderId = 'UE-' + Math.floor(10000 + Math.random() * 90000);
            document.getElementById('order-id-display').innerText = '#' + orderId;
            
            // Revert Button
            submitBtn.removeAttribute('disabled');
            btnText.style.display = 'inline-block';
            spinner.style.display = 'none';
            btnText.innerText = 'Paid Successfully';
            submitBtn.classList.replace('btn-dark', 'btn-success');
            
            // Show Success Modal
            successModal.classList.add('show');
            
        }, 2200); // 2.2 second artificial load time
    });
});
