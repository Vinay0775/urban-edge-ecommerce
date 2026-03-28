const fs = require('fs');

try {
    let salesHtml = fs.readFileSync('sales.html', 'utf8');
    
    // Remove the sale-hero, marquee-wrapper, bg-dark sections, and the old products section
    const navEnd = '</nav>';
    const footerStart = '<footer class="sales-footer';
    
    let topPart = salesHtml.substring(0, salesHtml.indexOf(navEnd) + navEnd.length);
    let bottomPart = salesHtml.substring(salesHtml.indexOf(footerStart));
    
    // Middle Part
    let middlePart = `
    <section class="py-5 mt-4 mt-lg-5" style="min-height: 60vh;">
        <div class="container">
            <div class="d-flex justify-content-between align-items-end mb-4 border-bottom border-dark border-2 pb-3">
                <h2 class="display-5 fw-bolder text-uppercase mb-0" style="font-family: 'Archivo Black', sans-serif;">Your Wishlist ❤️</h2>
                <a href="collections.html" class="text-muted text-decoration-none fw-bold" style="font-size: 14px; text-transform: uppercase;">Continue Shopping</a>
            </div>
            
            <div class="row g-4" id="wishlist-container-main">
                <!-- Wishlist JS will render items here -->
                <div class="col-12 py-5 text-center text-muted w-100">
                    <h4 class="fw-bold text-uppercase" style="font-family: 'Archivo Black', sans-serif;">Loading...</h4>
                </div>
            </div>
        </div>
    </section>
    `;
    
    let newHtml = topPart + middlePart + bottomPart;
    // Fix title
    newHtml = newHtml.replace('<title>Urban Edge | Archive Sale - Up to 70% Off</title>', '<title>Urban Edge | Your Wishlist</title>');
    
    fs.writeFileSync('wishlist.html', newHtml, 'utf8');
    console.log('Successfully created wishlist.html');
} catch (e) {
    console.error('Error modifying file:', e);
}
