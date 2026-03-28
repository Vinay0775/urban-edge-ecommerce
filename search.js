document.addEventListener("DOMContentLoaded", () => {
    // Inject Search Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .search-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(15px);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 10vh;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .search-modal-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }
        .search-modal-close {
            position: absolute;
            top: 30px;
            right: 40px;
            font-size: 40px;
            color: white;
            cursor: pointer;
            transition: transform 0.3s;
            font-family: sans-serif;
            line-height: 1;
        }
        .search-modal-close:hover {
            transform: scale(1.1) rotate(90deg);
            color: #d34e2a;
        }
        .search-modal-input-container {
            width: 80%;
            max-width: 800px;
            position: relative;
        }
        .search-modal-input {
            width: 100%;
            background: transparent;
            border: none;
            border-bottom: 3px solid #333;
            color: white;
            font-size: 3rem;
            padding: 10px 0;
            font-family: 'Archivo Black', sans-serif;
            text-transform: uppercase;
            outline: none;
            transition: border-color 0.3s;
        }
        .search-modal-input:focus {
            border-color: #d34e2a;
        }
        .search-modal-input::placeholder {
            color: rgba(255, 255, 255, 0.2);
        }
        .search-results-container {
            width: 80%;
            max-width: 1000px;
            margin-top: 50px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
            max-height: 60vh;
            overflow-y: auto;
            padding-bottom: 20px;
        }
        .search-results-container::-webkit-scrollbar {
            width: 8px;
        }
        .search-results-container::-webkit-scrollbar-thumb {
            background: #d34e2a;
            border-radius: 4px;
        }
        .search-result-card {
            background: #111;
            border: 1px solid #222;
            padding: 15px;
            text-decoration: none;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            transition: all 0.3s;
        }
        .search-result-card:hover {
            transform: translateY(-5px);
            border-color: #d34e2a;
            box-shadow: 0 10px 20px rgba(211, 78, 42, 0.2);
            color: white;
        }
        .search-result-card img {
            width: 100%;
            height: 180px;
            object-fit: cover;
            margin-bottom: 15px;
        }
        .search-result-card h6 {
            font-size: 14px;
            margin-bottom: 5px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .search-result-card p {
            color: #d34e2a;
            font-weight: bold;
            margin: 0;
            font-size: 13px;
        }
        @media (max-width: 768px) {
            .search-modal-input { font-size: 2rem; }
            .search-modal-close { top: 20px; right: 20px; font-size: 30px; }
            .search-results-container { grid-template-columns: repeat(2, 1fr); gap: 10px; width: 95%; }
            .search-result-card img { height: 120px; }
            .search-result-card h6 { font-size: 11px; }
            .search-result-card p { font-size: 11px; }
        }
    `;
    document.head.appendChild(style);

    // Mock Product Data representing Urban Edge inventory
    const products = [
        { name: "Heavy Duty Windbreaker", price: "Rs. 1500", img: "image/style3.webp", link: "sales.html" },
        { name: "Acid Wash Hoodie", price: "Rs. 1400", img: "image/product2.webp", link: "sales.html" },
        { name: "Urban T-Shirts (Organic)", price: "Rs. 600", img: "image/product1.webp", link: "clothing.html" },
        { name: "Urban Family Graphic Tee", price: "Rs. 2000", img: "image/product4.webp", link: "clothing.html" },
        { name: "Urban University Motto", price: "Rs. 1000", img: "image/product3.webp", link: "clothing.html" },
        { name: "Parachute Cargo Pants", price: "Rs. 1800", img: "image/style2.webp", link: "sales.html" },
        { name: "Matte Black Vase", price: "Rs. 1200", img: "image/vase.webp", link: "homedecor.html" },
        { name: "Industrial Desk Lamp", price: "Rs. 2200", img: "image/lamp.webp", link: "homedecor.html" },
        { name: "Concrete Wall Clock", price: "Rs. 1500", img: "image/clock.webp", link: "homedecor.html" },
        { name: "Asymmetric Mirror", price: "Rs. 4000", img: "image/mirror.webp", link: "homedecor.html" },
        { name: "Urban Edge Scented Candle", price: "Rs. 600", img: "image/candle.webp", link: "homedecor.html" },
        { name: "Urban Edge Artificial Plants", price: "Rs. 800", img: "image/plant.webp", link: "homedecor.html" },
        { name: "Distressed Boxy Tee", price: "Rs. 600", img: "image/product1.webp", link: "sales.html" }
    ];

    // Create Modal HTML
    const modal = document.createElement('div');
    modal.className = 'search-modal-overlay';
    modal.innerHTML = `
        <div class="search-modal-close">&times;</div>
        <div class="search-modal-input-container">
            <input type="text" class="search-modal-input" placeholder="Search the drop...">
        </div>
        <div class="search-results-container" id="searchResults">
            <div style="color: #666; font-size: 14px; grid-column: 1 / -1; text-align: center; margin-top: 50px; letter-spacing: 1px; text-transform: uppercase;">Type to discover items</div>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.search-modal-close');
    const input = modal.querySelector('.search-modal-input');
    const resultsContainer = modal.querySelector('#searchResults');

    function openSearch() {
        modal.classList.add('active');
        setTimeout(() => input.focus(), 100);
        document.body.style.overflow = 'hidden'; // stop page scrolling
    }

    function closeSearch() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        input.value = '';
        renderResults('');
    }

    closeBtn.addEventListener('click', closeSearch);

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeSearch();
        }
    });

    // Intercept original search bars
    const searchBars = document.querySelectorAll('.search-bar input, .search-bar a');
    searchBars.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            openSearch();
        });
        if (el.tagName.toLowerCase() === 'input') {
            el.addEventListener('focus', (e) => {
                e.preventDefault();
                e.target.blur(); // prevent keyboard popping up immediately
                openSearch();
            });
        }
    });

    function renderResults(query) {
        if (!query.trim()) {
            resultsContainer.innerHTML = '<div style="color: #666; font-size: 14px; grid-column: 1 / -1; text-align: center; margin-top: 50px; letter-spacing: 1px; text-transform: uppercase;">Type to discover items</div>';
            return;
        }

        const q = query.toLowerCase().trim();
        const filtered = products.filter(p => p.name.toLowerCase().includes(q) || p.price.toLowerCase().includes(q));
        
        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<div style="color: #666; font-size: 14px; grid-column: 1 / -1; text-align: center; margin-top: 50px; letter-spacing: 1px; text-transform: uppercase;">No items found. But the culture never rests.</div>';
            return;
        }

        resultsContainer.innerHTML = filtered.map(p => `
            <a href="${p.link}" class="search-result-card">
                <img src="${p.img}" alt="${p.name}">
                <h6>${p.name}</h6>
                <p>${p.price}</p>
            </a>
        `).join('');
    }

    input.addEventListener('input', (e) => {
        renderResults(e.target.value);
    });
});
