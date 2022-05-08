let pyc;
window.onload = init();

async function init() {
  $("#sidebar-message").addClass("active-page");
  if (checklogin == null || (await checklogin()) === false) {
    window.location.href = "./login";
  }
  loadMessage();
}

function loadMessage() {
  const urlParams = new URLSearchParams(window.location.search);
  const messageId = urlParams.get("id");
  pyc.getMessage(messageId).then((message) => {
    $(".loader").each(function () {
      $(this).css("display", "none");
    });
    $("#mail-full-content").append($(message.html_content));
    $("#mail-header-title").text(message.subject);
    $("#mail-header-author").text(message.author);
    $("#mail-timestamp").text(message.date);
  });
}
