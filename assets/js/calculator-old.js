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

$(".calc-container").ready(init);

let shifted;
let alphaed;

const VARS = {
  A: 0,
  B: 0,
  C: 0,
  D: 0,
  M: 0,
};

let formula_mode = false;
let formula_isRunning = false;
let formula_num = "";
let formula_promise;

function init() {
  math.import({ ln: math.log });
  let equation = "";
  let temp_equation = "";
  let temp_ans = 0;
  shifted = false;
  alphaed = false;
  let store_mode = false;
  dispMain("0");
  dispTop(" ");

  $("#cb-shift").click(function () {
    shifted = !shifted;
    alphaed = false;
    updateMode();
  });
  $("#cb-alpha").click(function () {
    shifted = false;
    alphaed = !alphaed;
    updateMode();
  });

  const normal_chars = {
    zero: $("#cb-0"),
    one: $("#cb-1"),
    two: $("#cb-2"),
    three: $("#cb-3"),
    four: $("#cb-4"),
    five: $("#cb-5"),
    six: $("#cb-6"),
    seven: $("#cb-7"),
    eight: $("#cb-8"),
    nine: $("#cb-9"),
    dp: $("#cb-dp"),
    paren1: $("#cb-paren1"),
    paren2: $("#cb-paren2"),
  };

  const operators = {
    plus: $("#cb-plus"),
    minus: $("#cb-minus"),
    multiply: $("#cb-multiply"),
    divide: $("#cb-divide"),
  };

  for (const i in normal_chars) {
    normal_chars[i].click(function () {
      if (formula_mode === 1) {
        return formula_input_num(this);
      }
      if (shifted && ["(", ")", "."].includes($(this).text())) {
        return shifted_run(this);
      }
      equation =
        $(this).text() === "0" && (equation === "" || equation === "0")
          ? "0"
          : equation === "0" && $(this).text() !== "."
          ? $(this).text()
          : equation === "" && $(this).text() === "."
          ? "0."
          : `${equation}${$(this).text()}`;
      dispMain(equation);
    });
  }

  for (const operator of [operators.multiply, operators.divide]) {
    operator.click(function () {
      if (formula_mode === 1) {
        return formula_input_num(this);
      }
      equation =
        equation === "" ? (temp_ans === 0 ? equation : "Ans") : equation;
      equation =
        equation === "" ? `0${$(this).text()}` : equation + $(this).text();
      dispMain(equation);
    });
  }
  for (const operator of [operators.plus]) {
    operator.click(function () {
      if (formula_mode === 1) {
        return formula_input_num(this);
      }
      equation =
        equation === "" ? (temp_ans === 0 ? equation : "Ans") : equation;
      equation =
        equation === ""
          ? `0${$(this).text()}`
          : equation.endsWith($(this).text())
          ? equation
          : equation + $(this).text();
      dispMain(equation);
    });
  }
  for (const operator of [operators.minus]) {
    operator.click(function () {
      if (formula_mode === 1) {
        return formula_input_num(this);
      }
      equation =
        equation === ""
          ? `${$(this).text()}`
          : equation.endsWith($(this).text())
          ? equation
          : equation + $(this).text();
      dispMain(equation);
    });
  }

  for (const button of ["#cb-ac", "#cb-on"]) {
    $(button).click(function () {
      if (formula_mode === 1) {
        return formula_input_num(this);
      }
      if (formula_mode === 2) {
        return formula_input_num(this);
      }
      if (shifted && $(this).text() === "AC") return shifted_run(this);
      equation = "";
      dispMain("0");
      dispTop(" ");
    });
  }

  $("#cb-ab_c").click(function () {
    const main_content = $("#display-main").text();
    const top_content = $("#display-top").text();
    if (
      !(
        [main_content, top_content].includes(" ") ||
        [main_content, top_content].includes("")
      )
    ) {
      if (main_content.includes("\u231f")) {
        const [s, n, d] = main_content.split("\u231f ");
        console.log([s, n, d]);
        if (!d) {
          fmlaDispMain(`${s} / ${n}`);
        } else {
          fmlaDispMain(`${s * n + n}/${d}`);
        }
        return;
      }
      dispMain(main_content, shifted ? "d/c" : "a b/c");
      shifted = false;
      alphaed = false;
      return;
    } else {
      equation = equation === "0" ? "0\u231f " : equation + "\u231f ";
      dispMain(equation);
    }
  });

  $("#cb-dash").click(function () {
    if (formula_mode === 1) {
      return formula_input_num(this);
    }
    if (alphaed) {
      equation =
        equation === "0"
          ? alphaed_letter(this)
          : equation + alphaed_letter(this);
      return dispMain(equation);
    }
  });
  $("#cb-punc").click(function () {
    if (formula_mode === 1) {
      return formula_input_num(this);
    }
    if (alphaed) {
      equation =
        equation === "0"
          ? alphaed_letter(this)
          : equation + alphaed_letter(this);
      return dispMain(equation);
    }
  });
  $("#cb-hyp").click(function () {
    if (formula_mode === 1) {
      return formula_input_num(this);
    }
    if (alphaed) {
      equation =
        equation === "0"
          ? alphaed_letter(this)
          : equation + alphaed_letter(this);
      return dispMain(equation);
    }
  });
  $("#cb-Mplus").click(function () {
    if (formula_mode === 1) {
      return formula_input_num(this);
    }
    if (alphaed) {
      equation =
        equation === "0"
          ? alphaed_letter(this)
          : equation + alphaed_letter(this);
      return dispMain(equation);
    }
  });

  const multichar_ops = [
    "⁻¹",
    "³√(",
    "√(",
    "\u231f ",
    "^(",
    "log(",
    "ln(",
    "sin⁻¹(",
    "cos⁻¹(",
    "tan⁻¹(",
    "sin(",
    "cos(",
    "tan(",
    "Abs(",
    "Ran#",
    "Ans",
  ];

  $("#cb-del").click(function () {
    if (formula_mode === 1) {
      return formula_input_num(this);
    }
    equation =
      equation === "" || equation === " "
        ? temp_ans ?? false
          ? temp_ans
          : equation
        : equation;
    let last_op_is_multichar = false;
    for (const operator of multichar_ops) {
      if ((equation || " ").endsWith(operator)) {
        equation = equation.slice(0, 0 - operator.length);
        last_op_is_multichar = true;
        break;
      }
    }
    if (!last_op_is_multichar) {
      equation = equation.length >= 2 ? equation.slice(0, -1) : "0";
    }
    dispMain(equation.length ? equation : "0");
  });

  $("#cb-exp").click(function () {
    if (formula_mode === 1) {
      return formula_input_num(this);
    }
    if (shifted) return shifted_run(this);
    equation = equation === "" ? (temp_ans === 0 ? equation : "Ans") : equation;
    equation += "e";
    dispMain(equation);
  });

  $("#cb-ans").click(function () {
    if (formula_mode === 1) {
      return formula_input_num(this);
    }
    equation += "Ans";
    dispMain(equation);
  });

  $("#cb-exe").click(function () {
    if (formula_mode === 1) {
      formula_input_num(this);
      equation = "";
      return;
    }
    if (formula_mode === 2) {
      formula_var_resolve(execute(equation, temp_ans, false));
      equation = "";
      return;
    }
    equation =
      equation === "" || equation == null ? temp_equation || "0" : equation;
    temp_ans = execute(equation, temp_ans).toString();
    temp_equation = equation;
    equation = "";
  });

  $("#cb-fmla").click(function () {
    switch (formula_mode) {
      case 1:
        formula_num = "";
        return formula_input_num(this);
      case false:
        dispTop("Formula No. ?");
        formula_mode = 1;
        equation = "";
        $("#display-main").text(".");
        break;
    }
  });

  function formula_input_num(element) {
    e = $(element);
    if (formula_promise) {
    } else {
      switch (e.attr("id")) {
        case "cb-0":
        case "cb-1":
        case "cb-2":
        case "cb-3":
        case "cb-4":
        case "cb-5":
        case "cb-6":
        case "cb-7":
        case "cb-8":
        case "cb-9":
          formula_num += e.text().toString();
          dispMain(formula_num);
          break;
        case "cb-del":
          formula_num = formula_num.toString().slice(0, -1);
          dispMain(formula_num);
          break;
        case "cb-ac":
        case "cb-on":
          formula_num = "";
          formula_mode = false;
          formula_isRunning = false;
          dispTop("");
          equation = "";
          dispMain("0");
          break;
        case "cb-exe":
          formula_run(formula_num);
      }
    }
  }

  for (const button of ["#cb-x-1", "#cb-x3", "#cb-x2"]) {
    $(button).click(function () {
      if (formula_mode === 1) {
        return formula_input_num(this);
      }
      if (shifted && ($(this).text() === "x-1" || $(this).text() === "x3")) {
        return shifted_run(this);
      }

      equation =
        equation === "" ? (temp_ans === 0 ? equation : "Ans") : equation;
      equation += $(this)
        .text()
        .replace("x", "")
        .replace("-", "⁻")
        .replace("1", "¹")
        .replace("2", "²")
        .replace("3", "³");
      dispMain(equation);
    });
  }

  for (const button of [
    "#cb-sqrt",
    "#cb-sup",
    "#cb-log",
    "#cb-ln",
    "#cb-sin",
    "#cb-cos",
    "#cb-tan",
  ]) {
    $(button).click(function () {
      if (formula_mode === 1) {
        return formula_input_num(this);
      }
      if (shifted && ["sin", "cos", "tan"].includes($(this).text())) {
        return shifted_run(this);
      }
      if (alphaed && $(this).text() === "sin") {
        equation =
          equation === "0"
            ? alphaed_letter(this)
            : equation + alphaed_letter(this);
        return dispMain(equation);
      }
      if (["^"].includes($(this).text())) {
        equation =
          equation === "" ? (temp_ans === 0 ? equation : "Ans") : equation;
      }
      equation += `${$(this).text()}(`;
      dispMain(equation);
    });
  }

  $(document).on("keydown", function (e) {
    const sp_keys = {
      8: "back",
      13: "enter",
      16: "shift",
      18: "alpha",
      27: "esc",
      96: 0,
      97: 1,
      98: 2,
      99: 3,
      100: 4,
      101: 5,
      102: 6,
      103: 7,
      104: 8,
      105: 9,
      106: "*",
      107: "+",
      109: "-",
      110: ".",
      111: "/",
      112: "shift",
      113: "alpha",
      190: ".",
    };
    const key =
      e.which in sp_keys ? sp_keys[e.which] : String.fromCharCode(e.which);
    const supportedList = {
      0: normal_chars.zero,
      1: normal_chars.one,
      2: normal_chars.two,
      3: normal_chars.three,
      4: normal_chars.four,
      5: normal_chars.five,
      6: normal_chars.six,
      7: normal_chars.seven,
      8: normal_chars.eight,
      9: normal_chars.nine,
      "+": operators.plus,
      "-": operators.minus,
      "*": operators.multiply,
      "/": operators.divide,
      ".": normal_chars.dp,
      back: $("#cb-del"),
      enter: $("#cb-exe"),
      shift: $("#cb-shift"),
      alpha: $("#cb-alpha"),
      esc: $("#cb-ac"),
    };
    if (key in supportedList) {
      e.preventDefault();
      supportedList[key].click();
    }
  });

  function shifted_run(element) {
    const btn = $(element).text() || "";
    const shiftKeys = {
      "x-1": "!",
      x3: "cbrt",
      log: "10x",
      ln: "ex",
      sin: "arcsin",
      cos: "arccos",
      tan: "arctan",
      exp: "pi",
      "(": "%",
      ")": "abs",
      ".": "ran#",
    };
    if ((btn.toString() || "").toLowerCase() in shiftKeys) {
      function fe() {
        equation =
          equation === "" ? (temp_ans === 0 ? equation : "Ans") : equation;
      }
      switch (shiftKeys[btn.toString().toLowerCase()]) {
        case "!":
          fe();
          equation += "!";
          break;
        case "cbrt":
          equation += "³√(";
          break;
        case "arcsin":
          equation += "sin⁻¹(";
          break;
        case "arccos":
          equation += "cos⁻¹(";
          break;
        case "arctan":
          equation += "tan⁻¹(";
          break;
        case "pi":
          equation += "π";
          break;
        case "abs":
          equation += "Abs(";
          break;
        case "%":
          fe();
          equation =
            equation === "0" || equation === "" ? "0%" : equation + "%";
          break;
        case "ran#":
          equation += "Ran#";
          break;
      }
      dispMain(equation);
    }
  }

  function alphaed_letter(element) {
    const btn_id = $(element).attr("id");
    const alphabets = {
      "cb-dash": "A",
      "cb-punc": "B",
      "cb-hyp": "C",
      "cb-sin": "D",
      "cb-Mplus": "M",
    };
    return btn_id in alphabets ? alphabets[btn_id] : "";
  }
}

