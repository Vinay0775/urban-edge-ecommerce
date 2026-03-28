const fs = require('fs');
const path = require('path');

const dirPath = __dirname;

fs.readdir(dirPath, (err, files) => {
    if (err) throw err;
    
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(dirPath, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Sales Links
            content = content.replace(/href="[^"]*"(.*?)>Women's Sale<\/a>/g, 'href="sales.html"$1>Women\'s Sale</a>');
            content = content.replace(/href="[^"]*"(.*?)>Men's Sale<\/a>/g, 'href="sales.html"$1>Men\'s Sale</a>');
            content = content.replace(/href="[^"]*"(.*?)>Accessories Sale<\/a>/g, 'href="sales.html"$1>Accessories Sale</a>');
            
            // Collection Links
            content = content.replace(/href="[^"]*"(.*?)>Urban Collection<\/a>/g, 'href="collections.html"$1>Urban Collection</a>');
            content = content.replace(/href="[^"]*"(.*?)>DT Classics<\/a>/g, 'href="collections.html"$1>DT Classics</a>');
            
            // About Links
            content = content.replace(/href="[^"]*"(.*?)>Our Story<\/a>/g, 'href="contact.html"$1>Our Story</a>');
            content = content.replace(/href="[^"]*"(.*?)>Sustainability Initiatives<\/a>/g, 'href="contact.html"$1>Sustainability Initiatives</a>');
            
            // Policy Links
            content = content.replace(/href="[^"]*"(.*?)>Privacy Policy<\/a>/g, 'href="policy.html"$1>Privacy Policy</a>');
            content = content.replace(/href="[^"]*"(.*?)>Refund Policy<\/a>/g, 'href="policy.html"$1>Refund Policy</a>');
            content = content.replace(/href="[^"]*"(.*?)>Terms of Service<\/a>/g, 'href="policy.html"$1>Terms of Service</a>');
            
            // Search Footer Link
            content = content.replace(/href="[^"]*"(.*?)>Search<\/a>/g, 'href="index.html"$1>Search</a>');
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated All Links in ${file}`);
        }
    });
});
