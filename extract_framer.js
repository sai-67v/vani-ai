const https = require('https');
const fs = require('fs');

https.get('https://calories.framer.website/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        // Find all CSS variables
        const regex = /--[a-zA-Z0-9-]+:\s*[^;}]+(?=[;}])/g;
        const matches = data.match(regex);
        if (matches) {
            const unique = [...new Set(matches.map(m => m.trim()))];

            // Group by Token, Framer, and Other
            const tokens = unique.filter(m => m.startsWith('--token'));
            const framer = unique.filter(m => m.startsWith('--framer'));
            const other = unique.filter(m => !m.startsWith('--token') && !m.startsWith('--framer'));

            const result = {
                tokens: tokens,
                framer: framer,
                other: other
            };

            fs.writeFileSync('tokens.json', JSON.stringify(result, null, 2));
            console.log(`Saved ${tokens.length} tokens, ${framer.length} framer vars, ${other.length} other vars to tokens.json`);
        } else {
            console.log("No variables found.");
        }
    });
}).on('error', (err) => {
    console.error('Error fetching:', err.message);
});
