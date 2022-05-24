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
          return reject("Invalid Credentials");
        }
        if (!response.ok) {
          return reject("Server Error");
        }
        response.json().then((data) => {
          for (const cookieName in data) {
            setCookie(cookieName, data[cookieName]);
          }
          resolve();
        });
      });
    });

  getMessages = (page, retries = 0, options = {}) =>
    new Promise((resolve, reject) => {
      console.log("getting messages");
      let optionsString = "";
      if (Object.keys(options).length > 0) {
        optionsString = "?";
        for (const optionKey in options) {
          optionsString += `${optionKey}=${options[optionKey]}&`;
        }
        optionsString = optionsString.replace(/\&$/, "");
      }
      console.log(options, optionsString);
      fetch(
        `https://PYCNextAPI.ookai9097oo.repl.co/${
          options.sent ? "sent_messages" : "messages"
        }/${page}${optionsString}`,
        {
          method: "GET",
          mode: "cors",
          credentials: "omit",
          headers: {
            "PYC-PHPSESSID": getCookie("PHPSESSID"),
            "PYC-TOKEN": getCookie("access_token"),
          },
        }
      ).then((response) => {
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

  getCirculars = (page, retries = 0) =>
    new Promise((resolve, reject) => {
      console.log("Getting circulars list");
      fetch(`https://PYCNextAPI.ookai9097oo.repl.co/circulars/${page}`, {
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
                this.getCirculars(page, 1);
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

  getCircular = (id, retries = 0) =>
    new Promise((resolve, reject) => {
      console.log(`Getting Circular ${id}`);
      fetch(`https://PYCNextAPI.ookai9097oo.repl.co/circular/${id}`, {
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
                this.getCirculars(page, 1);
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

  sendMessage = (recipients, subject, content, savemail) =>
    new Promise((resolve, reject) => {
      fetch(`https://PYCNextAPI.ookai9097oo.repl.co/compose`, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          "PYC-PHPSESSID": getCookie("PHPSESSID"),
          "PYC-TOKEN": getCookie("access_token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          recipients,
          mailbody: content,
          savemail: savemail,
        }),
      }).then((response) => {
        if (!response.ok) {
          reject();
        }
        resolve();
      });
    });

  findUsers = (query) =>
    new Promise((resolve, reject) => {
      fetch(`https://PYCNextAPI.ookai9097oo.repl.co/users/find?q=${query}`, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        headers: {
          "PYC-PHPSESSID": getCookie("PHPSESSID"),
          "PYC-TOKEN": getCookie("access_token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          resolve(data);
        });
    });
}
