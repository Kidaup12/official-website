const fs = require('fs');
const path = require('path');

function replaceInFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInFiles(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = content;

            // Remove hardcoded width inline CSS
            updated = updated.split('class="dropdown-menu" style="width: 280px;"').join('class="dropdown-menu"');
            updated = updated.split('class="dropdown-menu" style="width: 260px;"').join('class="dropdown-menu"');

            // Remove highlighted dropdown background box on Contact link
            updated = updated.split('style="background: rgba(46, 139, 87, 0.15); border-left: 3px solid var(--color-accent); padding-left: 13px;"').join('');

            if (updated !== content) {
                fs.writeFileSync(fullPath, updated, 'utf8');
                console.log('Fixed styling in ' + fullPath);
            }
        }
    });
}

console.log('Starting html spacing replacement...');
replaceInFiles(__dirname);
console.log('Done scanning.');
