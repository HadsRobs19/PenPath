// ============================================================================
// TASK 1: Sum Two Numbers
// ============================================================================
// This function takes two numbers and returns their sum.
// Simple arithmetic addition operation.

const sumTwoNumbers = (num1, num2) => {
  return num1 + num2;
};

// Example usage:
console.log("=== Task 1: Sum Two Numbers ===");
console.log("sumTwoNumbers(5, 3):", sumTwoNumbers(5, 3));       // 8
console.log("sumTwoNumbers(-2, 7):", sumTwoNumbers(-2, 7));     // 5
console.log("sumTwoNumbers(0, 0):", sumTwoNumbers(0, 0));       // 0
console.log("");


// ============================================================================
// TASK 2: Print Even Elements
// ============================================================================
// This function iterates through an array and prints only the even numbers.
// Uses modulo operator (%) to check if a number is divisible by 2.
// Returns nothing (void) - only logs to console.

const printEvenElements = (arr) => {
  for (const element of arr) {
    if (element % 2 === 0) {
      console.log(element);
    }
  }
};

// Example usage:
console.log("=== Task 2: Print Even Elements ===");
console.log("printEvenElements([1, 2, 3, 4, 5, 6, 7, 8]):");
printEvenElements([1, 2, 3, 4, 5, 6, 7, 8]); // Logs: 2, 4, 6, 8
console.log("");


// ============================================================================
// TASK 3: Find Common Elements
// ============================================================================
// This function finds elements that exist in both arrays.
// Uses Set to eliminate duplicates from the result.
// Returns a new array with unique common elements.

const findCommonElements = (a1, a2) => {
  const set2 = new Set(a2);
  const common = a1.filter((element) => set2.has(element));
  return [...new Set(common)]; // Remove duplicates
};

// Example usage:
console.log("=== Task 3: Find Common Elements ===");
console.log("findCommonElements([1, 2, 3, 4], [3, 4, 5, 6]):",
  findCommonElements([1, 2, 3, 4], [3, 4, 5, 6])); // [3, 4]
console.log("findCommonElements([1, 1, 2, 2], [2, 2, 3, 3]):",
  findCommonElements([1, 1, 2, 2], [2, 2, 3, 3])); // [2]
console.log("findCommonElements([1, 2], [3, 4]):",
  findCommonElements([1, 2], [3, 4])); // []
console.log("");


// ============================================================================
// TASK 4: Filter -> Map -> Reduce Chain
// ============================================================================
// This demonstrates method chaining with array methods:
// 1. filter: keeps only numbers >= 10
// 2. map: doubles each remaining number
// 3. reduce: sums all the doubled numbers

const processNumbers = (numbers) => {
  // Step 1: Filter out numbers less than 10
  const filtered = numbers.filter((n) => n >= 10);
  console.log("After filter (>= 10):", filtered);

  // Step 2: Map to double each value
  const doubled = filtered.map((n) => n * 2);
  console.log("After map (doubled):", doubled);

  // Step 3: Reduce to sum
  const sum = doubled.reduce((acc, n) => acc + n, 0);
  console.log("After reduce (sum):", sum);

  return sum;
};

// Same operation chained in one expression:
const processNumbersChained = (numbers) => {
  return numbers
    .filter((n) => n >= 10)
    .map((n) => n * 2)
    .reduce((acc, n) => acc + n, 0);
};

// Example usage:
console.log("=== Task 4: Filter -> Map -> Reduce ===");
const testNumbers = [5, 10, 15, 3, 20, 8, 25];
console.log("Input array:", testNumbers);
const result = processNumbers(testNumbers);
// filter: [10, 15, 20, 25] (removed 5, 3, 8)
// map: [20, 30, 40, 50] (doubled)
// reduce: 140 (sum)
console.log("Final result:", result);
console.log("Chained version result:", processNumbersChained(testNumbers));
console.log("");


// ============================================================================
// TASK 5: Calculate Factorial
// ============================================================================
// This function calculates the factorial of a non-negative integer.
// Factorial of n (n!) = n * (n-1) * (n-2) * ... * 1
// Special case: 0! = 1
// Includes input validation to ensure n is a non-negative integer.

const calculateFactorial = (n) => {
  // Input validation
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new Error("Input must be an integer");
  }
  if (n < 0) {
    throw new Error("Input must be a non-negative integer");
  }

  // Calculate factorial using for loop
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

// Example usage:
console.log("=== Task 5: Calculate Factorial ===");
console.log("calculateFactorial(0):", calculateFactorial(0));   // 1
console.log("calculateFactorial(1):", calculateFactorial(1));   // 1
console.log("calculateFactorial(5):", calculateFactorial(5));   // 120
console.log("calculateFactorial(10):", calculateFactorial(10)); // 3628800

// Demonstrating validation:
try {
  calculateFactorial(-1);
} catch (e) {
  console.log("calculateFactorial(-1) error:", e.message);
}

try {
  calculateFactorial(3.5);
} catch (e) {
  console.log("calculateFactorial(3.5) error:", e.message);
}
