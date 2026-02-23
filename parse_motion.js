const fs = require('fs');
const data = JSON.parse(fs.readFileSync('motion_data.json', 'utf-8'));

console.log(`Found ${data.snapshots.length} snapshots`);
console.log(`Found ${data.rawConfigs.length} scripts with motion config`);

if (data.rawConfigs.length > 0) {
    // Try to find common framer motion patterns like transition: { stiffness, damping }
    const scriptContent = Object.values(data.rawConfigs).join('\n');
    const transitions = scriptContent.match(/"transition":\{[^}]+\}/g);
    if (transitions) {
        const uniqueTransitions = [...new Set(transitions)];
        console.log("Raw Transitions Extracted:");
        uniqueTransitions.slice(0, 10).forEach(t => console.log(t));
    } else {
        console.log("No explicit transition blocks found in scripts.");
    }
}

// Check how transforms changed between depth 0 and 500
const depth0 = data.snapshots[0] || [];
const depth500 = data.snapshots[1] || [];

depth0.forEach(el0 => {
    const el500 = depth500.find(e => e.id === el0.id);
    if (el500) {
        if (el0.transform !== el500.transform || el0.opacity !== el500.opacity) {
            console.log(`Changed on scroll: ${el0.id}`);
            console.log(`  Opacity: ${el0.opacity} -> ${el500.opacity}`);
            console.log(`  Transform: ${el0.transform} -> ${el500.transform}`);
            console.log(`  Transition: ${el0.transition}`);
        }
    }
});
