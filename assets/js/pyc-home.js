let pyc;

const loadMessages = (pageNum) =>
  new Promise((resolve, reject) => {
    let urlParams = new URLSearchParams(window.location.search);
    let search_by = urlParams.get("search-by");
    let search_val = urlParams.get("search-val");
    let sort = urlParams.get("sort");
    options = {};
    if (search_by) {
      options["search-by"] = search_by;
    }
    if (search_val) {
      options["search-val"] = search_val;
    }
    if (sort) {
      options["sort"] = sort;
    }
    pyc.getMessages(pageNum, 0, options).then((messages) => {
      var inboxElement = $("#mailbox-container");
      for (const message of JSON.parse(messages)) {
        var mailElement = $(
          `<a href="/projects/pyc/message/view?id=${message.id.main}" class='mail-container'></a>`
        );
        mailElement.append(`<div class="mail-title">${message.title}</div>`);
        mailElement.append(
          `<div class="mail-author">${message.author.name}</div>`
        );
        let [_date, _year] = message.date.split(",");
        var timestampElement = $(
          `<div class="mail-timestamp"><span class="mail-date">${_date}</span><span class="mail-year">, ${_year}</span></div>`
        );
        var actionButtons = $('<div class="mail-actions"></div>');
        actionButtons.append(
          `<button data-message-id="${message.id.main}" data-action="delete" class="message-btn message-delete-btn"><i class="fa-solid fa-trash"></i></button>`
        );
        actionButtons.append(
          `<button data-message-id="${
            message.id.main
          }" data-action="favourite" class="message-btn message-favourite-btn ${
            message.isImportant ? `fav-enabled` : `fav-disabled`
          }"><i class="fa-solid fa-star"></i></button>`
        );
        timestampElement.append(actionButtons);
        mailElement.append(timestampElement);
        inboxElement.append(mailElement);
      }
      endOfInboxElement = $(
        `<div id="end-of-inbox" data-next-page="${Number(pageNum) + 1}"></div>`
      );
      inboxElement.append(endOfInboxElement);
      resolve();
    });
  });

function initMessageActionsBtns() {
  console.log("initializing message buttons");
  var actionButtons = $(".message-btn");
  actionButtons.each(function () {
    $(this).click(function (e) {
      e.preventDefault();
      var action = $(e.target).closest(".message-btn").attr("data-action");
      var messageId = $(e.target)
        .closest(".message-btn")
        .attr("data-message-id");
      console.log(`Action ${action} called for message #${messageId}`);
    });
  });
}

async function init() {
  if (checklogin == null || (await checklogin()) === false) {
    window.location.href = "./login";
  }
  loadMessages(0).then(function () {
    $(".loader-container").each(function () {
      $(this).remove();
    });
    initMessageActionsBtns();
  });

  let urlParams = new URLSearchParams(window.location.search);
  let search_by = urlParams.get("search-by");
  let search_val = urlParams.get("search-val");
  
  if(search_by) {
    $("#search-sel-menu").val(search_by).change()
  }
  if(search_val) {
    $("#search-input").val(search_val).change()
  }
}

window.onload = init;

$(window).on("resize scroll", function () {
  if ($("#end-of-inbox").length) {
    if ($("#end-of-inbox").isInViewport()) {
      let nextPageNum = Number($("#end-of-inbox").attr("data-next-page") ?? "");
      $("#end-of-inbox").remove();
      if (!$(".loader-container").length) {
        console.log($("#end-of-inbox").attr("data-next-page"));
        if (isNaN(nextPageNum)) return;
        $("#mailbox-container").append(
          '<div class="loader-container" data-padding="true"><div class="loader"></div></div>'
        );
        console.log(nextPageNum);
        loadMessages(nextPageNum).then(function () {
          $(".loader-container").each(function () {
            $(this).remove();
          });
          initMessageActionsBtns();
        });
      }
    }
  }
});