function updateMode() {
  if (shifted && $("#shifted").hasClass("mode-disabled")) {
    $("#shifted").addClass("mode-enabled");
    $("#shifted").removeClass("mode-disabled");
  }
  if (shifted && $("#alphaed").hasClass("mode-enabled")) {
    $("#alphaed").addClass("mode-disabled");
    $("#alphaed").removeClass("mode-enabled");
  }
  if (alphaed && $("#alphaed").hasClass("mode-disabled")) {
    $("#alphaed").addClass("mode-enabled");
    $("#alphaed").removeClass("mode-disabled");
  }
  if (alphaed && $("#shifted").hasClass("mode-enabled")) {
    $("#shifted").addClass("mode-disabled");
    $("#shifted").removeClass("mode-enabled");
  }
  if (!(shifted | alphaed)) {
    if ($("#alphaed").hasClass("mode-enabled")) {
      $("#alphaed").addClass("mode-disabled");
      $("#alphaed").removeClass("mode-enabled");
    }
    if ($("#shifted").hasClass("mode-enabled")) {
      $("#shifted").addClass("mode-disabled");
      $("#shifted").removeClass("mode-enabled");
    }
  }
}

const dispMain = (str, fraction_mode = false) => {
  str = str.toString();
  $("#display-main").text(" ");
  setTimeout(() => {
    if (fraction_mode === "d/c") {
      const { n, d } = math.fraction(math.evaluate(str));
      if (d === 1) {
        $("#display-main").text(dp(str).slice(-13));
      } else {
        console.log(`${n}${d}`, `${n}${d}`.length);
        if (`${n}${d}`.length >= 12) {
          return $("#display-main").text(str);
        }
        $("#display-main").text(`${n}\u231f ${d}`.slice(-13));
      }
    } else if (fraction_mode === "a b/c") {
      const { n, d } = math.fraction(math.evaluate(str));
      if (d === 1) {
        $("#display-main").text(dp(str).slice(-13));
      } else {
        console.log(
          `${Math.floor(n / d)}${n % d}${d}`,
          `${Math.floor(n / d)}${n % d}${d}`.length
        );
        if (`${Math.floor(n / d)}${n % d}${d}`.length >= 11) {
          return $("#display-main").text(str);
        }
        $("#display-main").text(
          `${Math.floor(n / d) === 0 ? "" : `${Math.floor(n / d)}\u231f `}${
            n % d
          }\u231f ${d}`.slice(-13)
        );
      }
    } else {
      $("#display-main").text(dp(str).slice(-13));
    }
    shifted = false;
    alphaed = false;
    updateMode();
  }, 20);
};
const dispTop = (str) => {
  $("#display-top").text(" ");
  setTimeout(() => {
    $("#display-top").text(str);
  }, 20);
};
function execute(equation, temp_ans, display = true) {
  equation = equation.toString();
  math_equation = autoCloParen(
    ranReplace(equation)
      .replace(/\u00d7/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "pi")
      .replace(/Ans/g, `(${temp_ans || 0})`)
      .replace(/Abs\(/g, "abs(")
      .replace(/(sin|cos|tan)⁻¹\(/g, "a$1(")
      .replace(/log/g, "log10")
      .replace(/\u231f\s?/g, "/")
      .replace(/³√\(/g, "cbrt(")
      .replace(/√\(/g, "sqrt(")
      .replace(/⁻¹/g, "^(-1)")
      .replace(/²/g, "^(2)")
      .replace(/³/g, "^(3)")
      .replace(/A/g, `(${VARS.A})`)
      .replace(/B/g, `(${VARS.B})`)
      .replace(/C/g, `(${VARS.C})`)
      .replace(/D/g, `(${VARS.D})`)
      .replace(/M/g, `(${VARS.M})`)
  );
  console.log(`Equation:\n${math_equation}`);
  try {
    temp_ans = math.format(math.evaluate(math_equation), {
      precision: 10,
      lowerExp: -10,
      upperExp: 10,
    });
    console.log(temp_ans);
    if (!display) return temp_ans;
    if (temp_ans === Infinity || temp_ans === "Infinity") {
      console.error("(Math Error) Answer is infinity.");
      err("Math Error");
      return "0";
    }
    if (Number(temp_ans) === null || isNaN(Number(temp_ans))) {
      console.error("(Math Error) Answer is NaN");
      err("Math Error");
      return "0";
    }
    temp_ans = temp_ans.toString();
    if (temp_ans.replace(/\./g, "").length >= 10 || temp_ans.includes("e")) {
      const temp_ans_exponential = math.format(Number(temp_ans), {
        notation: "auto",
        lowerExp: -7,
        upperExp: 10,
      });
      let temp_ans_html = dp(temp_ans_exponential).replace(
        /e\+?(\-)?([0-9]+)(\.?)/g,
        '$3<span class="sci-no">10<sup>$1$2</sup></span>'
      );
      temp_ans_html =
        temp_ans_html.toString().length <= 13 &&
        temp_ans_html.toString().includes(".")
          ? temp_ans_html
              .toString()
              .replace(RegExp.$3, RegExp.$3.toString().slice(0, 9))
          : temp_ans_html;
      if (Number(RegExp.$2) >= 100) {
        console.log("(Math Error) Answer too large.");
        err("Math Error");
        return "0";
      }
      if (temp_ans_html.toString().length <= 13 && RegExp.$1 === "-") {
        dispMain(temp_ans);
        dispTop(equation);
        return temp_ans;
      }
      if (temp_ans_html.toString().includes("span")) {
        $("#display-main").html(`${dp(temp_ans_html)}`);
      } else {
        dispMain(temp_ans_html);
      }
      dispTop(equation);
      return temp_ans;
    }
    dispMain(temp_ans);
    dispTop(equation);
    return temp_ans;
  } catch (e) {
    err("Syntax Error");
    console.error(e);
  }
  return "0";
}

function dp(str) {
  return [".", "+", "-", "\u00d7", "÷"].some(function (v) {
    return str.toString().indexOf(v) >= 0;
  })
    ? str
    : `${str}.`;
}

function autoCloParen(str) {
  const open_paren_len = (str.match(/\(/g) || []).length;
  const close_paren_len = (str.match(/\)/g) || []).length;
  if (open_paren_len > close_paren_len) {
    str = `${str}${")".repeat(open_paren_len - close_paren_len)}`;
  }
  return str;
}

function err(e) {
  $("#display-main").text(" ");
  dispTop(e);
}

const fmla_list = {
  "01": { vars: ["A", "B", "M"], run: quad_equation },
};

function formula_run(fmla_num) {
  if (!formula_isRunning) {
    if (fmla_num in fmla_list) {
      formula_mode = 2;
      formula_isRunning = true;
      fmla_list[fmla_num].run();
    }
  }
}

function await_var(variable) {
  dispTop(`${variable} = ?`);
  dispMain(VARS[variable] ?? 0);
  return new Promise((resolve) => {
    formula_var_resolve = resolve;
  });
}

function await_exe_press() {
  return new Promise((resolve) => {
    formula_var_resolve = resolve;
  });
}

/* Math functions */
async function quad_equation() {
  let a = await await_var("A");
  if (a == null || a === "undefined") a = VARS.A ?? VARS.A ?? 0;
  let b = await await_var("B");
  if (b == null || b === "undefined") b = VARS.B = VARS.B ?? 0;
  let c = await await_var("M");
  if (c == null || c === "undefined") c = VARS.M = VARS.M ?? 0;
  formula_promise = false;

  let result1, result2;

  let discriminant = b * b - 4 * a * c;

  if (discriminant > 0) {
    const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    result1 = root1;
    result2 = root2;
  } else if (discriminant == 0) {
    const root1 = -b / (2 * a);
    result1 = root1;
    result2 = root1;
  } else {
    const realPart = (-b / (2 * a)).toFixed(2);
    const imagPart = (Math.sqrt(-discriminant) / (2 * a)).toFixed(2);
    result1 = `${realPart} + ${imagPart}i`;
    result2 = `${realPart} - ${imagPart}i`;
  }

  VARS.A = result1;
  VARS.B = result2;
  for (const result of [VARS.A, VARS.B]) {
    if (
      result == null ||
      result === Infinity ||
      result === -Infinity ||
      isNaN(result) ||
      result === "Infinity" ||
      result === "-Infinity"
    ) {
      VARS.A = 0;
      VARS.B = 0;
      formula_isRunning = false;
      formula_mode = false;
      formula_num = "";
      equation = "";
      return err("Math Error");
    }
  }

  console.log(
    `FMLA 01\nQuad Equation\nA=${a}; B=${b}; C=${c}\nResult A= ${VARS.A}\nResult B= ${VARS.B}`
  );

  dispTop("01: QuadEquation, A=");
  fmlaDispMain(VARS.A);
  await await_exe_press();

  dispTop("01: QuadEquation, B=");
  fmlaDispMain(VARS.B);
  await await_exe_press();

  formula_isRunning = false;
  formula_mode = false;
  formula_num = "";
  equation = "";
  fmlaDispMain("0");
  dispTop("");
}

function fmlaDispMain(temp_num) {
  try {
    temp_display_str = math.format(math.evaluate(temp_num), {
      precision: 10,
      lowerExp: -10,
      upperExp: 10,
    });
    if (
      temp_display_str.toString().replace(/\./g, "").length >= 10 ||
      temp_display_str.toString().includes("e")
    ) {
      const temp_display_formatted = math.format(Number(temp_display_str), {
        notation: "auto",
        lowerExp: -7,
        upperExp: 10,
      });
      let temp_display_html = dp(temp_display_formatted).replace(
        /e\+?(\-)?([0-9]+)(\.?)/g,
        '$3<span class="sci-no">10<sup>$1$2</sup></span>'
      );
      temp_display_html =
        temp_display_html.toString().length <= 13 &&
        temp_display_html.toString().includes(".")
          ? temp_display_html
              .toString()
              .replace(RegExp.$3, RegExp.$3.toString().slice(0, 9))
          : temp_display_html;
      if (Number(RegExp.$2) >= 100) {
        console.log("(Math Error) Answer too large.");
        err("Math Error");
        return "0";
      }
      if (temp_display_html.toString().length <= 13 && RegExp.$1 === "-") {
        dispMain(temp_display_str);
        return temp_display_str;
      }
      if (temp_display_html.toString().includes("span")) {
        $("#display-main").html(`${dp(temp_display_html)}`);
      } else {
        dispMain(temp_display_html);
      }
      return temp_display_str;
    }
    dispMain(temp_display_str);
    return temp_display_str;
  } catch (e) {
    err("Syntax Error");
  }
}

function ranReplace(string) {
  while (string.includes("Ran#")) {
    string = string.replace("Ran#", math.round(Math.random(), 3));
  }
  return string;
}
