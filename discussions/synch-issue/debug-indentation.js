// Debug the indentation similarity issue

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
    
    // Pre-normalize to check if only whitespace differs
    const norm1 = normalize(line1);
    const norm2 = normalize(line2);
    console.log(`  Normalized1: "${norm1}"`);
    console.log(`  Normalized2: "${norm2}"`);
    
    // If normalized versions are identical, allow the match regardless of length
    if (norm1 === norm2) {
        console.log(`  ✅ Identical after normalization (whitespace-only difference)`);
        return true;
    }

    // For other cases, still apply length check to avoid false positives
    if (line1.length !== line2.length) {
        console.log(`  ❌ Length mismatch: ${line1.length} vs ${line2.length}`);
        return false;
    }
    
    // Check for similarity using multiple approaches
    let result = norm1.startsWith(norm2) || norm2.startsWith(norm1);
    console.log(`  StartsWith result: ${result}`);
    
    console.log(`  Final result: ${result ? '✅ SIMILAR' : '❌ NOT SIMILAR'}`);
    return result;
}

console.log('=== TESTING INDENTATION SIMILARITY ===');

// Test the actual failing case
console.log('\n--- Test: Different Indentation ---');
checkLinesSimilarity('    simpleMethod() {', '  simpleMethod() {');

console.log('\n=== TESTING COMPLETE ===');