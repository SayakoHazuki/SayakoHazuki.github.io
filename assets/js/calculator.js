/* math.js angle config */
let replacements = {};

// our extended configuration options
const config = {
  angles: "deg", // 'rad', 'deg', 'grad'
};

// create trigonometric functions replacing the input depending on angle config
const fns1 = ["sin", "cos", "tan", "sec", "cot", "csc"];
fns1.forEach(function (name) {
  const fn = math[name]; // the original function

  const fnNumber = function (x) {
    // convert from configured type of angles to radians
    switch (config.angles) {
      case "deg":
        return fn((x / 360) * 2 * Math.PI);
      case "grad":
        return fn((x / 400) * 2 * Math.PI);
      default:
        return fn(x);
    }
  };

  // create a typed-function which check the input types
  replacements[name] = math.typed(name, {
    number: fnNumber,
    "Array | Matrix": function (x) {
      return math.map(x, fnNumber);
    },
  });
});

// create trigonometric functions replacing the output depending on angle config
const fns2 = ["asin", "acos", "atan", "atan2", "acot", "acsc", "asec"];
fns2.forEach(function (name) {
  const fn = math[name]; // the original function

  const fnNumber = function (x) {
    const result = fn(x);

    if (typeof result === "number") {
      // convert to radians to configured type of angles
      switch (config.angles) {
        case "deg":
          return (result / 2 / Math.PI) * 360;
        case "grad":
          return (result / 2 / Math.PI) * 400;
        default:
          return result;
      }
    }

    return result;
  };

  // create a typed-function which check the input types
  replacements[name] = math.typed(name, {
    number: fnNumber,
    "Array | Matrix": function (x) {
      return math.map(x, fnNumber);
    },
  });
});

// import all replacements into math.js, override existing trigonometric functions
math.import(replacements, { override: true });

// Utility Functions
function autoCloseBrackets(str) {
  const open_paren_len = (str.match(/\(/g) || []).length;
  const close_paren_len = (str.match(/\)/g) || []).length;
  if (open_paren_len > close_paren_len) {
    str = `${str}${")".repeat(open_paren_len - close_paren_len)}`;
  }
  return str;
}

function replaceRandom(string) {
  while (string.includes("Ran#")) {
    string = string.replace("Ran#", math.round(Math.random(), 3));
  }
  return string;
}

// Errors

class MathError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
  }
}

class SyntaxError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
  }
}

// MAIN ===================================

class CalcButton {
  constructor(
    elementId,
    text,
    operation,
    {
      shiftFunc,
      shiftText,
      alphaFunc,
      alphaText,
      altText,
      empty,
      symbol,
      enabled = 1,
      style = 1,
      opIdentifier,
    } = {}
  ) {
    if (empty) {
      this.empty = true;
      return;
    }
    this.id = elementId;
    this.selector = `#${elementId}.calc-btn`;
    this.text = text;
    this.operation = operation;
    this.opIdentifier = opIdentifier;
    if (isNaN(style)) style = 1;
    this.style = style;

    this.element = $(this.selector);

    this.shiftFunc = shiftFunc;
    this.shiftText = shiftText;
    this.alphaFunc = alphaFunc;
    this.alphaText = alphaText;

    this.altText = altText;
    this.symbol = symbol;

    this.enabled = enabled;
  }
}

class NumberButton extends CalcButton {
  constructor(elementId, number, options) {
    super(elementId, number.toString(), "numberOperation", options);
    this.params = [number];
  }
}

class SciOperatorButton extends CalcButton {
  constructor(elementId, text, operation, options = {}) {
    options.style = 0;
    super(elementId, text, "SciOperation", options);
    this.params = [operation, options.shiftOperation];
  }
}

class OperatorButton extends CalcButton {
  constructor(elementId, operation, options = {}) {
    super(elementId, operation, "MathOperation", options);
    this.params = [operation];
  }
}

class BasicButton extends CalcButton {
  constructor(type) {
    if (type === "hyp") {
      super(type, ESPACE, "toggle", {
        alphaText: "C",
        style: 0,
      });
    } else {
      super(type, ESPACE, `toggle`, {
        altText: type.toUpperCase(),
        style: type === "mode" || type === "power" ? 3 : 2,
      });
    }
  }
}

class MenuButton extends CalcButton {
  constructor(text, options = {}) {
    options.style = 4;
    super(text.toLowerCase(), text, "openMenu", {
      style: 4,
    });
  }
}

