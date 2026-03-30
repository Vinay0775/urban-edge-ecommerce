// admin.js
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. TAB SWITCHING LOGIC ---
    const tabLinks = document.querySelectorAll('.admin-tab-link');
    const views = document.querySelectorAll('.admin-view');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active from all tabs
            tabLinks.forEach(l => l.classList.remove('active'));
            views.forEach(v => v.style.display = 'none');
            
            // Activate clicked
            link.classList.add('active');
            const target = document.getElementById(link.dataset.target);
            if(target) target.style.display = 'block';
        });
    });

    // --- 1.5 MOBILE SIDEBAR TOGGLE ---
    const sidebarToggleBtn = document.getElementById('adminSidebarToggle');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('adminSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function toggleSidebar() {
        if(sidebar) sidebar.classList.toggle('show');
        if(sidebarOverlay) sidebarOverlay.classList.toggle('show');
    }

    if(sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', toggleSidebar);
    if(closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleSidebar);
    if(sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);
    
    // Auto-close sidebar on mobile when a tab is selected
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
             if(window.innerWidth <= 768 && sidebar && sidebar.classList.contains('show')) {
                 toggleSidebar();
             }
        });
    });



    // --- 2. SETUP REVENUE CHART (MOCK HISTORICAL DATA) ---
    const chartCanv = document.getElementById('revenueChart');
    if(chartCanv) {
        const ctx = chartCanv.getContext('2d');
        let gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(211, 78, 42, 0.4)');
        gradient.addColorStop(1, 'rgba(211, 78, 42, 0.0)');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Revenue (₹)',
                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                    borderColor: '#d34e2a',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#d34e2a',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false }, ticks: { color: '#888' } },
                    x: { grid: { display: false }, ticks: { color: '#888' } }
                }
            }
        });
    }

    // Wait a brief moment to ensure window.db is populated by firebase-init.js
    setTimeout(initFirebaseAdminHooks, 500);

    function initFirebaseAdminHooks() {
        if (!window.db) {
            console.error("Firebase DB not initialized.");
            return;
        }

        // --- 3. FETCH LIVE CUSTOMERS ---
        db.collection("users").orderBy("timestamp", "desc").limit(50).onSnapshot(snap => {
            const tbody = document.getElementById('customers-table-body');
            const kpiUsers = document.getElementById('kpi-users');
            if(kpiUsers) kpiUsers.innerText = snap.size;
            
            if(!tbody) return;
            tbody.innerHTML = '';
            
            if(snap.empty) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No registered customers yet.</td></tr>';
                return;
            }
            
            snap.forEach(doc => {
                const u = doc.data();
                const dateStr = u.timestamp ? u.timestamp.toDate().toLocaleDateString('en-IN', {month:'short', day:'numeric', year:'numeric'}) : 'Unknown';
                const initials = u.name ? u.name.substring(0,2).toUpperCase() : 'UE';
                
                tbody.innerHTML += `
                    <tr>
                        <td><div class="rounded-circle bg-dark-subtle border border-secondary text-white d-flex align-items-center justify-content-center fw-bold" style="width: 35px; height: 35px; font-size: 13px;">${initials}</div></td>
                        <td class="fw-bold text-white">${u.name || 'Guest User'}</td>
                        <td class="text-muted">${u.email}</td>
                        <td class="text-muted small">${dateStr}</td>
                    </tr>
                `;
            });
        });

        // --- 4. FETCH LIVE PRODUCTS (CMS) ---
        db.collection("products").orderBy("createdAt", "desc").onSnapshot(snap => {
            const tbody = document.getElementById('products-table-body');
            if(!tbody) return;
            tbody.innerHTML = '';
            
            if(snap.empty) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5"><i class="fa-solid fa-box-open fs-2 mb-3"></i><br>Catalog is completely empty. Drop some gear.</td></tr>';
                return;
            }
            
            snap.forEach(doc => {
                const p = doc.data();
                tbody.innerHTML += `
                    <tr>
                        <td><img src="${p.img}" width="40" height="40" style="object-fit:cover; border-radius:4px; background:#fff;"></td>
                        <td class="fw-bold text-white" style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</td>
                        <td><span class="badge bg-secondary text-uppercase" style="font-size:10px; letter-spacing:1px;">${p.category}</span></td>
                        <td class="fw-bold text-success">₹ ${p.price}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-danger border-0 rounded-1 px-3" onclick="deleteProduct('${doc.id}')" title="Delete Product"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        });

        // Add Product Submit Form
        const addForm = document.getElementById('add-product-form');
        if(addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const btn = document.getElementById('save-product-btn');
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>DEPLOYING...';
                btn.disabled = true;
                
                const newProd = {
                    name: document.getElementById('p-title').value,
                    price: Number(document.getElementById('p-price').value),
                    category: document.getElementById('p-category').value,
                    img: document.getElementById('p-image').value,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                db.collection("products").add(newProd).then(() => {
                    const modalEl = document.getElementById('addProductModal');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if(modal) modal.hide();
                    
                    addForm.reset();
                    btn.innerHTML = 'DEPLOY TO STORE';
                    btn.disabled = false;
                }).catch(err => {
                    console.error(err);
                    alert("Error deploying product to database. Check console.");
                    btn.innerHTML = 'DEPLOY TO STORE';
                    btn.disabled = false;
                });
            });
        }

        // --- 5. MANAGE & RENDER RECENT ORDERS ---
        window.systemOrdersData = [];
        
        db.collection("orders").orderBy("timestamp", "desc").limit(20).onSnapshot((snapshot) => {
            window.systemOrdersData = [];
            const tbody = document.getElementById('all-orders-table-body');
            const kpiOrders = document.getElementById('kpi-orders');
            let totalRev = 0;
            
            if(!tbody) return;
            tbody.innerHTML = '';
            
            if(snapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-5">No active orders yet.</td></tr>';
                if(kpiOrders) kpiOrders.innerText = '0';
                document.getElementById('kpi-revenue').innerText = '0';
                return;
            }
            
            snapshot.forEach((doc) => {
                let data = doc.data();
                let dateStr = "Just Now";
                if(data.timestamp) {
                    dateStr = data.timestamp.toDate().toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
                }
                
                totalRev += data.total || 0;
                
                const orderObj = {
                    dbId: doc.id,
                    id: data.orderId || doc.id,
                    customer: data.customer ? data.customer.name : 'Guest',
                    date: dateStr,
                    amount: '₹ ' + (data.total || 0).toLocaleString('en-IN'),
                    status: data.status || 'Pending',
                    raw: data
                };
                window.systemOrdersData.push(orderObj);
                
                // Determine badge class
                let badgeClass = "bg-warning text-dark";
                if(orderObj.status === "Shipped") badgeClass = "bg-info text-dark";
                if(orderObj.status === "Delivered") badgeClass = "bg-success text-white";
                
                // Details BTN
                let detailsBtn = `<button class="btn btn-sm btn-dark border-secondary rounded-1 px-3" onclick="viewOrderDetails('${doc.id}')"><i class="fa-solid fa-eye text-muted"></i></button>`;
                
                // Action BTN
                let actionBtn = '';
                if (orderObj.status === "Processing" || orderObj.status === "Pending") {
                    actionBtn = `<button class="btn btn-sm btn-outline-info border-0 rounded-1" onclick="changeOrderStatus('${doc.id}', 'Shipped')"><i class="fa-solid fa-truck fw-bold me-1"></i> Ship It</button>`;
                } else if (orderObj.status === "Shipped") {
                    actionBtn = `<button class="btn btn-sm btn-outline-success border-0 rounded-1" onclick="changeOrderStatus('${doc.id}', 'Delivered')"><i class="fa-solid fa-check-double fw-bold me-1"></i> Complete</button>`;
                } else {
                    actionBtn = `<span class="text-success small fw-bold"><i class="fa-solid fa-check me-1"></i> Done</span>`;
                }

                tbody.innerHTML += `
                    <tr>
                        <td class="fw-bold text-white">${orderObj.id}</td>
                        <td>${orderObj.customer}</td>
                        <td class="text-muted small">${orderObj.date}</td>
                        <td class="fw-bold text-white">${orderObj.amount}</td>
                        <td><span class="badge ${badgeClass} text-uppercase" style="letter-spacing:1px; font-size:10px;">${orderObj.status}</span></td>
                        <td>${detailsBtn}</td>
                        <td>${actionBtn}</td>
                    </tr>
                `;
            });
            
            if(kpiOrders) kpiOrders.innerText = snapshot.size;
            document.getElementById('kpi-revenue').innerText = totalRev.toLocaleString('en-IN');
        });
    }

    // --- GLOBAL ACTIONS ---
    window.deleteProduct = function(id) {
        if(confirm('WARNING: Are you sure you want to delete this product? It will vanish from the main store instantly.')) {
            db.collection("products").doc(id).delete();
        }
    }

    window.changeOrderStatus = function(dbId, newStatus) {
        if (window.db) {
            db.collection("orders").doc(dbId).update({
                status: newStatus
            }).catch(console.error);
        }
    };

    window.viewOrderDetails = function(orderId) {
        const order = window.systemOrdersData.find(o => o.dbId === orderId);
        if(!order) return;
        
        let itemsHtml = '';
        if(order.raw.items && order.raw.items.length > 0) {
            order.raw.items.forEach(item => {
                itemsHtml += `
                <div class="d-flex align-items-center mb-3 pb-3 border-bottom border-secondary">
                    <img src="${item.img}" width="60" class="rounded me-3 bg-white" style="object-fit:cover;">
                    <div>
                        <h6 class="fw-bold m-0 text-white">${item.name}</h6>
                        <small class="text-muted">Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'} | Qty: ${item.qty}</small>
                        <p class="m-0 fw-bold mt-1 text-danger">₹ ${item.price * item.qty}</p>
                    </div>
                </div>`;
            });
        } else {
            itemsHtml = `<p class="text-muted small">No item details found for this order.</p>`;
        }
        
        // Render Modal
        const modalHtml = `
            <div class="modal-header border-secondary bg-dark">
              <h5 class="modal-title fw-bold text-uppercase d-flex align-items-center" style="font-family: 'Archivo Black', sans-serif;"><i class="fa-solid fa-box-open me-2 text-warning"></i> ORDER ${order.id}</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4 bg-dark">
                <div class="row">
                    <!-- Left: Items -->
                    <div class="col-md-7">
                        <h6 class="text-muted text-uppercase fw-bold small mb-3" style="letter-spacing:1px;">Items To Fulfill</h6>
                        ${itemsHtml}
                    </div>
                    <!-- Right: Shipping -->
                    <div class="col-md-5 border-start border-secondary ps-md-4 mt-4 mt-md-0">
                        <h6 class="text-muted text-uppercase fw-bold small mb-3" style="letter-spacing:1px;">Shipping Details</h6>
                        <p class="mb-1 text-white fw-bold"><i class="fa-regular fa-user me-2 text-muted"></i>${order.raw.customer.name}</p>
                        <p class="mb-1 small text-muted"><i class="fa-regular fa-envelope me-2"></i>${order.raw.customer.email}</p>
                        <p class="mb-4 small text-muted"><i class="fa-solid fa-phone me-2"></i>${order.raw.customer.phone}</p>
                        
                        <h6 class="text-muted text-uppercase fw-bold small mb-2" style="letter-spacing:1px;">Delivery Address</h6>
                        <p class="mb-4 small text-muted text-white">${order.raw.customer.address}<br>${order.raw.customer.city}</p>
                        
                        <div class="bg-dark-subtle p-3 rounded border border-secondary mt-auto">
                            <p class="m-0 d-flex justify-content-between small text-muted mb-2"><span>Payment</span><span class="text-white text-uppercase">${order.raw.paymentMethod || 'CARD'}</span></p>
                            <p class="m-0 d-flex justify-content-between fw-bold text-white fs-5 border-top border-secondary pt-2 mt-2"><span>Total</span><span class="text-danger">₹ ${order.raw.total}</span></p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer border-secondary bg-dark">
               <button type="button" class="btn btn-outline-light px-5 fw-bold" data-bs-dismiss="modal">Close Viewer</button>
            </div>
        `;
        
        document.getElementById('order-details-content').innerHTML = modalHtml;
        new bootstrap.Modal(document.getElementById('orderDetailsModal')).show();
    };
});
