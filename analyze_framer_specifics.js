const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://calories.framer.website/', { waitUntil: 'networkidle' });

    const data = {
        navbar: null,
        reveals: [],
        staggers: [],
        hovers: [],
        parallax: [],
        progressBar: null
    };

    data.styles = await page.evaluate(() => {
        const res = {
            navbars: [],
            fixedElements: [],
            animations: [],
            grids: [],
            buttons: []
        };
        document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el);
            const tag = el.tagName.toLowerCase();
            const id = el.className || tag;

            // 1. Navbar / Sticky
            if (style.position === 'sticky' || style.position === 'fixed') {
                if (tag === 'nav' || style.top === '0px' || id.includes('nav')) {
                    res.navbars.push({
                        id,
                        position: style.position,
                        backdropFilter: style.backdropFilter,
                        backgroundColor: style.backgroundColor
                    });
                } else {
                    res.fixedElements.push({ id, zIndex: style.zIndex });
                }
            }

            // 2. Reveals & Setup (opacity != 1 or transform != none)
            if ((style.opacity !== '1' || style.transform !== 'none') && style.transitionDuration !== '0s') {
                res.animations.push({
                    id,
                    opacity: style.opacity,
                    transform: style.transform,
                    transition: style.transition
                });
            }

            // 3. Grids for stagger
            if (style.display === 'grid' || style.display === 'flex') {
                if (el.children.length > 2) {
                    const childrenStyles = Array.from(el.children).map(c => window.getComputedStyle(c).transitionDelay);
                    const hasStagger = new Set(childrenStyles).size > 1; // Different delays = stagger
                    if (hasStagger) {
                        res.grids.push({
                            id,
                            delays: childrenStyles
                        });
                    }
                }
            }

            // 4. Buttons / Interactive
            if (tag === 'button' || tag === 'a' || style.cursor === 'pointer') {
                res.buttons.push({
                    id,
                    transition: style.transition,
                    text: el.innerText ? el.innerText.substring(0, 15) : ''
                });
            }
        });
        return res;
    });

    fs.writeFileSync('motion_extracted.json', JSON.stringify(data.styles, null, 2));
    console.log('Saved to motion_extracted.json');
    await browser.close();
})();