class CalcDpad {
  constructor() {
    this.style = "dpad";
    this.element = $(
      '<div id="calc-controller-container"><div class="calc-controller-transform"><div class="calc-dpad-parent"><div id="calc-dpad1"><span></span></div><div id="calc-dpad2"><span></span></div></div><div  class="calc-dpad-parent"><div id="calc-dpad3"><span></span></div><div id="calc-dpad4"><span></span></div></div></div></div>'
    );
  }
}

class Calculator {
  constructor() {
    this.topDisplay = $("#display-top");
    this.mainDisplay = $("#display-main");

    this.currentEquation = [];
    this.equationLog = [];

    this.cursorpos = 0;

    this.vars = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      X: 0,
      Y: 0,
      M: 0,
    };
    this.storedAnswer = 0;

    this._tempClearDisplay = (type, secs = 0.02) => {
      switch (type) {
        case "top":
          this.topDisplay.text(" ");
          break;
        case "main":
          this.mainDisplay.text(" ");
          break;
        default:
          this.topDisplay.text(" ");
          this.mainDisplay.text(" ");
          break;
      }
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, secs * 1000);
      });
    };
  }

  get equationMathString() {
    let math_equation = replaceRandom(this.equationDisplayString);
    math_equation = math_equation
      .replace(/Ans/g, `(${this.storedAnswer})`)
      .replace(/Abs\(/g, "abs(")
      .replace(/(sin|cos|tan)⁻¹\(/g, "a$1(")
      .replace(/log/g, "log10")
      .replace(/³√\(/g, "cbrt(")
      .replace(/√\(/g, "sqrt(")
      .replace(/\u00d7/g, "*")
      .replace(/\u231f\s?/g, "/")
      .replace(/÷/g, "/")
      .replace(/π/g, "pi")
      .replace(/⁻¹/g, "^(-1)")
      .replace(/²/g, "^(2)")
      .replace(/³/g, "^(3)")
      .replace(/A/g, `(${this.vars.A})`)
      .replace(/B/g, `(${this.vars.B})`)
      .replace(/C/g, `(${this.vars.C})`)
      .replace(/D/g, `(${this.vars.D})`)
      .replace(/M/g, `(${this.vars.M})`);
    math_equation = autoCloseBrackets(math_equation);

    console.log(`Math equation: ${math_equation}`);
    return math_equation;
  }

  get equationDisplayString() {
    let equation = this.currentEquation;
    equation = equation.join("");
    return equation;
  }

  _clearDisplay() {
    this.topDisplay.text(" ");
    this.mainDisplay.text(" ");
  }

  _displayTop(equation) {
    this._tempClearDisplay("top", 0.02).then(() => {
      this.topDisplay.text(equation);
    });
  }

  _displayMain(equation) {
    console.log(equation);
    this._tempClearDisplay("main", 0.02).then(() => {
      this.mainDisplay.text(equation);
    });
  }

  displayEquation(offset = 0) {
    if (offset === 0) {
      this._displayTop(this.equationDisplayString);
    } else {
      logLength = this.equationLog.length;
      targetEquationPos = logLength - 1 - Math.abs(offset);
      if (!this.equationLog[targetEquationPos]) return;
      this._displayTop(this.equationLog[targetEquationPos]);
    }
  }

  displayAnswer({ ans, exponential, isExponential }) {
    if (!isExponential) return this._displayMain(ans);
    this._displayMain(ans);
    console.log(exponential);
  }

  execute() {
    let ans = math.evaluate(this.equationMathString).toString();
    console.log(`evaluated: ${ans}`);

    if (ans === "Infinity") {
      throw new MathError("Infinity");
    }

    if (Number(ans) === null || isNaN(Number(ans))) {
      throw new MathError("NaN");
    }

    let answer_numbers_length = ans.replace(/\./g, "").length;
    if (ans.includes("e+")) {
      answer_numbers_length = ans.split("e+")[1];
    }
    if (ans.includes("e-")) {
      answer_numbers_length = 11;
    }

    if (answer_numbers_length >= 100) {
      throw new MathError("Too Large");
    }

    if (answer_numbers_length > 10) {
      ans = Number(ans).toExponential(9).toString();

      this.displayAnswer({
        ans: ans.split("e")[0],
        exponential: Number(ans.split("e")[1]),
        isExponential: true,
      });
    } else {
      this.displayAnswer({ ans, isExponential: false });
    }

    this.shiftEquation();
  }

  shiftEquation() {
    this.equationLog.push(this.currentEquation);
    this.currentEquation = [];
  }

  toggleShift() {
    console.log("toggle shift");
  }

  toggleAlpha() {
    console.log("toggle alpha");
  }

  switchMode() {
    return;
  }

  powerOn() {
    return;
  }

  runProgram() {
    console.log(`run program`);
  }

  runFormula() {
    console.log(`run formula`);
  }

  mathOperation(id) {
    console.log(`math op ${id}`);
    let to_add = [];
    switch (id) {
      case "reciprocal":
        to_add.push("!");
        break;
      case "cube":
        to_add.push(SUP3);
        break;
      case "sqrt":
        to_add.push(SQRT + "(");
        break;
      case "square":
        to_add.push(SUP2);
        break;
      case "exponentiation":
        to_add.push("^(");
        break;
      case "log":
        to_add.push("log(");
        break;
      case "ln":
        to_add.push("ln(");
        break;
      case "hyp":
        to_add.push("hyp(");
        break;
      case "sin":
        to_add.push("sin(");
        break;
      case "cos":
        to_add.push("cos(");
        break;
      case "tan":
        to_add.push("tan(");
        break;
      case "brac_l":
        to_add.push("(");
        break;
      case "brac_r":
        to_add.push(")");
        break;
      case "multiply":
        to_add.push(PRODUCT);
        break;
      case "divide":
        to_add.push(DIVISION);
        break;
      case "addition":
        to_add.push("+");
        break;
      case "subtraction":
        to_add.push("-");
        break;
      case "decimal_pt":
        to_add.push(".");
        break;
      case "exponent10":
        to_add.push("e");
        break;
      case "answer":
        to_add.push("Ans");
        break;
      case "mplus":
        break;
      case "deg":
        break;
      case "neg":
        break;
      case "frac":
        break;
    }
    this.currentEquation.push(to_add);
    this.displayEquation();
  }

  numberOperation(id) {
    console.log(`num op ${id}`);
    const numberWords = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    let to_add;
    if (!id in numberWords) throw TypeError(`Invalid number ${id}`);
    switch (id) {
      case "zero":
        to_add = 0;
        break;
      default:
        to_add = numberWords.indexOf(id);
        break;
    }
    this.currentEquation.push(to_add.toString());
    this.displayEquation();
  }

  equationOperation(id) {
    console.log(`eq op ${id}`);
  }

  voidFunc() {
    return;
  }
}

const calcVoid = (n = 1) =>
  Array(n).fill(new CalcButton(null, null, null, { empty: true }));

// SPECIAL SYMBOLS
SQRT = "√";
CBRT = "∛";
BLKTRI_R = "🞂";
PI = "π";
SUP1 = "¹";
SUP2 = "²";
SUP3 = "³";
SUPM = "⁻";
SUPX = "<sup>x</sup>";
SUB0 = "₀";
SUB1 = "₁";
FRAC = "\u2044";
ANGLE = "∠";
ARROWL = "←";
ESPACE = "\u2800";
FSEMICOL = "\uff1b";
PRODUCT = "\u2a2f";
DIVISION = "\u00f7";
DASH = "\u2013";

$(".calculator-container").ready(init);

function init() {
  calculator = new Calculator();

  const calculatorButtons = [
    [
      new BasicButton("shift"),
      new BasicButton("alpha"),
      new CalcDpad(),
      new BasicButton("mode"),
      new BasicButton("power"),
    ],
    [
      new MenuButton("Prog", { shiftText: "EXIT", enabled: 0 }),
      new MenuButton("FMLA"),
      ...calcVoid(2),
      new SciOperatorButton("reciprocal", `x${SUPM}${SUP1}`, `${SUPM}${SUP1}`, {
        shiftText: "x!",
        shiftOperation: "!",
      }),
      new SciOperatorButton("cube", `x${SUP3}`, SUP3, {
        shiftText: CBRT,
        shiftOperation: `${CBRT}(`,
      }),
    ],
    [
      new CalcButton("frac", `ab${FRAC}c`, "mathOperation", {
        shiftText: "d/c",
        style: 0,
        enabled: 0,
      }),
      new SciOperatorButton("sqrt", SQRT, `${SQRT}(`),
      new SciOperatorButton("square", `x${SUP2}`, SUP2),
      new SciOperatorButton("exponentiation", "^", "^(", {
        shiftText: `${SUPX}${SQRT}`,
        shiftOperation: `${SUPX}${SQRT}(`,
      }),
      new SciOperatorButton("log", "log", "log(", {
        shiftText: `10${SUPX}`,
        shiftOperation: `${SUB1}${SUB0}^(`,
      }),
      new SciOperatorButton("ln", "ln", "ln(", {
        shiftText: `e${SUPX}`,
        shiftOperation: "e^(",
      }),
    ],
    [
      new SciOperatorButton("ned", "(-)", DASH, {
        alphaText: "A",
      }),
      new SciOperatorButton("deg", "⚬❟❠", "°", { alphaText: "B" }),
      new BasicButton("hyp"),
      new SciOperatorButton("sin", "sin", "sin(", {
        shiftText: `sin${SUPM}${SUP1}`,
        alphaText: "D",
      }),
      new SciOperatorButton("cos", "cos", "cos(", {
        shiftText: `cos${SUPM}${SUP1}`,
      }),
      new SciOperatorButton("tan", "tan", "tan(", {
        shiftText: `tan${SUPM}${SUP1}`,
      }),
    ],
    [
      new CalcButton("recall", "RCL", "voidFunc", {
        shiftText: "STO",
        style: 0,
      }),
      new CalcButton("eng", "ENG", "voidFunc", {
        shiftText: ARROWL,
        style: 0,
      }),
      new SciOperatorButton("left-brac", "(", "(", {
        shiftText: "%",
        shiftOperation: "%",
      }),
      new SciOperatorButton("right-brac", ")", ")", {
        shiftText: "Abs",
        shiftOperation: "Abs(",
        alphaText: "X",
      }),
      new CalcButton("comma", "❟", "voidFunc", {
        shiftText: FSEMICOL,
        alphaText: "Y",
        style: 0,
      }),
      new CalcButton("mplus", "M+", "mathOperation", {
        shiftText: "M-",
        alphaText: "M",
        style: 0,
      }),
    ],
    [
      new NumberButton("seven", 7, { shiftText: "CONST" }),
      new NumberButton("eight", 8),
      new NumberButton("nine", 9, { shiftText: "CLR" }),
      new CalcButton("delete", "DEL", "deleteChar", {
        shiftText: "INS",
        style: 5,
      }),
      new CalcButton("clear", "AC", "clear", {
        shiftText: "OFF",
        style: 5,
      }),
    ],
    [
      new NumberButton("four", 4),
      new NumberButton("five", 5),
      new NumberButton("six", 6),
      new OperatorButton("multiply", PRODUCT, { shiftText: "nPr" }),
      new OperatorButton("divide", DIVISION, { shiftText: "nCr" }),
    ],
    [
      new NumberButton("one", 1),
      new NumberButton("two", 2),
      new NumberButton("three", 3),
      new OperatorButton("addition", "+", { shiftText: "Pol" }),
      new OperatorButton("subtraction", "-", { shiftText: "Rec" }),
    ],
    [
      new NumberButton("zero", 0, { shiftText: "Rnd" }),
      new OperatorButton("decimal-pt", ".", { shiftText: "Ran#" }),
      new SciOperatorButton("exponent10", "EXP", "E", { shiftText: PI }),
      new SciOperatorButton("answer", "Ans", "Ans", {
        shiftText: `DRG${BLKTRI_R}`,
      }),
      new CalcButton("execution", "EXE", "execute"),
    ],
  ];
  generateButtons(calculatorButtons);

  calculator
    ._tempClearDisplay(null, 0)
    .then(calculator.displayAnswer({ ans: "0" }));
}

function generateButtons(calculatorButtons) {
  calculatorContainer = $(".calc-container");
  for (const [row_index, buttonsRow] of calculatorButtons.entries()) {
    var rowElement = $(
      `<div class="calc-buttons-row"${
        row_index === 0 ? ' id="first-buttons-row"' : ""
      }></div>`
    );
    for (const button of buttonsRow) {
      if (button.style === "dpad") {
        rowElement.append(button.element);
        continue;
      }
      if (button.empty) {
        spacingDiv = $('<div class="spacing"></div>');
        rowElement.append(spacingDiv);
        continue;
      }
      var buttonSetElement = $('<div class="calc-button-set"></div>');
      var descText = $('<div class="calc-desctxt"></div>');
      if (button.shiftText)
        descText.append($(`<div class="shift-text">${button.shiftText}</div>`));
      if (button.alphaText)
        descText.append($(`<div class="alpha-text">${button.alphaText}</div>`));
      var buttonElement = $(
        `<div class="calc-button calc-button-style${button.style?.toString()}" data-operation="${
          button.operation
        }">${button.text}</div>`
      );
      buttonSetElement.append(descText);
      buttonSetElement.append(buttonElement);
      rowElement.append(buttonSetElement);

      console.log(buttonElement.data("operation"));
      buttonElement.click(
        { operation: buttonElement.data("operation") },
        function ({ data }) {
          calculator[data.operation](button.id);
        }
      );
    }
    console.log(rowElement);
    console.log(calculatorContainer);
    calculatorContainer.append(rowElement);
  }

  $(".calc-buttons-row[0]").attr("id", "first-buttons-row");
  console.log($(".calc-buttons-row[0]"));
}
