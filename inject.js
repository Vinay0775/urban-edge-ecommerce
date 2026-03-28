const fs = require('fs');
const path = require('path');

const dirPath = __dirname;
const scriptTag = '<script src="cart.js"></script>';

fs.readdir(dirPath, (err, files) => {
    if (err) throw err;
    
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const filePath = path.join(dirPath, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Check if cart.js exists
            if (!content.includes('cart.js')) {
                const bodyTagIndex = content.lastIndexOf('</body>');
                if (bodyTagIndex !== -1) {
                    content = content.substring(0, bodyTagIndex) + 
                              '    ' + scriptTag + '\n' + 
                              content.substring(bodyTagIndex);
                } else {
                    content = content + '\n' + scriptTag;
                }
            }
            
            // Check if search.js exists
            if (!content.includes('search.js')) {
                const bodyTagIndex = content.lastIndexOf('</body>');
                if (bodyTagIndex !== -1) {
                    content = content.substring(0, bodyTagIndex) + 
                              '    <script src="search.js"></script>\n' + 
                              content.substring(bodyTagIndex);
                } else {
                    content = content + '\n<script src="search.js"></script>';
                }
            }
            // Check if wishlist.js exists
            if (!content.includes('wishlist.js')) {
                const bodyTagIndex = content.lastIndexOf('</body>');
                if (bodyTagIndex !== -1) {
                    content = content.substring(0, bodyTagIndex) + 
                              '    <script src="wishlist.js"></script>\n' + 
                              content.substring(bodyTagIndex);
                } else {
                    content = content + '\n<script src="wishlist.js"></script>';
                }
            }
            // Check if recent.js exists
            if (!content.includes('recent.js')) {
                const bodyTagIndex = content.lastIndexOf('</body>');
                if (bodyTagIndex !== -1) {
                    content = content.substring(0, bodyTagIndex) + 
                              '    <script src="recent.js"></script>\n' + 
                              content.substring(bodyTagIndex);
                } else {
                    content = content + '\n<script src="recent.js"></script>';
                }
            }
            // Check if auth.js exists
            if (!content.includes('auth.js')) {
                const bodyTagIndex = content.lastIndexOf('</body>');
                if (bodyTagIndex !== -1) {
                    content = content.substring(0, bodyTagIndex) + 
                              '    <script src="auth.js"></script>\n' + 
                              content.substring(bodyTagIndex);
                } else {
                    content = content + '\n<script src="auth.js"></script>';
                }
            }
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    });
});
