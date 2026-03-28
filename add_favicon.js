const fs = require('fs');
const path = require('path');

const dirPath = __dirname;
const faviconTag = '\n    <link rel="icon" type="image/png" href="image/fav-icon.png">';

fs.readdir(dirPath, (err, files) => {
    if (err) throw err;
    
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(dirPath, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Check if favicon already exists
            if (!content.includes('fav-icon.png')) {
                const headTagIndex = content.indexOf('<head>');
                if (headTagIndex !== -1) {
                    // insert right after <head>
                    content = content.substring(0, headTagIndex + 6) + 
                              faviconTag + 
                              content.substring(headTagIndex + 6);
                              
                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`Added favicon to ${file}`);
                }
            }
        }
    });
});
