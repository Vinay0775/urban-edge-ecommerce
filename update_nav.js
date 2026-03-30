const fs = require('fs');

const files = ['clothing.html', 'men.html', 'women.html', 'essentials.html'];
const iconsMobile = `            <div class="d-flex align-items-center gap-3 ms-auto me-3 d-lg-none">
                <a href="#" class="fs-5 text-dark" style="text-decoration:none;"><i class="fa-regular fa-user"></i></a>
                <a href="cart.html" target="_blank" class="fs-5 text-dark" style="text-decoration:none;"><i class="fa-solid fa-bag-shopping"></i></a>
            </div>
            `;
const btnStartTarget = '<button class="navbar-toggler';
const iconsMenuTarget = '<div class="d-flex gap-3">';

files.forEach(file => {
    if(!fs.existsSync(file)) {
        console.log('Skipping ' + file + ' - not found');
        return;
    }
    let content = fs.readFileSync(file, 'utf8');
    
    // Add mobile icons before toggler
    if (!content.includes('d-flex align-items-center gap-3 ms-auto me-3 d-lg-none')) {
        content = content.replace(btnStartTarget, iconsMobile + btnStartTarget);
    }
    
    // Hide icons inside mobile menu
    if (content.includes(iconsMenuTarget)) {
        content = content.replace(iconsMenuTarget, '<div class="d-flex gap-3 d-none d-lg-flex">');
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
});
