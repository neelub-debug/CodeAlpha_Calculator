
const display = document.getElementById("display");

function appendToDisplay(input) {
  if (input === "*") {
    display.value += "×";
  } else if (input === "/") {
    display.value += "÷";
  } else {
    display.value += input;
  }
}

function clearDisplay() {
  display.value = "";
}

function calculate() {
  try {
    let expression = display.value.replace(/×/g, "*").replace(/÷/g, "/");
    display.value = eval(expression);
  } catch (error) {
    display.value = "Error";
  }
}
