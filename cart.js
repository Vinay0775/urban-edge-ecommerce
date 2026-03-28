// cart.js
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. DYNAMIC CSS INJECTION (Modal & Toast) ---
    const cartStyle = document.createElement('style');
    cartStyle.innerHTML = `
        /* Premium Toast Notification */
        #ue-toast-container {
            position: fixed; bottom: 30px; right: 30px; z-index: 10000;
            pointer-events: none; display: flex; flex-direction: column; gap: 15px;
        }
        .ue-toast {
            background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(10px); border: 1px solid #333;
            color: #fff; padding: 16px; width: 350px; display: flex; align-items: center; gap: 15px;
            box-shadow: 0 15px 30px rgba(0,0,0,0.5); transform: translateX(120%);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s;
            pointer-events: auto; position: relative;
        }
        .ue-toast.show { transform: translateX(0); }
        .ue-toast img { width: 50px; height: 60px; object-fit: cover; border-radius: 2px; }
        .ue-toast-content h6 { margin: 0 0 5px 0; font-size: 13px; font-weight: bold; text-transform: uppercase; }
        .ue-toast-content p { margin: 0; font-size: 11px; color: #aaa; }
        .ue-toast-btn {
            background: #d34e2a; color: #fff; border: none; padding: 5px 10px; font-size: 10px;
            text-transform: uppercase; font-weight: bold; text-decoration: none; margin-top: 8px;
            display: inline-block; transition: background 0.2s; cursor: pointer;
        }
        .ue-toast-btn:hover { background: #ff3300; color: #fff; }
        .ue-toast-close { position: absolute; top: 10px; right: 15px; font-size: 18px; color: #666; cursor: pointer; }
        .ue-toast-close:hover { color: #fff; }
        
        @media(max-width: 500px) {
            #ue-toast-container { bottom: 20px; right: 5%; width: 90%; }
            .ue-toast { width: 100%; box-sizing: border-box; }
        }

        /* Premium Quick View / Variant Modal */
        .ue-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
            z-index: 9999; display: flex; align-items: center; justify-content: center;
            opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
        }
        .ue-modal-overlay.active { opacity: 1; pointer-events: auto; }
        
        .ue-modal {
            background: #fff; width: 90%; max-width: 800px; display: flex; flex-direction: column;
            position: relative; transform: translateY(30px);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            max-height: 90vh; overflow-y: auto;
        }
        @media(min-width: 768px) { .ue-modal { flex-direction: row; height: 500px; overflow-y: hidden; } }
        .ue-modal-overlay.active .ue-modal { transform: translateY(0); }
        
        .ue-modal-img { width: 100%; height: 300px; object-fit: cover; background: #f8f9fa; }
        @media(min-width: 768px) { .ue-modal-img { width: 45%; height: 100%; } }
        
        .ue-modal-info { padding: 30px; width: 100%; display: flex; flex-direction: column; }
        @media(min-width: 768px) { .ue-modal-info { width: 55%; overflow-y: auto; padding: 40px; } }
        
        .ue-modal-close {
            position: absolute; top: 15px; right: 20px; font-size: 30px; line-height: 1; 
            cursor: pointer; color: #333; z-index: 10; background: white; width: 35px; height: 35px;
            display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .ue-modal-close:hover { color: #d34e2a; transform: scale(1.1); }
        
        .ue-variant-title { font-size: 11px; text-transform: uppercase; font-weight: bold; margin-bottom: 10px; letter-spacing: 1px; color: #888; }
        .ue-option-group { display: flex; gap: 10px; margin-bottom: 25px; flex-wrap: wrap; }
        .ue-option-btn {
            border: 1px solid #ddd; background: transparent; padding: 8px 16px; min-width: 45px; text-align: center;
            font-size: 13px; font-weight: bold; cursor: pointer; transition: all 0.2s; text-transform: uppercase;
        }
        .ue-option-btn:hover { border-color: #000; }
        .ue-option-btn.selected { background: #000; color: #fff; border-color: #000; transform: scale(1.05); }
        
        .ue-color-btn {
            width: 30px; height: 30px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; 
            padding: 0; outline: 2px solid transparent; outline-offset: 2px; transition: outline-color 0.2s;
        }
        .ue-color-btn.selected { outline-color: #000; }
        
        .ue-add-btn {
            background: #d34e2a; color: #fff; border: none; padding: 15px; width: 100%;
            font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; 
            margin-top: auto; transition: background 0.3s; cursor: pointer;
        }
        .ue-add-btn:hover { background: #000; color: #fff; }
    `;
    document.head.appendChild(cartStyle);

    // Dynamic Element Injection into DOM
    if (!document.getElementById('ue-toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'ue-toast-container';
        document.body.appendChild(toastContainer);
    }
    
    if (!document.getElementById('ue-modal-wrapper')) {
        const modalWrapper = document.createElement('div');
        modalWrapper.id = 'ue-modal-wrapper';
        modalWrapper.className = 'ue-modal-overlay';
        modalWrapper.innerHTML = `
            <div class="ue-modal">
                <div class="ue-modal-close" onclick="closeUeModal()">&times;</div>
                <img id="ue-modal-img" class="ue-modal-img" src="" alt="Product">
                <div class="ue-modal-info">
                    <h2 id="ue-modal-title" class="fw-bolder text-uppercase mb-2" style="font-family: 'Archivo Black', sans-serif; font-size: 24px;">Product</h2>
                    <p id="ue-modal-price" class="fw-bolder fs-5 text-danger mb-4">Rs. 0</p>
                    
                    <div class="ue-variant-title">Select Size: <span id="ue-size-label" class="text-dark">M</span></div>
                    <div class="ue-option-group" id="ue-size-group">
                        <button class="ue-option-btn" data-val="S">S</button>
                        <button class="ue-option-btn selected" data-val="M">M</button>
                        <button class="ue-option-btn" data-val="L">L</button>
                        <button class="ue-option-btn" data-val="XL">XL</button>
                    </div>

                    <div class="ue-variant-title">Select Color: <span id="ue-color-label" class="text-dark">Black</span></div>
                    <div class="ue-option-group" id="ue-color-group">
                        <button class="ue-color-btn selected" data-val="Black" style="background: #111;" title="Black"></button>
                        <button class="ue-color-btn" data-val="Olive" style="background: #556B2F;" title="Olive"></button>
                        <button class="ue-color-btn" data-val="White" style="background: #fff; border: 1px solid #ddd;" title="White"></button>
                    </div>
                    
                    <button class="ue-add-btn" id="ue-confirm-add" style="margin-top: 30px;">Add To Bag</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalWrapper);
    }

    // --- 2. LOCAL STORAGE CART INITIALIZATION ---
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('urban_edge_cart')) || [];
        if (!Array.isArray(cart)) cart = [];
    } catch (e) {
        console.warn("Cart data corrupted, clearing...");
        localStorage.removeItem('urban_edge_cart');
        cart = [];
    }
    let tempCurrentProduct = null;
    
    // --- 3. GLOBAL BADGE SETUP ---
    const cartIconLinks = document.querySelectorAll('.nav-icons a[href="cart.html"], a[href="cart.html"]');
    cartIconLinks.forEach(cartIconLink => {
        if (cartIconLink.querySelector('.badge')) return; 
        cartIconLink.style.position = 'relative';
        let cartBadge = document.createElement('span');
        cartBadge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm cart-global-badge';
        cartBadge.style.fontSize = '9px';
        cartBadge.style.padding = '4px 6px';
        const total = cart.reduce((tot, item) => tot + item.qty, 0);
        cartBadge.innerText = total;
        cartBadge.style.display = total > 0 ? 'inline-block' : 'none';
        cartIconLink.appendChild(cartBadge);
    });

    function updateBadges() {
        const total = cart.reduce((tot, item) => tot + item.qty, 0);
        document.querySelectorAll('.cart-global-badge').forEach(badge => {
            badge.innerText = total;
            badge.style.display = total > 0 ? 'inline-block' : 'none';
            badge.style.transition = "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            badge.style.transform = 'scale(1.3) translate(-40%, -40%)';
            setTimeout(() => { badge.style.transform = 'scale(1) translate(-50%, -50%)'; }, 250);
        });
    }

    function saveCart() {
        localStorage.setItem('urban_edge_cart', JSON.stringify(cart));
        updateBadges();
    }

    // --- 4. TOAST NOTIFICATION LOGIC ---
    window.showUeToast = function(product, variantText, customTitle = null) {
        const container = document.getElementById('ue-toast-container');
        const toast = document.createElement('div');
        toast.className = 'ue-toast';
        let isCartAction = !customTitle;
        let title = customTitle || "Added to Bag";
        toast.innerHTML = `
            <div class="ue-toast-close" onclick="this.parentElement.remove()">&times;</div>
            <img src="${product.img}" alt="${product.name}">
            <div class="ue-toast-content flex-grow-1">
                <h6>${title}</h6>
                <p>${product.name} <br> ${variantText}</p>
                ${isCartAction ? '<a href="cart.html" class="ue-toast-btn">View Bag</a>' : ''}
            </div>
        `;
        container.appendChild(toast);
        
        // Trigger slide in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto remove after 5s
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400); // Wait for transition
        }, 5000);
    }

    // --- 5. MODAL LOGIC & BINDING ---
    const modalWrap = document.getElementById('ue-modal-wrapper');
    window.closeUeModal = function() {
        modalWrap.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Modal Size/Color bindings
    document.querySelectorAll('#ue-size-group .ue-option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#ue-size-group .ue-option-btn').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            document.getElementById('ue-size-label').innerText = e.target.dataset.val;
        });
    });
    document.querySelectorAll('#ue-color-group .ue-color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#ue-color-group .ue-color-btn').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            document.getElementById('ue-color-label').innerText = e.target.dataset.val;
        });
    });

    // Modal Confirm Add
    document.getElementById('ue-confirm-add').addEventListener('click', function() {
        if (!tempCurrentProduct) return;
        
        const selectedSize = document.querySelector('#ue-size-group .selected').dataset.val;
        const selectedColor = document.querySelector('#ue-color-group .selected').dataset.val;
        
        // Combine ID with size and color so variants stack separately
        const uniqueId = `${tempCurrentProduct.id}-${selectedSize.toLowerCase()}-${selectedColor.toLowerCase()}`;
        
        let existingItem = cart.find(item => item.id === uniqueId);
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({
                ...tempCurrentProduct,
                id: uniqueId,
                baseId: tempCurrentProduct.id,
                size: selectedSize,
                color: selectedColor,
                qty: 1
            });
        }
        
        saveCart();
        closeUeModal();
        showUeToast(tempCurrentProduct, `Size: ${selectedSize} | Color: ${selectedColor}`);
        
        // Change text of original button
        if(tempCurrentProduct.triggerButton) {
            const btn = tempCurrentProduct.triggerButton;
            btn.innerHTML = `✓ ADDED TO BAG`;
            btn.style.backgroundColor = 'black';
            btn.style.color = 'white';
        }
    });

    // Close on overlay click
    modalWrap.addEventListener('click', (e) => {
        if (e.target === modalWrap) closeUeModal();
    });

    // --- 6. DOM PARSER: FIND PRODUCT DETAILS ---
    function extractProductDetails(btn) {
        let container = btn.parentElement;
        let name = "Urban Edge Item", price = 1000, img = "https://via.placeholder.com/120x150";
        
        for(let i=0; i<7; i++) {
            if(!container || container.tagName === 'BODY') break;
            
            let foundImg = container.querySelector('img.img-fluid, img.product-img, img.card-img-top, img.category-img');
            let foundName = container.querySelector('h5, h6, h4, .card-title');
            
            let foundPriceEl = null;
            let priceCandidates = container.querySelectorAll('p:not(del), span:not(del), div:not(del)');
            for(let el of priceCandidates) {
                if(el.children.length <= 1 && el.innerText.includes('Rs.') && !el.closest('del')) {
                    foundPriceEl = el; break;
                }
            }
            
            if (foundImg && foundName && foundPriceEl) {
                img = foundImg.src; name = foundName.innerText.trim();
                let priceText = foundPriceEl.innerText.replace(/[^0-9]/g, '');
                if(priceText) price = parseInt(priceText);
                break;
            }
            container = container.parentElement;
        }
        
        let id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return { id, name, price, img };
    }


    // --- 7. INTERCEPT "ADD TO CART" BUTTONS EVERYWHERE ---
    window.bindCartButton = function(button) {
        if (button.id === 'pd-add-btn') return; // Skip main product page button
        
        const text = button.innerText.toLowerCase().trim();
        if (text.includes("add") || text.includes("cart") || text.includes("bag")) {
            if (text.includes("subscribe") || text.includes("load") || text.includes("join") || text.includes("discover") || text.includes("view") || text.includes("address")) return;
            
            button.removeAttribute("onclick");
            if (button.tagName.toLowerCase() === 'a' && button.getAttribute('href') === 'cart.html') {
                button.setAttribute('href', 'javascript:void(0)');
            }
            
            // Remove previous listeners if any (by replacing clone)
            let newBtn = button.cloneNode(true);
            if(button.parentNode) button.parentNode.replaceChild(newBtn, button);
            
            newBtn.addEventListener("click", function(e) {
                e.preventDefault(); 
                let product = extractProductDetails(newBtn);
                
                // Track Recently Viewed Item
                try {
                    let recentList = JSON.parse(localStorage.getItem('urban_edge_recent')) || [];
                    recentList = recentList.filter(item => item.id !== product.id); // Remove if exists
                    recentList.unshift(product); // Add to front
                    if(recentList.length > 8) recentList.pop(); // Keep max 8
                    localStorage.setItem('urban_edge_recent', JSON.stringify(recentList));
                    
                    document.dispatchEvent(new Event('ue_recent_updated'));
                } catch(err) { console.warn("Recent tracking error:", err); }

                // Open modal instead of direct add
                tempCurrentProduct = { ...product, triggerButton: this };
                document.getElementById('ue-modal-img').src = product.img;
                document.getElementById('ue-modal-title').innerText = product.name;
                document.getElementById('ue-modal-price').innerText = "Rs. " + product.price;
                
                // Reset selections to defaults
                document.querySelectorAll('#ue-size-group .ue-option-btn').forEach(b => b.classList.remove('selected'));
                let mBtn = document.querySelector('#ue-size-group .ue-option-btn[data-val="M"]');
                if(mBtn) mBtn.classList.add('selected');
                document.getElementById('ue-size-label').innerText = "M";

                document.querySelectorAll('#ue-color-group .ue-color-btn').forEach(b => b.classList.remove('selected'));
                let blkBtn = document.querySelector('#ue-color-group .ue-color-btn[data-val="Black"]');
                if(blkBtn) blkBtn.classList.add('selected');
                document.getElementById('ue-color-label').innerText = "Black";
                
                modalWrap.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
    };

    const buttons = document.querySelectorAll("button, a.btn");
    buttons.forEach(button => window.bindCartButton(button));

    // --- 7.5 ROUTE PRODUCT IMAGES TO PD PAGE ---
    if (!window.location.pathname.toLowerCase().includes('product')) {
        document.addEventListener('click', function(e) {
            if (e.target.tagName.toLowerCase() === 'img') {
                const card = e.target.closest('.card, .bento-card, .acc-cat-card, .wishlist-item, .ue-recent-item, .product-img-box');
                if (card) {
                    let product = extractProductDetails(e.target);
                    if(product && product.price > 0 && !product.name.includes("Urban Edge Item")) {
                        e.preventDefault();
                        window.location.href = `product.html?id=${encodeURIComponent(product.id)}&name=${encodeURIComponent(product.name)}&price=${product.price}&img=${encodeURIComponent(product.img)}`;
                    }
                }
            }
        });
    }

    // --- 8. RENDER CART PAGE ---
    if (window.location.pathname.toLowerCase().includes('cart')) {
        renderCartPage();
    }

    function renderCartPage() {
        const cartContainer = document.querySelector('#cart-container-main') || document.querySelector('.col-lg-8');
        const summaryContainer = document.querySelector('#cart-summary-main') || document.querySelector('.col-lg-4');
        if (!cartContainer || !summaryContainer) return;

        const listHeader = `
            <div class="d-flex justify-content-between border-bottom border-dark border-2 pb-2 mb-4">
                <span class="fw-bold text-uppercase" style="font-size: 12px; letter-spacing: 1px;">Product</span>
                <span class="fw-bold text-uppercase" style="font-size: 12px; letter-spacing: 1px;">Total</span>
            </div>
        `;

        function updateCartUI() {
            if (cart.length === 0) {
                cartContainer.innerHTML = listHeader + `
                    <div class="text-center py-5">
                        <i class="fa-solid fa-bag-shopping mb-3 text-muted" style="font-size: 40px;"></i>
                        <h4 class="fw-bold text-uppercase" style="font-family: 'Archivo Black', sans-serif;">Your Bag is Empty</h4>
                        <p class="text-muted">Looks like you haven't added anything to your bag yet.</p>
                        <a href="collections.html" class="btn btn-dark rounded-0 px-4 py-2 text-uppercase fw-bold mt-3 transition-hover">Start Shopping</a>
                    </div>
                `;
                renderSummary(0);
                return;
            }

            let html = listHeader;
            let subtotal = 0;

            cart.forEach((item) => {
                let itemTotal = item.price * item.qty;
                subtotal += itemTotal;
                
                let variantInfo = '';
                if(item.size || item.color) {
                    variantInfo = `<p class="text-muted mb-2" style="font-size: 13px;">${item.size ? 'Size: '+item.size : ''} ${item.size && item.color ? '|' : ''} ${item.color ? 'Color: '+item.color : ''}</p>`;
                } else {
                    variantInfo = `<p class="text-muted mb-2" style="font-size: 13px;">Unit Price: Rs. ${item.price}</p>`;
                }

                html += `
                <div class="row mb-4 pb-4 border-bottom border-light align-items-center" style="animation: fadeIn 0.4s;">
                    <div class="col-4 col-md-2">
                        <img src="${item.img}" alt="${item.name}" class="cart-item-img border border-dark border-1" onerror="this.src='https://via.placeholder.com/120x150?text=Item'">
                    </div>
                    <div class="col-8 col-md-10 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center ps-md-4">
                        <div class="mb-3 mb-md-0">
                            <h5 class="fw-bold text-uppercase mb-1" style="font-size: 16px;">${item.name}</h5>
                            ${variantInfo}
                            <p class="fw-bold mb-3 d-md-none">Rs. ${itemTotal}</p>
                            
                            <div class="d-flex align-items-center mb-2">
                                <div class="qty-btn" data-action="minus" data-id="${item.id}">-</div>
                                <input type="text" class="qty-input" value="${item.qty}" readonly>
                                <div class="qty-btn" data-action="plus" data-id="${item.id}">+</div>
                            </div>
                            <span class="remove-btn text-uppercase fw-bold" data-id="${item.id}"><i class="fa-solid fa-trash-can me-1"></i> Remove</span>
                        </div>
                        <div class="d-none d-md-block">
                            <p class="fw-bolder fs-5 m-0">Rs. ${itemTotal}</p>
                        </div>
                    </div>
                </div>
                `;
            });

            cartContainer.innerHTML = html;
            renderSummary(subtotal);
            attachCartListeners();
        }

        function renderSummary(subtotal) {
            let tax = Math.round(subtotal * 0.12);
            let total = subtotal + tax;
            let totalItems = cart.reduce((tot, item) => tot + item.qty, 0);

            summaryContainer.innerHTML = `
                <div class="premium-summary-card p-4 p-md-5 sticky-top" style="top: 100px;">
                    <h4 class="fw-bolder text-uppercase mb-4" style="font-family: 'Archivo Black', sans-serif; letter-spacing: 1px;">Order Summary</h4>
                    
                    <div class="d-flex justify-content-between mb-3">
                        <span class="fw-bold text-muted">Subtotal (${totalItems} items)</span>
                        <span class="fw-bold fs-6">Rs. ${subtotal}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-3">
                        <span class="fw-bold text-muted">Shipping</span>
                        <span class="fw-bold text-success fs-6">${subtotal > 0 ? 'FREE' : 'Rs. 0'}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-4 pb-4" style="border-bottom: 1px dashed #ccc;">
                        <span class="fw-bold text-muted">Estimated Tax (12%)</span>
                        <span class="fw-bold fs-6">Rs. ${tax}</span>
                    </div>
                    
                    <div class="d-flex justify-content-between mb-4 align-items-center">
                        <span class="fw-bolder fs-5 text-uppercase">Total</span>
                        <span class="fw-bolder fs-4" style="color: #d34e2a;">Rs. ${total}</span>
                    </div>

                    <button onclick="window.location.href='checkout.html'" class="btn w-100 py-3 rounded-0 fw-bold text-uppercase mb-3 btn-checkout" style="letter-spacing: 2px; ${totalItems === 0 ? 'pointer-events: none; opacity: 0.5;' : ''}" ${totalItems === 0 ? 'disabled' : ''}>Proceed to Checkout</button>
                    
                    <p class="text-center fw-bold mt-2 mb-3" style="font-size: 11px; letter-spacing: 2px; color: #888;">SECURE PAYMENT</p>
                    <div class="d-flex justify-content-center gap-3 fs-3 text-secondary">
                        <i class="fa-brands fa-cc-visa transition-hover"></i>
                        <i class="fa-brands fa-cc-mastercard transition-hover"></i>
                        <i class="fa-brands fa-cc-paypal transition-hover"></i>
                        <i class="fa-brands fa-apple-pay transition-hover"></i>
                    </div>
                </div>
            `;
        }

        function attachCartListeners() {
            document.querySelectorAll('.qty-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    let id = this.dataset.id;
                    let action = this.dataset.action;
                    let itemIndex = cart.findIndex(i => i.id === id);
                    
                    if (itemIndex > -1) {
                        if (action === 'plus') {
                            cart[itemIndex].qty += 1;
                        } else if (action === 'minus') {
                            if (cart[itemIndex].qty > 1) {
                                cart[itemIndex].qty -= 1;
                            } else {
                                cart.splice(itemIndex, 1);
                            }
                        }
                        saveCart();
                        updateCartUI();
                    }
                });
            });

            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    let id = this.dataset.id;
                    cart = cart.filter(i => i.id !== id);
                    saveCart();
                    updateCartUI();
                });
            });
        }

        updateCartUI();
    }
});
