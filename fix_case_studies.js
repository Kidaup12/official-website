const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\User\\Documents\\AntiG projects\\deploy-696a1966c01c1975662566a8\\case-studies';

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.html')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Add evenup-theme.css if missing
        if (!content.includes('evenup-theme.css')) {
            content = content.replace(
                '<link rel="stylesheet" href="../customers.css">',
                '<link rel="stylesheet" href="../evenup-theme.css">\n    <link rel="stylesheet" href="../customers.css">'
            );
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Fixed ' + file);
        }
    }
});
console.log('Done fixing case study styles.');
