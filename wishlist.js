// wishlist.js
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. LOCAL STORAGE INIT ---
    let wishlist = JSON.parse(localStorage.getItem('urban_edge_wishlist')) || [];
    
    // Dynamic styles for wishlist hearts
    const wishStyle = document.createElement('style');
    wishStyle.innerHTML = `
        .ue-heart-icon {
            position: absolute; top: 10px; right: 10px; z-index: 10;
            background: rgba(255,255,255,0.9); border-radius: 50%;
            width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;
            font-size: 16px; color: #333; cursor: pointer; transition: all 0.2s ease;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .ue-heart-icon:hover { transform: scale(1.1); color: #ff3300; }
        .ue-heart-icon.active { color: #ff3300; }
        .ue-heart-icon.active i { font-weight: 900; } /* FontAwesome solid when active */
    `;
    document.head.appendChild(wishStyle);

    // --- 2. GLOBAL NAV WISHLIST ICON ---
    const navGroups = document.querySelectorAll('.nav-icons .d-flex.gap-3');
    navGroups.forEach(navGroup => {
        if (navGroup.querySelector('.wishlist-link')) return;
        
        const cartIcon = navGroup.querySelector('a[href*="cart.html"]');
        if (cartIcon) {
            const favLink = document.createElement('a');
            favLink.href = 'wishlist.html';
            favLink.className = 'fs-5 text-dark position-relative wishlist-link';
            favLink.style.textDecoration = 'none';
            favLink.innerHTML = `<i class="fa-regular fa-heart"></i>
                                 <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm wishlist-global-badge" style="font-size: 9px; padding: 4px 6px; display: none;">0</span>`;
            
            navGroup.insertBefore(favLink, cartIcon);
        }
    });

    function updateWishlistBadge() {
        document.querySelectorAll('.wishlist-global-badge').forEach(badge => {
            badge.innerText = wishlist.length;
            badge.style.display = wishlist.length > 0 ? 'inline-block' : 'none';
            badge.style.transition = "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            badge.style.transform = 'scale(1.3) translate(-40%, -40%)';
            setTimeout(() => { badge.style.transform = 'scale(1) translate(-50%, -50%)'; }, 250);
        });
    }

    function saveWishlist() {
        localStorage.setItem('urban_edge_wishlist', JSON.stringify(wishlist));
        updateWishlistBadge();
    }
    
    updateWishlistBadge(); // Init paint

    // --- 3. HELPER: EXTRACT PRODUCT DATA ---
    function extractProductDetails(element) {
        let container = element.parentElement;
        let name = "Urban Edge Item", price = 1000, img = "https://via.placeholder.com/120x150";
        for(let i=0; i<7; i++) {
            if(!container || container.tagName === 'BODY') break;
            
            let foundImg = container.querySelector('img');
            let foundName = container.querySelector('h5, h6, h4, h3, .card-title, .fw-bold.mb-1');
            
            let foundPriceEl = null;
            let priceCandidates = container.querySelectorAll('p:not(del), span:not(del), div:not(del), button, a');
            for(let el of priceCandidates) {
                if(el.innerText && el.innerText.includes('Rs.') && !el.closest('del')) {
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

    // --- 4. INJECT HEART ICONS ON PRODUCTS ---
    const imageBoxes = document.querySelectorAll('.product-img-box, .masonry-item, .hotspot-card, .card');
    imageBoxes.forEach(box => {
        // Ensure relative positioning
        if (window.getComputedStyle(box).position === 'static') box.style.position = 'relative';
        
        if(box.querySelector('.ue-heart-icon')) return; // Already has heart
        if(box.closest('#wishlist-container-main')) return; // Don't do this inside wishlist page itself

        const productData = extractProductDetails(box);
        const isFaved = wishlist.find(w => w.id === productData.id);

        const heart = document.createElement('div');
        heart.className = `ue-heart-icon ${isFaved ? 'active' : ''}`;
        heart.innerHTML = `<i class="${isFaved ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
        
        heart.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const pData = extractProductDetails(this);
            const existsIndex = wishlist.findIndex(w => w.id === pData.id);

            if (existsIndex > -1) {
                wishlist.splice(existsIndex, 1);
                this.classList.remove('active');
                this.innerHTML = `<i class="fa-regular fa-heart"></i>`;
                // Just visual logic, no toast
            } else {
                wishlist.push(pData);
                this.classList.add('active');
                this.innerHTML = `<i class="fa-solid fa-heart"></i>`;
                
                // Bounce animation
                this.style.transform = 'scale(1.4)';
                setTimeout(() => this.style.transform = '', 200);
            }
            saveWishlist();
        });

        box.appendChild(heart);
    });

    // --- 5. RENDER WISHLIST PAGE ---
    if (window.location.pathname.toLowerCase().includes('wishlist.html')) {
        renderWishlistPage();
    }

    function renderWishlistPage() {
        const container = document.getElementById('wishlist-container-main');
        if(!container) return;

        function updateWishUI() {
            if(wishlist.length === 0) {
                container.innerHTML = `
                    <div class="col-12 py-5 text-center w-100" style="min-height: 40vh;">
                        <i class="fa-regular fa-heart mb-3" style="font-size: 50px; color: #ccc;"></i>
                        <h4 class="fw-bold text-uppercase" style="font-family: 'Archivo Black', sans-serif;">Your Wishlist is Empty</h4>
                        <p class="text-muted">Save your favorite items here while you decide.</p>
                        <a href="collections.html" class="btn btn-dark rounded-0 px-4 py-3 mt-3 fw-bold text-uppercase">Discover Products</a>
                    </div>
                `;
                return;
            }

            let html = '';
            wishlist.forEach((item) => {
                html += `
                <div class="col-lg-3 col-md-4 col-6 mb-4" style="animation: fadeIn 0.4s;">
                    <div class="sale-card position-relative bg-white p-2 border border-light shadow-sm h-100 d-flex flex-column">
                        <div class="position-relative bg-light mb-3 overflow-hidden product-img-box" style="aspect-ratio: 4/5;">
                            <div class="ue-heart-icon active" data-id="${item.id}">
                                <i class="fa-solid fa-heart"></i>
                            </div>
                            <img src="${item.img}" alt="${item.name}" class="img-fluid w-100 h-100" style="object-fit: cover;">
                            <div class="quick-add-box position-absolute bottom-0 start-0 w-100 p-2 z-3 text-center">
                                <button class="btn btn-dark w-100 rounded-0 fw-bold text-uppercase py-2 move-to-cart-btn" data-id="${item.id}" style="font-size: 10px; letter-spacing: 1px;">Move To Bag +</button>
                            </div>
                        </div>
                        <h6 class="fw-bold mb-1 text-truncate text-uppercase" style="font-size: 11px;">${item.name}</h6>
                        <div class="d-flex align-items-center gap-2 mt-auto pt-2">
                            <p class="fw-bolder m-0" style="font-size: 15px; color: #ff3300;">Rs. ${item.price}</p>
                        </div>
                    </div>
                </div>
                `;
            });

            container.innerHTML = html;

            // Bind Remove Hearts
            document.querySelectorAll('#wishlist-container-main .ue-heart-icon').forEach(heartBtn => {
                heartBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    let id = this.dataset.id;
                    wishlist = wishlist.filter(w => w.id !== id);
                    saveWishlist();
                    updateWishUI();
                });
            });

            // Bind Move To Cart
            document.querySelectorAll('.move-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    let id = this.dataset.id;
                    const item = wishlist.find(w => w.id === id);
                    
                    if (item && window.showUeToast) {
                        // Open cart modal logic from cart.js using the extracted logic!
                        // For seamless integration, we will fake a button click by creating a temporary DOM button
                        // so cart.js's extractProductDetails works, or just pass it to the cart directly!
                        
                        let cart = JSON.parse(localStorage.getItem('urban_edge_cart')) || [];
                        let existingItem = cart.find(c => c.id === item.id + '-m-black'); // Default variant if directly moved
                        
                        // BUT Phase 1 built a modal! Let's trigger the Modal that cart.js owns
                        // Because cart.js buttons are bound at document load, dynamically created buttons aren't bound.
                        // We will broadcast a custom event or directly invoke the modal logic!

                        let fakeDiv = document.createElement('div');
                        fakeDiv.innerHTML = `
                            <img src="${item.img}">
                            <h5 class="card-title">${item.name}</h5>
                            <p>Rs. ${item.price}</p>
                            <button class="fake-add">Add</button>
                        `;
                        // Manually trigger cart.js logic
                        if (window.closeUeModal) {
                            // We are in luck, wait, cart.js tempCurrentProduct is private.
                            // Better solution: just add the default Medium/Black to cart directly to save complexity!
                            const uniqueId = `${item.id}-m-black`;
                            if (existingItem) existingItem.qty += 1;
                            else cart.push({...item, id: uniqueId, baseId: item.id, size: 'M', color: 'Black', qty: 1});
                            
                            localStorage.setItem('urban_edge_cart', JSON.stringify(cart));
                            // Force Cart Badge update (cart.js doesn't expose this, so reload)
                        }

                        // Remove from wishlist
                        wishlist = wishlist.filter(w => w.id !== id);
                        saveWishlist();
                        updateWishUI();
                        
                        // Fake reload cart badges by triggering storage event or redirect
                        window.location.href = 'cart.html'; 
                    }
                });
            });
        }

        updateWishUI();
    }
});
