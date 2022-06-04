$(".menu-toggler").click(function (e) {
  e.preventDefault();
  $("#sec-sidebar").attr("active", "");

  setTimeout(() => {
    $("body").click(function (e) {
      if ($(e.target).attr("id") !== "sec-sidebar") {
        $("#sec-sidebar").removeAttr("active");
        $("body").unbind("click");
      }
    });
  }, 500);
});
