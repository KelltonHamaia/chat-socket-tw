const socket = io();

let username = "";
let userList = [];
let loginPage = document.querySelector(".loginPage");
let chatPage = document.querySelector(".chatPage");

let usernameInput = document.getElementById("usernameInput");
let messageInput = document.getElementById("messageInput");

chatPage.classList.remove('flex');
chatPage.classList.add('hidden');

function renderUserList(list) {
    let ul = document.querySelector('.connectedUsers');
    ul.innerHTML = "";
    list.map((user)=> {
        let li = document.createElement('li');
        li.classList.add("font-mono", "font-semibold", "first-letter:uppercase");
        li.innerText = user;
        ul.appendChild(li);
    })
}

function addMessage(type, user, message) {
    let ul = document.querySelector('.chatUsers');
    if(type === "status") {
        let li = document.createElement('li');
        li.classList.add("font-mono", "italic", "text-gray-400");
        li.innerHTML = message;
        ul.appendChild(li);
    } 
    if(type === "msg") {
        let li = document.createElement('li');
        li.classList.add("font-mono", "text-white");
        li.innerHTML = `<span class="text-blue-400 font-bold">${user}</span>: ${message}`;
        ul.appendChild(li);
    }
}

usernameInput.addEventListener('keyup', (element) => {
    if(element.key === "Enter") {
        if(usernameInput.value.trim() !== "") {
            username = usernameInput.value;
            document.title = `Chat (${username})`;

            socket.emit("join-request", username);
        } 
    }
});

messageInput.addEventListener('keyup', (element) => {
    if(element.key === "Enter") {
        if(messageInput.value.trim() !== "") {
            addMessage("msg", username, messageInput.value);
            socket.emit("send-msg", messageInput.value);
            messageInput.value = ""
        } 
    }
});

socket.on("user-ok", (data)=> {
    loginPage.classList.remove('flex');
    loginPage.classList.add('hidden');
    chatPage.classList.remove('hidden');
    chatPage.classList.add('flex');
    messageInput.focus()
    userList = data;
    renderUserList(data);
    addMessage("status", null, "Conectado!");
});

socket.on("list-update", (data)=> {

    if(data.joined) {
        addMessage("status", null, `${data.joined} entrou no bate papo!`);
    } 
    if(data.left) {
        addMessage("status", null, `${data.left} saiu no bate papo!`);
    }
    userList = data.list;
    renderUserList(userList);
});

socket.on("show-msg", (data) => {
    addMessage("msg", data.username, data.message);
});

socket.on("disconnect", ()=> {
    addMessage("status", null, "Você foi desconectado");
    userList = [];
    renderUserList(userList);
});

socket.on("connect_error", ()=> {
    addMessage("status", null, "Tentando reconectar");
});

socket.on("connect", ()=> {
    addMessage("status", null, "Reconectado!");
    if(username !== "") {
        socket.emit("join-request", username);
    };
})