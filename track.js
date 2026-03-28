// track.js
document.addEventListener("DOMContentLoaded", () => {
    const trackForm = document.getElementById('track-form');
    const input = document.getElementById('order-id-input');
    
    const loader = document.getElementById('track-loader');
    const errorBox = document.getElementById('track-error');
    const resultBox = document.getElementById('track-result-box');
    
    trackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let orderId = input.value.trim().toUpperCase();
        
        // Hide existing boxes
        resultBox.classList.remove('active');
        errorBox.classList.add('d-none');
        
        // Validate Format (Should contain 'UE-' and numbers)
        if (!orderId.includes('UE-') || orderId.length < 6) {
            errorBox.classList.remove('d-none');
            return;
        }
        
        // Show loader
        loader.classList.remove('d-none');
        
        // Simulate Network Delay
        setTimeout(() => {
            loader.classList.add('d-none');
            
            // Randomly determine the state based on the last digit of the ID
            const lastDigitStr = orderId.replace(/\D/g, '').slice(-1);
            const lastDigit = lastDigitStr ? parseInt(lastDigitStr) : 1;
            
            // State Mapping
            // 0-2: Order Placed (Step 1)
            // 3-5: Processing (Step 2)
            // 6-7: Shipped (Step 3)
            // 8-9: Delivered (Step 4)
            let currentStepIndex = 1;
            let statusText = "Preparing to Ship";
            
            if (lastDigit <= 2) { currentStepIndex = 1; statusText = "Order Placed & Verified"; }
            else if (lastDigit <= 5) { currentStepIndex = 2; statusText = "Processing at Warehouse"; }
            else if (lastDigit <= 7) { currentStepIndex = 3; statusText = "Shipped & In Transit"; }
            else { currentStepIndex = 4; statusText = "Successfully Delivered"; }
            
            updateTimeline(currentStepIndex);
            
            // Setup Dates (Simulated)
            const today = new Date();
            const dates = [
                formatDate(new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)), // -4 days
                formatDate(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)), // -2 days
                formatDate(today),                                               // Today
                formatDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000))  // +3 days
            ];
            
            document.getElementById('display-order-id').innerText = orderId;
            document.getElementById('current-status-text').innerText = statusText;
            document.getElementById('display-eta').innerText = dates[3]; // Expected delivery
            
            document.getElementById('date-1').innerText = dates[0];
            document.getElementById('date-2').innerText = dates[1];
            document.getElementById('date-3').innerText = dates[2];
            document.getElementById('date-4').innerText = dates[3];
            
            // Show result with animation
            resultBox.classList.add('active');
            
        }, 1500);
    });
    
    function formatDate(date) {
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
    
    function updateTimeline(stepNumber) {
        // Reset all steps
        const steps = [
            document.getElementById('step-1'),
            document.getElementById('step-2'),
            document.getElementById('step-3'),
            document.getElementById('step-4')
        ];
        
        steps.forEach(s => {
            s.classList.remove('active', 'completed');
            s.querySelector('.step-icon').innerHTML = '<i class="fa-solid fa-circle"></i>';
        });
        
        // Custom Icons
        const icons = [
            '<i class="fa-solid fa-check"></i>',
            '<i class="fa-solid fa-box-open"></i>',
            '<i class="fa-solid fa-truck-fast"></i>',
            '<i class="fa-solid fa-house"></i>'
        ];
        
        // Progress Bar widths for Desktop
        // Step 1: 0%, Step 2: 33%, Step 3: 66%, Step 4: 100%
        const widths = ['0%', '33%', '66%', '100%'];
        const progressBar = document.getElementById('progress-bar');
        
        // Apply classes
        for(let i = 0; i < steps.length; i++) {
            if (i < stepNumber - 1) {
                // Past steps
                steps[i].classList.add('completed');
                steps[i].querySelector('.step-icon').innerHTML = icons[i];
            } else if (i === stepNumber - 1) {
                // Current step
                steps[i].classList.add('active');
                steps[i].querySelector('.step-icon').innerHTML = icons[i];
                if (i === 3) steps[i].classList.add('completed'); // If delivered, mark completed
            }
        }
        
        // Animate Timeline line width (short delay for visual effect)
        setTimeout(() => {
            progressBar.style.width = widths[stepNumber - 1];
        }, 300);
    }
});
