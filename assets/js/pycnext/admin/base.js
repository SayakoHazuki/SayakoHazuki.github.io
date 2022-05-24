let page = location.href
  .split("admin/")[1]
  .split("/")[0]
  .replace(/(\?[^\?]*$)|(#[^#]*$)/, "");
$(`[data-sidebar-${page}]`).each(function (e) {
  $(this).addClass("active-sec-sidebar-item");
});
