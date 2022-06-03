$("[data-sidebar-collapse]").click(function (e) {
  e.preventDefault();
  $("#sec-sidebar").removeAttr("active");
  $("#site-main-ico").attr("menu-toggler", "");
});

if (window.matchMedia("(max-width: 748px)").matches) {
  $("#site-main-ico").attr("menu-toggler", "");
  // add active attr to sec-sidebar when click on menu-toggler
  $("#site-main-ico").click(function (e) {
    e.preventDefault();
    $("#sec-sidebar").attr("active", "");
    $("#site-main-ico").removeAttr("menu-toggler");
  });
}
