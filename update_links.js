const fs = require('fs');
const path = require('path');

const dirPath = __dirname;

fs.readdir(dirPath, (err, files) => {
    if (err) throw err;
    
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(dirPath, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Fix Track Order link
            content = content.replace(/href="[^"]*"(.*?)>Track Order<\/a>/g, 'href="track.html"$1>Track Order</a>');
            
            // Fix Contact Us link
            content = content.replace(/href="[^"]*"(.*?)>Contact Us<\/a>/g, 'href="contact.html"$1>Contact Us</a>');
            content = content.replace(/href="[^"]*"(.*?)>Contact Information<\/a>/g, 'href="contact.html"$1>Contact Information</a>');
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated Links in ${file}`);
        }
    });
});
