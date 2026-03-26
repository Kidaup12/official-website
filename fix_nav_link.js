const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = content;

            // Replace span with anchor tag for direct navigation
            updated = updated.split('<span class="nav-link nav-link-dropdown">').join('<a href="docflow.html" class="nav-link nav-link-dropdown" style="text-decoration:none;">');

            // Replace SVG arrow to align visually
            updated = updated.split('</svg>\n                    </span>').join('</svg>\n                    </a>');
            updated = updated.split('</svg>\r\n                    </span>').join('</svg>\r\n                    </a>');

            // Just in case it's in a single line or minified
            updated = updated.split('</svg></span>').join('</svg></a>');

            if (updated !== content) {
                fs.writeFileSync(fullPath, updated, 'utf8');
                console.log('Updated ' + file);
            }
        }
    });
}

console.log('Starting HTML link replacement...');
processDir(__dirname);
console.log('Done replacement.');
