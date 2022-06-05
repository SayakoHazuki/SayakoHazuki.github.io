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

var selectMenu,
  i,
  j,
  len,
  len2,
  selectEl,
  selectedEl,
  itemsEl,
  itemEl,
  faIcon,
  optionText;
selectMenu = document.getElementsByClassName(
  "workspace-style2 select-menu-style1"
);
len = selectMenu.length;
for (i = 0; i < len; i++) {
  selectEl = selectMenu[i].getElementsByTagName("select")[0];
  len2 = selectEl.length;
  selectedEl = document.createElement("DIV");
  selectedEl.setAttribute("class", "select-selected");

  faIcon = selectEl.options[selectEl.selectedIndex].innerHTML.split(" ")[0];
  optionText = selectEl.options[selectEl.selectedIndex].innerHTML.split(" ")[1];
  selectedEl.innerHTML = faIcon;
  selectMenu[i].appendChild(selectedEl);

  itemsEl = document.createElement("DIV");
  itemsEl.setAttribute("class", "select-items select-hide");
  for (j = 0; j < len2; j++) {
    itemEl = document.createElement("DIV");
    itemEl.innerHTML = `${
      selectEl.options[j].innerHTML.split(" ")[0]
    } <span data-fa-font-exclusion>${
      selectEl.options[j].innerHTML.split(" ")[1]
    }</span>`;

    itemEl.setAttribute(
      "data-icon",
      selectEl.options[j].innerHTML.split(" ")[0]
    );
    itemEl.setAttribute(
      "data-value",
      selectEl.options[j].innerHTML.split(" ")[1]
    );

    itemEl.addEventListener("click", function (e) {
      var y, i, k, s, h, sl, yl;
      s = this.parentNode.parentNode.getElementsByTagName("select")[0];
      sl = s.length;
      h = this.parentNode.previousSibling;
      for (i = 0; i < sl; i++) {
        if (
          s.options[i].innerHTML.split(" ")[0] == this.getAttribute("data-icon")
        ) {
          s.selectedIndex = i;
          h.innerHTML = this.getAttribute("data-icon");
          y = this.parentNode.getElementsByClassName("same-as-selected");
          yl = y.length;
          for (k = 0; k < yl; k++) {
            $(y[k]).contents()[0].nodeValue = this.getAttribute("data-icon");
            y[k].removeAttribute("class");
          }
          this.setAttribute("class", "same-as-selected");
          $(this).contents()[0].nodeValue = "\uf00c";
          break;
        }
      }
      h.click();
    });
    itemsEl.appendChild(itemEl);
  }
  selectMenu[i].appendChild(itemsEl);
  selectedEl.addEventListener("click", function (e) {
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  var x,
    y,
    i,
    xl,
    yl,
    arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i);
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

document.addEventListener("click", closeAllSelect);
