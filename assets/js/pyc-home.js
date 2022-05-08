let pyc;

const loadMessages = () =>
  new Promise((resolve, reject) => {
    pyc.getMessages(0).then((messages) => {
      var inboxElement = $("#mailbox-container");
      for (const message of JSON.parse(messages)) {
        var mailElement = $(
          `<a href="/projects/pyc/message?id=${message.id.main}" class='mail-container'></a>`
        );
        mailElement.append(`<div class="mail-title">${message.title}</div>`);
        mailElement.append(
          `<div class="mail-author">${message.author.name}</div>`
        );
        mailElement.append(`<div class="mail-timestamp">${message.date}</div>`);
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
        mailElement.append(actionButtons);
        inboxElement.append(mailElement);
      }
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
  $("#sidebar-message").addClass("active-page");
  if (checklogin == null || (await checklogin()) === false) {
    window.location.href = "./login";
  }
  loadMessages().then(function () {
    initMessageActionsBtns();
  });
}

window.onload = init();
