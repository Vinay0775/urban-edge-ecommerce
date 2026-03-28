// admin.js
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. SETUP REVENUE CHART ---
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    // Create gradient for the chart line
    let gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(211, 78, 42, 0.4)'); // Urban Edge Brand Red
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
                tension: 0.4 // Smooth curves
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 13, family: 'Montserrat' },
                    bodyFont: { size: 14, weight: 'bold', family: 'Montserrat' },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                    ticks: { color: '#888', font: { family: 'Montserrat' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#888', font: { family: 'Montserrat' } }
                }
            }
        }
    });

    // --- 2. FETCH REAL RECENT REGISTRATION DATA ---
    const userListContainer = document.getElementById('new-users-list');
    const localUser = JSON.parse(localStorage.getItem('urban_edge_user'));
    
    let htmlContent = '';
    
    // If we have a real user test, inject them at the top
    if (localUser) {
        htmlContent += `
            <div class="d-flex align-items-center justify-content-between border-bottom border-secondary pb-3">
                <div class="d-flex align-items-center gap-3">
                    <div class="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold" style="width: 40px; height: 40px; font-size: 14px;">
                        ${localUser.initials}
                    </div>
                    <div>
                        <h6 class="m-0 fw-bold text-white">${localUser.name}</h6>
                        <small class="text-muted">${localUser.email}</small>
                    </div>
                </div>
                <span class="badge bg-success-subtle text-success border border-success border-opacity-25" style="font-size: 10px;">Just Now (Live)</span>
            </div>
        `;
    }
    
    // Add some random fake users
    const fakes = [
        { name: "Rahul Sharma", email: "rahul.sharma99@gmail.com", initials: "RS", time: "2 hours ago" },
        { name: "Priya Desai", email: "priyad_designs@outlook.com", initials: "PD", time: "5 hours ago" },
        { name: "Aarav Singh", email: "aarav.s@company.in", initials: "AS", time: "1 day ago" }
    ];
    
    fakes.forEach(f => {
        htmlContent += `
            <div class="d-flex align-items-center justify-content-between border-bottom border-secondary pb-3">
                <div class="d-flex align-items-center gap-3">
                    <div class="rounded-circle bg-dark-subtle text-white d-flex align-items-center justify-content-center fw-bold" style="width: 40px; height: 40px; font-size: 14px;">
                        ${f.initials}
                    </div>
                    <div>
                        <h6 class="m-0 fw-bold text-white">${f.name}</h6>
                        <small class="text-muted">${f.email}</small>
                    </div>
                </div>
                <small class="text-muted" style="font-size: 11px;">${f.time}</small>
            </div>
        `;
    });
    
    userListContainer.innerHTML = htmlContent;


    // --- 3. MANAGE & RENDER RECENT ORDERS ---
    const defaultOrders = [
        { id: "#UE-74892", customer: "Rahul Sharma", date: "Today, 10:24 AM", amount: "₹ 4,500", status: "Pending" },
        { id: "#UE-39912", customer: "Neha Gupta", date: "Yesterday, 4:15 PM", amount: "₹ 11,200", status: "Shipped" },
        { id: "#UE-11004", customer: "Varun K.", date: "Oct 12, 2026", amount: "₹ 2,499", status: "Delivered" },
        { id: "#UE-88543", customer: "Priya Desai", date: "Oct 11, 2026", amount: "₹ 7,850", status: "Delivered" }
    ];

    // Load from local storage or use defaults
    let systemOrders = JSON.parse(localStorage.getItem('urban_edge_admin_orders'));
    if (!systemOrders || systemOrders.length === 0) {
        systemOrders = defaultOrders;
        localStorage.setItem('urban_edge_admin_orders', JSON.stringify(systemOrders));
    }
    
    renderOrdersTable();

    function renderOrdersTable() {
        const tbody = document.getElementById('orders-table-body');
        tbody.innerHTML = '';
        
        systemOrders.forEach((order, index) => {
            // Determine badge class
            let badgeClass = "badge-pending";
            if(order.status === "Shipped") badgeClass = "badge-shipped";
            if(order.status === "Delivered") badgeClass = "badge-delivered";
            
            // Generate next available action
            let actionBtn = '';
            if (order.status === "Pending") {
                actionBtn = `<button class="btn btn-sm btn-outline-info border-0 rounded-1" onclick="changeOrderStatus(${index}, 'Shipped')"><i class="fa-solid fa-truck fw-bold me-1"></i> Ship It</button>`;
            } else if (order.status === "Shipped") {
                actionBtn = `<button class="btn btn-sm btn-outline-success border-0 rounded-1" onclick="changeOrderStatus(${index}, 'Delivered')"><i class="fa-solid fa-check-double fw-bold me-1"></i> Mark Delivered</button>`;
            } else {
                actionBtn = `<span class="text-success small fw-bold"><i class="fa-solid fa-check me-1"></i> Done</span>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td class="fw-bold text-white">${order.id}</td>
                    <td>${order.customer}</td>
                    <td class="text-muted">${order.date}</td>
                    <td class="fw-bold text-white">${order.amount}</td>
                    <td><span class="badge-status ${badgeClass}">${order.status}</span></td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        });
        
        // Update KPI
        document.getElementById('kpi-orders').innerText = systemOrders.length + 38; // fake total multiplier
    }

    // Global Action for updating order status
    window.changeOrderStatus = function(index, newStatus) {
        systemOrders[index].status = newStatus;
        localStorage.setItem('urban_edge_admin_orders', JSON.stringify(systemOrders));
        renderOrdersTable();
    };

    // Global Action for simulating a new incoming order (creates one at top)
    window.generateMockOrder = function() {
        const fakeNames = ["Vikram Aditya", "Aditi Rao", "Siddharth N.", "Ananya P."];
        const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
        const randomId = "#UE-" + Math.floor(10000 + Math.random() * 90000);
        const randomAmount = "₹ " + (Math.floor(1500 + Math.random() * 8000)).toLocaleString('en-IN');
        
        const newOrder = {
            id: randomId,
            customer: randomName,
            date: "Just Now",
            amount: randomAmount,
            status: "Pending"
        };
        
        // Add to front of array
        systemOrders.unshift(newOrder);
        // Keep max 10
        if(systemOrders.length > 10) systemOrders.pop();
        
        localStorage.setItem('urban_edge_admin_orders', JSON.stringify(systemOrders));
        renderOrdersTable();
        
        // Optional visual flash
        document.getElementById('orders-table-body').firstElementChild.style.backgroundColor = 'rgba(211, 78, 42, 0.2)';
        setTimeout(() => {
            document.getElementById('orders-table-body').firstElementChild.style.backgroundColor = '';
        }, 1500);
    };

});
