const display = document.getElementById("display");
const OPERATORS = ["+", "-", "×", "÷"];
let justCalculated = false; // true right after "=" (or an error)

function appendToDisplay(input) {
  // Keyboard keys "*" and "/" are shown as × and ÷
  const symbols = { "*": "×", "/": "÷" };
  input = symbols[input] || input;

  // After an error, start fresh
  if (display.value === "Error") {
    display.value = "";
    justCalculated = false;
  }

  // After a result: an operator continues the result, anything else starts a new calculation
  if (justCalculated) {
    if (!OPERATORS.includes(input) && input !== "%") display.value = "";
    justCalculated = false;
  }

  const last = display.value.slice(-1);

  if (OPERATORS.includes(input)) {
    // Only "-" is allowed at the start (negative number)
    if (display.value === "" && input !== "-") return;
    // Replace the previous operator instead of stacking two (e.g. "5+×3")
    if (OPERATORS.includes(last)) {
      display.value = display.value.slice(0, -1) + input;
      return;
    }
  }

  // "%" needs a number before it
  if (input === "%" && (display.value === "" || OPERATORS.includes(last) || last === "(")) return;

  // Only one "." per number
  if (input === ".") {
    const currentNumber = display.value.split(/[+\-×÷()%]/).pop();
    if (currentNumber.includes(".")) return;
  }

  display.value += input;
}

function clearDisplay() {
  display.value = "";
  justCalculated = false;
}

function deleteLast() {
  if (justCalculated || display.value === "Error") {
    clearDisplay();
  } else {
    display.value = display.value.slice(0, -1);
  }
}

function calculate() {
  if (display.value === "" || display.value === "Error") return;
  try {
    const result = evaluate(display.value);
    if (!isFinite(result)) throw new Error("Invalid result");
    // toFixed removes floating point noise (0.1 + 0.2 -> 0.3)
    display.value = String(parseFloat(result.toFixed(10)));
  } catch (error) {
    display.value = "Error";
  }
  justCalculated = true;
}

// Safe expression evaluator (replaces eval)
// Supports + - × ÷ ( ) % and negative numbers
function evaluate(expression) {
  const tokens = expression.match(/\d+\.?\d*|\.\d+|[+\-×÷()%]/g) || [];
  if (tokens.join("") !== expression) throw new Error("Invalid characters");

  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  // Lowest priority: + and -
  function parseExpression() {
    let value = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      const right = parseTerm();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }

  // Higher priority: × and ÷
  function parseTerm() {
    let value = parseFactor();
    while (peek() === "×" || peek() === "÷") {
      const op = next();
      const right = parseFactor();
      if (op === "÷" && right === 0) throw new Error("Division by zero");
      value = op === "×" ? value * right : value / right;
    }
    return value;
  }

  // Highest priority: numbers, brackets, negative sign, %
  function parseFactor() {
    if (peek() === "-") { next(); return -parseFactor(); }
    if (peek() === "+") { next(); return parseFactor(); }

    let value;
    if (peek() === "(") {
      next();
      value = parseExpression();
      if (next() !== ")") throw new Error("Missing )");
    } else {
      const token = next();
      if (token === undefined || isNaN(token)) throw new Error("Number expected");
      value = parseFloat(token);
    }
    while (peek() === "%") { next(); value /= 100; }
    return value;
  }

  const result = parseExpression();
  if (pos < tokens.length) throw new Error("Unexpected token");
  return result;
}

// Keyboard support
document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key.length === 1 && "0123456789.+-*/()%".includes(key)) {
    event.preventDefault();
    appendToDisplay(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault(); // stops a focused button from being clicked again
    calculate();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape" || key === "c" || key === "C") {
    clearDisplay();
  }
});