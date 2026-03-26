const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const targetDir = 'c:\\Users\\User\\Documents\\AntiG projects\\deploy-696a1966c01c1975662566a8';
walkDir(targetDir, function (filePath) {
    if (filePath.endsWith('.html')) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove Projects from menus
        content = content.replace(/\s*<a href="\.\.\/projects\.html"[^>]*>Projects.*<\/a>\s*\n?/g, '\n                ');
        content = content.replace(/\s*<li><a href="\.\.\/projects\.html"[^>]*>Projects.*<\/a><\/li>\s*\n?/g, '\n                ');
        content = content.replace(/\s*<a href="projects\.html"[^>]*>Projects.*<\/a>\s*\n?/g, '\n                ');
        content = content.replace(/\s*<li><a href="projects\.html"[^>]*>Projects.*<\/a><\/li>\s*\n?/g, '\n                ');

        // Standardize Schedule a Call in nav menus
        content = content.replace(/(<a href="[^"]*" data-cal-link="[^"]*"[^>]*>)Schedule [^<]*(<\/a>)/g, '$1Schedule a Call$2');

        fs.writeFileSync(filePath, content, 'utf8');
    }
});
console.log('Global Menu Update complete!');
