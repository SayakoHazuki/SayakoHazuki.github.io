function login() {
  username = $("#uname-input").val().trim();
  password = $("#psw-input").val().trim();
  empty_pattern = /^(?!\s*$).+/;
  if (!(empty_pattern.test(username) || empty_pattern.test(password))) {
    clearErrorMsgs();
    return $(
      '<div id="error-msg">The username and password must not be empty</div>'
    ).insertBefore($("#login-btn"));
  }
  $("#login-btn").html(
    '<div class="loader-container"><div class="loader"></div></div>'
  );
  pyc = new PycClient(username, password);
  pyc
    .login()
    .then(
      () => {
        window.location.href = "./home";
      },
      (reject_reason) => {
        $("#login-btn").text("Login");
        if (reject_reason === "Invalid Credentials") {
          clearErrorMsgs();
          return $(
            '<div id="error-msg">The username or password you entered is incorrect. Please try again.</div>'
          ).insertBefore($("#login-btn"));
        }
        if (reject_reason === "Server Error") {
          clearErrorMsgs();
          return $(
            '<div id="error-msg">The server responded with an invalid response. Please try again later.</div>'
          ).insertBefore($("#login-btn"));
        }
      }
    )
    .catch((e) => console.log);
}

function init() {
  console.log("initializing");

  $("#login-btn").click(login);

  $(document).on("keypress", function (e) {
    if (e.which == 13) {
      login();
    }
  });
}

function clearErrorMsgs() {
  $("#error-msg").each(function () {
    $(this).remove();
  });
}

window.onload = init;
