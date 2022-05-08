function init() {
  console.log("initializing");
  $("#login-btn").click(function () {
    username = $("#uname-input").val();
    password = $("#psw-input").val();
    $("#login-btn").html(
      '<div class="loader-container"><div class="loader"></div></div>'
    );
    pyc = new PycClient(username, password);
    pyc
      .login()
      .then(() => {
        window.location.href = "./home";
      })
      .catch((e) => console.log);
  });
}

window.onload = init;
