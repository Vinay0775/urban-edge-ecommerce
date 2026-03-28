// recent.js
document.addEventListener("DOMContentLoaded", () => {
    
    // Inject Styles once
    const recentStyle = document.createElement('style');
    recentStyle.innerHTML = `
        .ue-recent-section {
            background-color: #f8f9fa;
            padding: 40px 0;
            border-top: 1px solid #eee;
        }
        .ue-recent-title {
            font-family: 'Archivo Black', sans-serif;
            text-transform: uppercase;
            font-size: 20px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .ue-recent-title span {
            color: #d34e2a;
        }
        .ue-recent-track {
            display: flex;
            gap: 20px;
            overflow-x: auto;
            padding-bottom: 15px;
            scroll-behavior: smooth;
        }
        .ue-recent-track::-webkit-scrollbar {
            height: 6px;
        }
        .ue-recent-track::-webkit-scrollbar-thumb {
            background-color: #ccc;
            border-radius: 10px;
        }
        .ue-recent-item {
            flex: 0 0 160px;
            background: #fff;
            padding: 10px;
            border: 1px solid #efefef;
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
            position: relative;
        }
        .ue-recent-remove {
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            cursor: pointer;
            z-index: 5;
            transition: all 0.2s;
            opacity: 0;
            pointer-events: none;
        }
        .ue-recent-item:hover .ue-recent-remove {
            opacity: 1;
            pointer-events: auto;
        }
        .ue-recent-remove:hover {
            background: #ff3300;
        }
        .ue-recent-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .ue-recent-item img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            margin-bottom: 10px;
            background: #f1f1f1;
        }
        .ue-recent-item h6 {
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 5px;
        }
        .ue-recent-item p {
            margin: 0;
            font-weight: bold;
            color: #d34e2a;
            font-size: 13px;
        }
        @media (max-width: 576px) {
            .ue-recent-item { flex: 0 0 130px; }
            .ue-recent-item img { height: 160px; }
        }
    `;
    document.head.appendChild(recentStyle);

    function renderRecentViews() {
        // Find Anchor point (Newsletter or Footer)
        const anchor = document.querySelector('.newsletter-section') || document.querySelector('footer');
        // Do not render on Cart or Wishlist page to avoid clutter
        if (window.location.pathname.toLowerCase().includes('cart.html') || window.location.pathname.toLowerCase().includes('wishlist.html')) return;
        if (!anchor) return;

        let recentList = [];
        try {
            recentList = JSON.parse(localStorage.getItem('urban_edge_recent')) || [];
        } catch(e) {}

        // Remove old if exists
        const oldSection = document.getElementById('ue-recent-view-module');
        if (oldSection) oldSection.remove();

        const section = document.createElement('section');
        section.id = 'ue-recent-view-module';
        section.className = 'ue-recent-section';

        let html = `
            <div class="container">
                <h3 class="ue-recent-title"><span><i class="fa-regular fa-clock"></i></span> Recently Viewed</h3>
                <div class="ue-recent-track">
        `;

        if (recentList.length === 0) {
            html += `
                <div class="p-4 text-muted border border-dashed text-center w-100" style="border-radius: 8px;">
                    <i class="fa-solid fa-eye-slash fs-3 mb-2"></i>
                    <p class="mb-0 fw-bold text-uppercase" style="font-size: 11px; letter-spacing: 1px;">No recently viewed products yet.</p>
                </div>
            `;
        } else {

        recentList.forEach(item => {
            html += `
                <div class="ue-recent-item shadow-sm" onclick="this.querySelector('.fake-trigger').click()">
                    <button class="ue-recent-remove" title="Remove" onclick="
                        event.stopPropagation();
                        try {
                            let rList = JSON.parse(localStorage.getItem('urban_edge_recent')) || [];
                            rList = rList.filter(r => r.id !== '${item.id}');
                            localStorage.setItem('urban_edge_recent', JSON.stringify(rList));
                            document.dispatchEvent(new Event('ue_recent_updated'));
                        } catch(e) {}
                    "><i class="fa-solid fa-xmark"></i></button>
                    <img src="${item.img}" alt="${item.name}">
                    <h6>${item.name}</h6>
                    <p>Rs. ${item.price}</p>
                    
                    <button class="d-none fake-trigger" onclick="
                        event.stopPropagation();
                        // Re-trigger Cart Modal
                        let p = {
                            id: '${item.id}',
                            name: '${item.name.replace(/'/g, "\\'")}',
                            price: ${item.price},
                            img: '${item.img}'
                        };
                        document.getElementById('ue-modal-img').src = p.img;
                        document.getElementById('ue-modal-title').innerText = p.name;
                        document.getElementById('ue-modal-price').innerText = 'Rs. ' + p.price;
                        window.tempCurrentProduct = Object.assign(window.tempCurrentProduct || {}, p, {triggerButton: null});
                        document.getElementById('ue-modal-wrapper').classList.add('active');
                        document.body.style.overflow = 'hidden';
                    ">Quick Add</button>
                </div>
            `;
        });
        }

        html += `
                </div>
            </div>
        `;
        section.innerHTML = html;

        anchor.parentNode.insertBefore(section, anchor);
    }

    renderRecentViews();

    // Listen for events from cart.js so it updates dynamically if they view another item on same page
    document.addEventListener('ue_recent_updated', () => {
        renderRecentViews();
    });
});
