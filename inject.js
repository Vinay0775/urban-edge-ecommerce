const fs = require('fs');
const path = require('path');

const dirPath = __dirname;
const requiredScripts = [
    '<script src="https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js"></script>',
    '<script src="https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore-compat.js"></script>',
    '<script src="firebase-init.js"></script>',
    '<script src="cart.js"></script>',
    '<script src="search.js"></script>',
    '<script src="wishlist.js"></script>',
    '<script src="recent.js"></script>',
    '<script src="auth.js"></script>'
];

fs.readdir(dirPath, (err, files) => {
    if (err) throw err;
    
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(dirPath, file);
            let content = fs.readFileSync(filePath, 'utf8');
            let isModified = false;
            
            // For each required script, check if it's in the file.
            // Using a simple identifier from the script tag
            requiredScripts.forEach(scriptTag => {
                // Extract filename/identifier part to check
                let identifier = scriptTag;
                if(scriptTag.includes('firebase-app-compat')) identifier = 'firebase-app-compat.js';
                else if(scriptTag.includes('firebase-firestore-compat')) identifier = 'firebase-firestore-compat.js';
                else if(scriptTag.includes('firebase-init.js')) identifier = 'firebase-init.js';
                else if(scriptTag.includes('cart.js')) identifier = 'cart.js';
                else if(scriptTag.includes('search.js')) identifier = 'search.js';
                else if(scriptTag.includes('wishlist.js')) identifier = 'wishlist.js';
                else if(scriptTag.includes('recent.js')) identifier = 'recent.js';
                else if(scriptTag.includes('auth.js')) identifier = 'auth.js';
                
                if (!content.includes(identifier)) {
                    const bodyTagIndex = content.lastIndexOf('</body>');
                    if (bodyTagIndex !== -1) {
                        content = content.substring(0, bodyTagIndex) + 
                                  '    ' + scriptTag + '\n' + 
                                  content.substring(bodyTagIndex);
                    } else {
                        content = content + '\n' + scriptTag;
                    }
                    isModified = true;
                }
            });
            
            if(isModified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Injected scripts into ${file}`);
            }
        }
    });
});
