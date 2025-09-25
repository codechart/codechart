// Test the new tokenization-based similarity algorithm

// Tokenize function from synch.actions.ts
const tokenize = (str) => {
    // Remove leading/trailing whitespace
    str = str.trim();
    
    // Extract parameters if present
    let params = [];
    str = str.replace(/\(([^)]*)\)/, (match, p1) => {
        if (p1.trim()) {
            // Split parameters by comma and clean them
            params = p1.split(',').map(s => s.trim());
        }
        return ''; // Remove parentheses temporarily
    });
    
    // Remove braces and their contents
    str = str.replace(/\{.*\}/, '');
    
    // Remove remaining symbols like = ; etc
    str = str.replace(/[=;]/g, ' ');
    
    // Remove extra whitespace
    str = str.replace(/\s+/g, ' ').trim();
    
    // Convert camelCase to snake_case for splitting
    str = str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    
    // Split on underscore and space
    let parts = str.split(/[_\s]+/).filter(p => p.length > 0);
    
    // Add parameters as separate tokens
    if (params.length > 0) {
        parts = parts.concat(params);
    }
    
    return parts;
};

function checkLinesSimilarity(line1, line2) {
    console.log(`\n🔍 SIMILARITY CHECK:`);
    console.log(`  Line1: "${line1}"`);
    console.log(`  Line2: "${line2}"`);
    
    // Tokenize both lines
    const tokens1 = tokenize(line1);
    const tokens2 = tokenize(line2);
    
    console.log(`  Tokens1: ${JSON.stringify(tokens1)}`);
    console.log(`  Tokens2: ${JSON.stringify(tokens2)}`);
    
    // Quick check: if tokens are identical, it's a match
    if (tokens1.join('|') === tokens2.join('|')) {
        console.log(`  ✅ Identical tokens`);
        return true;
    }
    
    // For different token counts, check if one is subset of other (for indentation differences)
    if (tokens1.length !== tokens2.length) {
        // If core tokens match (ignoring length), it might just be whitespace difference
        const minLen = Math.min(tokens1.length, tokens2.length);
        let coreMatch = true;
        for (let i = 0; i < minLen; i++) {
            if (tokens1[i] !== tokens2[i]) {
                coreMatch = false;
                break;
            }
        }
        if (coreMatch && Math.abs(tokens1.length - tokens2.length) <= 2) {
            console.log(`  ✅ Core tokens match with minor difference`);
            return true;
        }
    }
    
    // Token-based similarity comparison
    if (tokens1.length === tokens2.length && tokens1.length > 0) {
        let matchingTokens = 0;
        for (let i = 0; i < tokens1.length; i++) {
            const match = tokens1[i] === tokens2[i] || 
                tokens1[i].startsWith(tokens2[i]) || 
                tokens2[i].startsWith(tokens1[i]);
            console.log(`    Token ${i}: "${tokens1[i]}" vs "${tokens2[i]}" = ${match}`);
            if (match) {
                matchingTokens++;
            }
        }
        
        // Use 70% threshold for similarity
        const threshold = Math.ceil(tokens1.length * 0.7);
        const result = matchingTokens >= threshold;
        
        console.log(`  Token comparison: ${matchingTokens}/${tokens1.length} match, threshold: ${threshold}`);
        console.log(`  Result: ${result ? '✅ SIMILAR' : '❌ NOT SIMILAR'}`);
        
        return result;
    }
    
    console.log(`  ❌ Not similar`);
    return false;
}

console.log('=== TESTING TOKENIZATION-BASED SIMILARITY ===');

// Test case 1: justLoad vs justBoad with parameters
console.log('\n--- Test 1: justLoad vs justBoad ---');
checkLinesSimilarity('    justLoad(var a, var b) {', '    justBoad(var a, var b) {');

// Test case 2: simpleMethod with different indentation  
console.log('\n--- Test 2: Different indentation ---');
checkLinesSimilarity('    simpleMethod() {', '  simpleMethod() {');

// Test case 3: loading vs isLoading (should fail - different structure)
console.log('\n--- Test 3: loading vs isLoading ---');
checkLinesSimilarity('  loading = false;', '  isLoading = false;');

// Test case 4: Exact match
console.log('\n--- Test 4: Exact match ---');
checkLinesSimilarity('  constructor(private http: HttpClient) {}', '  constructor(private http: HttpClient) {}');

// Test case 5: deleteUser with parameter
console.log('\n--- Test 5: deleteUser ---');
checkLinesSimilarity('    deleteUser(id: number) {', '    deleteUser(id: number) {');

console.log('\n=== TESTING COMPLETE ===');