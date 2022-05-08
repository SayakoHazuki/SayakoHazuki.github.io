function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/*
const DEFAULT_HEADERS = {
  credentials: "include",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0)" +
    "Gecko/20100101 Firefox/100.0",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9," +
    "image/avif,image/webp,*\/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  mode: "cors",
};

function extendHeaders(_headers = {}) {
  tmp_headers = DEFAULT_HEADERS;
  for (const name in _headers) {
    tmp_headers[name] = _headers[name];
  }
  return tmp_headers;
}
*/

class PycClient {
  constructor(pyccode, password) {
    this.pyccode = pyccode;
    this.password = password;
  }

  login = () =>
    new Promise((resolve, reject) => {
      if (!this.pyccode || !this.password) return reject();
      fetch(
        `https://PYCNextAPI.ookai9097oo.repl.co/creds/${this.pyccode}?pass=${this.password}`,
        {
          method: "GET",
          mode: "cors",
          credentials: "omit",
        }
      ).then((response) => {
        if (response.status === 401) {
          reject("Invalid Credentials");
        }
        response.json().then((data) => {
          for (const cookieName in data) {
            setCookie(cookieName, data[cookieName]);
          }
          resolve();
        });
      });
    });

  getMessages = (page, retries = 0) =>
    new Promise((resolve, reject) => {
      console.log("getting messages");
      fetch(`https://PYCNextAPI.ookai9097oo.repl.co/messages/${page}`, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        headers: {
          "PYC-PHPSESSID": getCookie("PHPSESSID"),
          "PYC-TOKEN": getCookie("access_token"),
        },
      }).then((response) => {
        if (response.status === 401) {
          if (retries < 1) {
            this.login().then(
              () => {
                this.getMessages(page, 1);
              },
              () => {
                window.location.href = "./login";
              }
            );
          }
        }
        response.text().then((data) => {
          resolve(data);
        });
      });
    });

  getMessage = (id, retries = 0) =>
    new Promise((resolve, reject) => {
      console.log("getting message content");
      fetch(`https://PYCNextAPI.ookai9097oo.repl.co/message/${id}`, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        headers: {
          "PYC-PHPSESSID": getCookie("PHPSESSID"),
          "PYC-TOKEN": getCookie("access_token"),
        },
      }).then((response) => {
        if (response.status === 401) {
          if (retries < 1) {
            this.login().then(
              () => {
                this.getMessage(id, 1);
              },
              () => {
                window.location.href = "./login";
              }
            );
          }
        }
        response.json().then((data) => {
          resolve(data);
        });
      });
    });
}

checklogin = () =>
  new Promise((resolve, reject) => {
    if (pyc == null) {
      if (getCookie("PHPSESSID") != null && getCookie("access_token") != null) {
        pyc = new PycClient();
        return resolve(true);
      }
      return resolve(false);
    }
    return resolve(true);
  });
