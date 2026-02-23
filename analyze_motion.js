const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    console.log('Starting Playwright...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://calories.framer.website/', { waitUntil: 'networkidle' });

    // Let's record styles at different scroll depths
    const recordMotion = async (depth) => {
        return await page.evaluate((d) => {
            const data = [];
            document.querySelectorAll('*').forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.transform !== 'none' && style.transform !== 'matrix(1, 0, 0, 1, 0, 0)' || style.opacity !== '1' || style.transition !== 'all 0s ease 0s') {
                    // Identify element somewhat uniquely
                    let id = el.className || el.tagName;
                    if (el.innerText) id += ' -> ' + el.innerText.substring(0, 20).replace(/\n/g, '');
                    data.push({
                        depth: d,
                        id: id,
                        transform: style.transform,
                        opacity: style.opacity,
                        transition: style.transition,
                        willChange: style.willChange
                    });
                }
            });
            return data;
        }, depth);
    };

    const snapshots = [];
    snapshots.push(await recordMotion(0));

    for (let i = 1; i <= 5; i++) {
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(1000); // Wait for animations to settle somewhat or trigger
        snapshots.push(await recordMotion(i * 500));
    }

    // extract __NEXT_DATA__ or similar script tags to look for raw config
    const rawConfigs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('script')).map(s => s.innerText).filter(s => s.includes('variants') && s.includes('transition'));
    });

    fs.writeFileSync('motion_data.json', JSON.stringify({ snapshots, rawConfigs }, null, 2));
    console.log('Saved snapshot to motion_data.json');

    await browser.close();
})();
