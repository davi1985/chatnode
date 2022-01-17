// @ts-nocheck
const socket = io();
let username = "";
let usersList = [];

let loginPage = document.getElementById("loginPage");
let chatPage = document.getElementById("chatPage");

let nameInput = document.getElementById("inputName");
let chatInput = document.getElementById("chatInput");

loginPage.style.display = "flex";
chatPage.style.display = "none";

function renderUserList() {
  let ul = document.querySelector(".users");
  ul.innerHTML = "";

  usersList.forEach((item) => {
    ul.innerHTML += ` <li>${item}</li>`;
  });
}

function renderMessage(type, author, message) {
  let ul = document.querySelector(".messages");

  switch (type) {
    case "status":
      ul.innerHTML += `<li class="status">${message}</li>`;
      break;
    case "message":
      if (username === author) {
        ul.innerHTML += `<li class="message">
        <span class="user-message">${author}: </span>
        ${message}
        </li>
      `;
      } else {
        ul.innerHTML += `<li class="message">
        <span>${author}: </span>
        ${message}
        </li>`;
      }
  }

  ul.scrollTop = ul.scrollHeight;
}

nameInput.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    let name = nameInput.value.trim();

    if (name !== "") {
      username = name;
      document.title = `Chat (${username})`;

      socket.emit("join-request", username);
    }
  }
});

chatInput.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    let message = chatInput.value.trim();
    chatInput.value = "";

    if (message !== "") {
      renderMessage("message", username, message);

      socket.emit("send-message", message);
    }
  }
});

socket.on("user-ok", (users) => {
  loginPage.style.display = "none";
  chatPage.style.display = "flex";

  chatInput.focus();

  renderMessage("status", null, "Conectado");

  usersList = users;

  renderUserList();
});

socket.on("list-update", (data) => {
  if (data.joined) {
    renderMessage("status", null, `${data.joined} entrou no chat.`);
  }

  if (data.left) {
    renderMessage("status", null, `${data.left} saiu do chat.`);
  }

  usersList = data.list;

  renderUserList();
});

socket.on("show-message", (data) => {
  renderMessage("message", data.username, data.message);
});

socket.on("disconnect", () => {
  renderMessage("status", null, "Você foi disconectado...");

  usersList = [];

  renderUserList();
});

socket.on("connect_error", () => {
  renderMessage("status", null, "Tentando reconectar");
});

socket.on("connect", () => {
  renderMessage("status", null, "Reconectado");

  if (username !== "") {
    socket.emit("join-request", username);
  }
});
