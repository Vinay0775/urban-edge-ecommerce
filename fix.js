const fs = require('fs');
let html = fs.readFileSync('cart.html', 'utf8');
const startTag = '<div class="row g-5">';
const endTag = '</section>';
const startIndex = html.indexOf(startTag);
const endIndex = html.indexOf(endTag, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = `
            <div class="row g-5 cart-system-wrapper">
                <div class="col-lg-8" id="cart-container-main">
                    <div class="text-center py-5">
                       <h4 class="fw-bold text-uppercase" style="font-family: 'Archivo Black', sans-serif;">Loading Bag...</h4>
                    </div>
                </div>
                <div class="col-lg-4" id="cart-summary-main">
                </div>
            </div>
        </div>
    `;
    html = html.substring(0, startIndex) + newContent + html.substring(endIndex);
    fs.writeFileSync('cart.html', html, 'utf8');
    console.log('Fixed cart.html');
} else {
    console.log('Could not find tags');
}
