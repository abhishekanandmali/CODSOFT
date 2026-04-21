const display = document.getElementById("display");
const buttons = document.getElementById("buttons");

let currentInput = "0";
let resetOnNextDigit = false;

function renderDisplay(value) {
  display.value = value;
}

function isOperator(char) {
  return ["+", "-", "*", "/", "%"].includes(char);
}

function appendDigitOrDot(value) {
  if (resetOnNextDigit) {
    currentInput = "0";
    resetOnNextDigit = false;
  }

  if (value === ".") {
    const parts = currentInput.split(/[\+\-\*\/%]/);
    const lastPart = parts[parts.length - 1];
    if (lastPart.includes(".")) {
      return;
    }
  }

  if (currentInput === "0" && value !== ".") {
    currentInput = value;
  } else {
    currentInput += value;
  }
}

function appendOperator(operator) {
  if (resetOnNextDigit) {
    resetOnNextDigit = false;
  }

  const lastChar = currentInput[currentInput.length - 1];
  if (isOperator(lastChar)) {
    currentInput = currentInput.slice(0, -1) + operator;
  } else {
    currentInput += operator;
  }
}

function clearAll() {
  currentInput = "0";
  resetOnNextDigit = false;
}

function backspace() {
  if (resetOnNextDigit) {
    clearAll();
    return;
  }

  currentInput = currentInput.slice(0, -1);
  if (!currentInput || currentInput === "-") {
    currentInput = "0";
  }
}

function sanitizeExpression(expression) {
  let cleaned = "";
  for (let i = 0; i < expression.length; i += 1) {
    const ch = expression[i];
    if ("0123456789.+-*/%".includes(ch)) {
      cleaned += ch;
    }
  }
  return cleaned;
}

function evaluateExpression() {
  try {
    let expression = sanitizeExpression(currentInput);
    expression = expression.replace(/[%]/g, "/100*");
    const result = Function(`"use strict"; return (${expression})`)();

    if (!Number.isFinite(result)) {
      currentInput = "Error";
    } else {
      currentInput = Number.isInteger(result)
        ? String(result)
        : String(parseFloat(result.toFixed(8)));
    }
  } catch (error) {
    currentInput = "Error";
  }
  resetOnNextDigit = true;
}

buttons.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const { value, action } = target.dataset;

  if (action === "clear") {
    clearAll();
  } else if (action === "backspace") {
    backspace();
  } else if (action === "equals") {
    evaluateExpression();
  } else if (value) {
    if (currentInput === "Error") {
      clearAll();
    }

    if (isOperator(value)) {
      appendOperator(value);
    } else {
      appendDigitOrDot(value);
    }
  }

  renderDisplay(currentInput);
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9]$/.test(key) || key === ".") {
    appendDigitOrDot(key);
  } else if (isOperator(key)) {
    appendOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    evaluateExpression();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearAll();
  } else {
    return;
  }

  renderDisplay(currentInput);
});
