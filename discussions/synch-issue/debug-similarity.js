// Debug the similarity algorithm for specific cases

// Mock the normalize function from synch.actions.ts
const normalize = str => str
    .replace(/\s+/g, '')  // Remove all whitespace
    .replace(/\([^)]*\)/g, '()')  // Replace parameters with empty ()
    .replace(/([a-z])([A-Z])/g, '$1_$2')  // Convert camelCase to snake_case
    .toLowerCase();

function checkLinesSimilarity(line1, line2) {
    console.log(`\n🔍 SIMILARITY CHECK:`);
    console.log(`  Line1: "${line1}" (length: ${line1.length})`);
    console.log(`  Line2: "${line2}" (length: ${line2.length})`);
    
    if (line1.length !== line2.length) {
        console.log(`  ❌ Length mismatch: ${line1.length} vs ${line2.length}`);
        return false;
    }
    
    const norm1 = normalize(line1);
    const norm2 = normalize(line2);
    console.log(`  Normalized1: "${norm1}"`);
    console.log(`  Normalized2: "${norm2}"`);
    
    // Check for similarity using multiple approaches
    let result = norm1.startsWith(norm2) || norm2.startsWith(norm1);
    console.log(`  StartsWith result: ${result}`);
    
    // If startsWith fails, try underscore-split comparison for camelCase similarities
    if (!result) {
        const parts1 = norm1.split('_');
        const parts2 = norm2.split('_');
        console.log(`  Parts1: ${JSON.stringify(parts1)}`);
        console.log(`  Parts2: ${JSON.stringify(parts2)}`);
        
        // Check if parts structure is similar and individual parts are close
        if (parts1.length === parts2.length) {
            let matchingParts = 0;
            for (let i = 0; i < parts1.length; i++) {
                let partMatch = parts1[i] === parts2[i] || 
                    parts1[i].startsWith(parts2[i]) || 
                    parts2[i].startsWith(parts1[i]);
                
                if (!partMatch) {
                    // Check for character-level similarity (e.g., "load" vs "boad")
                    const part1 = parts1[i];
                    const part2 = parts2[i];
                    if (part1.length === part2.length && part1.length > 2) {
                        let differentChars = 0;
                        for (let j = 0; j < part1.length; j++) {
                            if (part1[j] !== part2[j]) {
                                differentChars++;
                            }
                        }
                        // Allow 1-2 character differences for parts longer than 2 chars
                        const maxDifferences = Math.min(2, Math.floor(part1.length * 0.3));
                        if (differentChars <= maxDifferences) {
                            partMatch = true;
                            console.log(`    Part ${i}: "${parts1[i]}" vs "${parts2[i]}" = ${partMatch} (fuzzy: ${differentChars}/${maxDifferences} chars different)`);
                        } else {
                            console.log(`    Part ${i}: "${parts1[i]}" vs "${parts2[i]}" = ${partMatch} (fuzzy failed: ${differentChars}/${maxDifferences} chars different)`);
                        }
                    } else {
                        console.log(`    Part ${i}: "${parts1[i]}" vs "${parts2[i]}" = ${partMatch}`);
                    }
                } else {
                    console.log(`    Part ${i}: "${parts1[i]}" vs "${parts2[i]}" = ${partMatch}`);
                }
                
                if (partMatch) {
                    matchingParts++;
                }
            }
            const threshold = Math.ceil(parts1.length * 0.7);
            result = matchingParts >= threshold;
            console.log(`  Parts comparison: ${matchingParts}/${parts1.length} parts match, threshold: ${threshold}`);
        }
    }
    
    console.log(`  Final result: ${result ? '✅ SIMILAR' : '❌ NOT SIMILAR'}`);
    return result;
}

console.log('=== TESTING SIMILARITY ALGORITHM ===');

// Test case 1: justLoad vs justBoad
console.log('\n--- Test Case 1: justLoad vs justBoad ---');
checkLinesSimilarity('    justLoad(var a, var b) {', '    justBoad(var a, var b) {');

// Test case 2: simpleMethod (exact match)
console.log('\n--- Test Case 2: simpleMethod exact match ---');
checkLinesSimilarity('    simpleMethod() {', '    simpleMethod() {');

// Test case 3: loading vs isLoading (different length - should fail)
console.log('\n--- Test Case 3: loading vs isLoading ---');
checkLinesSimilarity('  loading = false;', '  isLoading = false;');

console.log('\n=== TESTING COMPLETE ===');