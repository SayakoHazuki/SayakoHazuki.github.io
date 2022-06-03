let pyc;
window.onload = init();

async function init() {
  await checklogin()
  loadMessage()
}

function getIcon(filename) {
  var re = /(?:\.([^.]+))?$/;
  var ext = re.exec(filename)[1];

  let icon = "";
  switch (ext) {
    case "pdf":
      icon = '<i class="fa-solid fa-file-pdf"></i>';
      break;
    case "doc":
    case "docx":
      icon = '<i class="fa-solid fa-file-word"></i>';
      break;
    case "xls":
    case "xlsx":
    case "xlsm":
      icon = '<i class="fa-solid fa-file-excel"></i>';
      break;
    case "ppt":
    case "pptx":
      icon = '<i class="fa-solid fa-file-powerpoint"></i>';
      break;
    case "txt":
      icon = '<i class="fa-solid fa-file-lines"></i>';
      break;
    case "tif":
    case "tiff":
    case "bmp":
    case "jpg":
    case "jpeg":
    case "gif":
    case "png":
    case "eps":
    case "ico":
    case "ps":
    case "psd":
    case "svg":
      icon = '<i class="fa-solid fa-file-image"></i>';
      break;
    case "webm":
    case "mpg":
    case "mp2":
    case "mpeg":
    case "mpe":
    case "mpv":
    case "ogg":
    case "mp4":
    case "m4p":
    case "m4v":
    case "avi":
    case "wmv":
    case "mov":
    case "qt":
    case "flv":
    case "swf":
    case "avchd":
    case "3g2":
    case "3gp":
    case "h264":
    case "mkv":
    case "rm":
    case "swf":
    case "vob":
      icon = '<i class="fa-solid fa-file-video"></i>';
      break;
    case "wproj":
    case "weba":
    case "abc":
    case "flp":
    case "ec3":
    case "mp3":
    case "cgrp":
    case "nbs":
    case "ust":
    case "mmpz":
    case "flac":
    case "pcm":
    case "wav":
    case "aiff":
    case "aac":
    case "wma":
    case "alac":
      icon = '<i class="fa-solid fa-file-audio"></i>';
      break;
    case "zip":
    case "rar":
    case "7z":
    case "gz":
      icon = '<i class="fa-solid fa-file-zipper"></i>';
      break;
    default:
      icon = '<i class="fa-solid fa-file"></i>';
      break;
  }
  return icon;
}

function loadMessage() {
  const urlParams = new URLSearchParams(window.location.search);
  const messageId = urlParams.get("id");
  pyc.getMessage(messageId).then((message) => {
    let attachments_container = $(
      '<div id="mail-attachments-container"></div>'
    );
    if (message.attachments.length > 0) {
      for (const attachment of message.attachments) {
        attachments_container.append(
          `<a class="message-attachment" href=${
            attachment.url
          } target="_blank">${getIcon(attachment.filename)}${
            attachment.filename
          }</a>`
        );
      }
      $("#mail-full-content").append(attachments_container);
    }
    $(".loader-container").each(function () {
      $(this).remove();
    });
    $("#mail-full-content").append($(message.html_content));
    $("#mail-header-title").text(message.subject);
    $("#mail-header-author").text(message.author);
    $("#mail-timestamp").text(message.date);
  });
}
