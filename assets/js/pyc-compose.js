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
  if (checklogin == null || (await checklogin()) === false) {
    window.location.href = "./login";
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
      });
    }, 750);
  });

  $("send-mail-btn").click(function () {});
}

window.onload = init;
