// orders.js
document.addEventListener("DOMContentLoaded", () => {
    const userJson = localStorage.getItem('urban_edge_user');
    const loader = document.getElementById('orders-loader');
    const reqLogin = document.getElementById('login-required-state');
    const emptyState = document.getElementById('empty-orders-state');
    const container = document.getElementById('orders-container');
    
    // Check Authentication
    if (!userJson) {
        loader.classList.add('d-none');
        reqLogin.classList.remove('d-none');
        return;
    }

    const currentUser = JSON.parse(userJson);

    // Make sure Firebase DB is initialized
    if (!window.db) {
        setTimeout(fetchOrders, 500); // Give firebase-init.js a moment if delayed
    } else {
        fetchOrders();
    }

    function fetchOrders() {
        if (!window.db) {
            loader.innerHTML = '<p class="text-danger">Failed to connect to database. Try reloading.</p>';
            return;
        }

        db.collection("orders")
            .where("customer.email", "==", currentUser.email)
            .orderBy("timestamp", "desc")
            .get()
            .then((querySnapshot) => {
                loader.classList.add('d-none');
                
                if (querySnapshot.empty) {
                    emptyState.style.display = 'block';
                    return;
                }

                querySnapshot.forEach((doc) => {
                    const order = doc.data();
                    renderOrderCard(order);
                });
            })
            .catch((error) => {
                console.error("Error fetching orders: ", error);
                
                // Firestore requires composite indexes for where() + orderBy() queries.
                // If it fails due to missing index, handle it gracefully and provide the direct URL.
                if (error.message.includes("index")) {
                    console.warn("Index building required in Firebase console.");
                    
                    // Fallback to simple query and manual sort while index builds
                    db.collection("orders")
                        .where("customer.email", "==", currentUser.email)
                        .get()
                        .then((snap) => {
                            loader.classList.add('d-none');
                            if (snap.empty) { emptyState.style.display = 'block'; return; }
                            
                            let orders = [];
                            snap.forEach(d => orders.push(d.data()));
                            
                            // Manual sort by timestamp
                            orders.sort((a,b) => {
                                if(!a.timestamp || !b.timestamp) return 0;
                                return b.timestamp.seconds - a.timestamp.seconds;
                            });
                            
                            orders.forEach(o => renderOrderCard(o));
                        });
                } else {
                    loader.innerHTML = '<p class="text-danger">Error loading orders. Please try again later.</p>';
                }
            });
    }

    function renderOrderCard(order) {
        // Date formatting
        let dateStr = "Processing...";
        if (order.timestamp) {
            const d = order.timestamp.toDate();
            dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        
        // Status class mapping
        let statusClass = 'status-processing';
        let statusText = order.status || 'Processing';
        if (statusText.toLowerCase() === 'shipped') statusClass = 'status-shipped';
        if (statusText.toLowerCase() === 'delivered') statusClass = 'status-delivered';

        let itemsHtml = '';
        if (order.items && order.items.length > 0) {
            const displayItems = order.items.slice(0, 3);
            const remainingCount = order.items.length - 3;
            
            displayItems.forEach(item => {
                itemsHtml += `
                    <div class="d-flex align-items-center mb-2">
                        <img src="${item.img}" class="order-item-img me-3" alt="${item.name}">
                        <div>
                            <h6 class="fw-bold mb-0 text-truncate" style="font-size: 13px; max-width: 250px;">${item.name}</h6>
                            <small class="text-muted">Qty: ${item.qty} | Rs. ${item.price}</small>
                        </div>
                    </div>
                `;
            });

            if (remainingCount > 0) {
                itemsHtml += `
                    <div class="d-flex align-items-center pt-2 mt-2 border-top">
                        <small class="text-muted fw-bold">+ ${remainingCount} more item(s)</small>
                    </div>
                `;
            }
        }

        const card = document.createElement('div');
        card.className = 'order-card';
        card.innerHTML = `
            <div class="order-header flex-column flex-sm-row gap-2">
                <div>
                    <h5 class="fw-bolder m-0" style="font-family: 'Archivo Black', sans-serif;">#${order.orderId}</h5>
                    <p class="m-0 text-muted small"><i class="fa-regular fa-calendar me-1"></i> Placed on ${dateStr}</p>
                </div>
                <div class="text-sm-end text-start">
                    <p class="m-0 fw-bold fs-5">Rs. ${order.total}</p>
                    <span class="status-badge ${statusClass} mt-1 d-inline-block">${statusText}</span>
                </div>
            </div>
            <div class="order-body border-bottom">
                <div class="row">
                    <div class="col-md-7">
                        <h6 class="fw-bold mb-3 text-uppercase" style="font-size: 12px; letter-spacing: 1px;"><i class="fa-solid fa-box me-2"></i>Items Details</h6>
                        ${itemsHtml}
                    </div>
                    <div class="col-md-5 mt-4 mt-md-0 border-start ps-md-4">
                        <h6 class="fw-bold mb-3 text-uppercase" style="font-size: 12px; letter-spacing: 1px;"><i class="fa-solid fa-truck-fast me-2"></i>Shipping Info</h6>
                        <p class="text-dark small fw-bold mb-1">${order.customer.name}</p>
                        <p class="text-muted small m-0">${order.customer.address}, ${order.customer.city}</p>
                        <p class="text-muted small mb-3">Phone: ${order.customer.phone}</p>
                        
                        <a href="track.html" class="btn btn-outline-dark btn-sm rounded-0 w-100 fw-bold border-2">Track Package</a>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    }
});
