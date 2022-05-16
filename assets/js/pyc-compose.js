console.log("Initializing mail editor");
tinymce.init({
  selector: "#mail-editor",
  plugins:
    "preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons",
  menubar: "edit insert table format view",
  toolbar:
    "undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | fullscreen  preview save print | insertfile image media template link anchor | ltr rtl",
  toolbar_sticky: true,
  toolbar_sticky_offset: 52,
  image_advtab: true,
  template_cdate_format: "[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]",
  template_mdate_format: "[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]",
  height: 600,
  elementpath: false,
  image_caption: true,
  quickbars_insert_toolbar: false,
  quickbars_selection_toolbar:
    "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
  noneditable_class: "mceNonEditable",
  toolbar_mode: "sliding",
  contextmenu: "link image table",
  content_style:
    "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
});

async function init() {
  $("#recipients-input").one("keydown", function () {
    $("#user-suggestions").html(
      '<div data-uid="null" class="user-suggestion no-suggestions">Loading suggestions...</div>'
    );
  });

  $("#recipients-input").focus(function () {
    $("#user-suggestions").addClass("inputactive");
  });
  $("#recipients-input").focusout(function () {
    $("#user-suggestions").removeClass("inputactive");
  });
  if (checklogin == null || (await checklogin()) === false) {
    window.location.href = "/projects/pycnext/login";
  }

  let userInputTimer;
  $("#recipients-input").keyup(function (e) {
    clearTimeout(userInputTimer);

    userInputTimer = setTimeout(function () {
      $("#user-suggestions").html(
        '<div data-uid="null" class="user-suggestion no-suggestions">Loading suggestions...</div>'
      );
      pyc.findUsers($("#recipients-input").val()).then((users) => {
        if (!users.length) {
          $("#user-suggestions").html(
            '<div data-uid="null" class="user-suggestion no-suggestions">No results</div>'
          );
        }
        suggestions_html = users.map(
          (u) =>
            `<div data-uid="${u.id}" class="user-suggestion">${u.name}</div>`
        );
        $("#user-suggestions").html(suggestions_html);
        $(".user-suggestion").each(function () {
          $(this).click(function () {
            if (getRecipients().includes($(this).attr("data-uid"))) return;
            let recipientRemover = $(
              '<div class="recipient-remover">&nbsp;<i class="fa-solid fa-xmark"></i>&nbsp;</div>'
            );
            let recipientBox = $(
              `<div class="recipient-box" data-uid="${$(this).attr(
                "data-uid"
              )}">${$(this).text()}&nbsp;</div>`
            );

            recipientRemover.click(function () {
              $(this).parent().remove();
            });
            recipientBox.append(recipientRemover);

            $("#mail-recipients-flex").prepend(recipientBox);
            $("#recipients-input").val("");
          });
        });
      });
    }, 750);
  });

  $("#send-mail-btn").click(function () {
    let mailRecipients = getRecipients();
    let mailSubject = $("#subject-input").val();
    let mailBody = tinymce.activeEditor.getContent();
    let mailSave = $("#save-mail-switch").prop("checked");

    $("#send-mail-btn").html(
      '<div class="loader-container"><div class="loader"></div></div>'
    );

    pyc
      .sendMessage(
        mailRecipients,
        mailSubject,
        mailBody,
        (+mailSave).toString()
      )
      .then(() => {
        alert("message sent! (ok i know this is ugly, will change soon.)");
        $(window).off("beforeunload");
        window.onbeforeunload = function () {};
        window.location.href = "/projects/pycnext/home";
      });
  });
}

getRecipients = () =>
  $(".recipient-box")
    .toArray()
    .map((element) => element.getAttribute("data-uid"));

window.onload = init;
