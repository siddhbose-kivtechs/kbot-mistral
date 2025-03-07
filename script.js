// DOM Elements
const send_icon = document.getElementsByClassName("send-icon")[0];
const input = document.getElementsByClassName("InputMSG")[0];
const ContentChat = document.getElementsByClassName("ContentChat")[0];
const send1 = document.getElementById("send1");
const send2 = document.getElementById("send2");

// Server URL 
const SERVER_URL = "https://hono-vercel-mistral.vercel.app/api/chat";

// Event Listeners
send_icon.addEventListener("click", SendMsgUser);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        SendMsgUser();
    }
});

// Bot Status (0 = ready, 1 = busy)
let status_func_SendMsgBot = 0;

// Function to Send User Message
function SendMsgUser() {
    if (input.value.trim() !== "" && status_func_SendMsgBot === 0) {
        const userMessage = input.value.trim();

        // Add User Message to Chat
        const userMsgElement = document.createElement("div");
        userMsgElement.classList.add("massage", "msgCaption");
        userMsgElement.setAttribute("data-user", "true");
        userMsgElement.innerHTML = `<span class="captionUser">You</span><div class="user-response">${userMessage}</div>`;
        ContentChat.appendChild(userMsgElement);
        userMsgElement.scrollIntoView();

        // Clear Input and Send Bot Response
        input.value = "";
        SendMsgToServer(userMessage);
    }
}

// Function to Send Message to Server
function SendMsgToServer(msg) {
    // Prevent multiple simultaneous requests
    if (status_func_SendMsgBot === 1) return;

    status_func_SendMsgBot = 1;

    // Add Loading Animation
    const loadingElement = document.createElement("div");
    loadingElement.classList.add("massage");
    loadingElement.innerHTML = `<div class="bot-response text" text-first="true"><svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#000"><circle cx="20" cy="20" r="16" stroke-width="4" stroke-dasharray="30 50" stroke-linecap="round" style="animation: rot 1.5s linear infinite"></circle></svg></div>`;
    ContentChat.appendChild(loadingElement);
    loadingElement.scrollIntoView();

    // Send Message to Server
    fetch(SERVER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: msg }),
        signal: AbortSignal.timeout(10000) // 10-second timeout
    })
    .then((response) => {
        if (!response.ok) {
            // Handle specific HTTP error status codes
            switch(response.status) {
                case 400:
                    throw new Error("Bad Request: Invalid message format");
                case 500:
                    throw new Error("Server Error: Please try again later");
                case 503:
                    throw new Error("Service Unavailable: Server is overloaded");
                default:
                    throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        return response.json();
    })
    .then((data) => {
        // Replace Loading Animation with Bot Response
        loadingElement.innerHTML = `<div class="bot-response text" text-first="true">${data.response}</div>`;
        loadingElement.scrollIntoView();
    })
    .catch((error) => {
        console.error("Error:", error);
        
        // More specific error messaging
        let errorMessage = "😵‍💫 Oops! Something went wrong.";
        
        if (error.name === 'AbortError') {
            errorMessage = "⏰ Request timed out. Please check your internet connection.";
        } else if (error.message.includes("Failed to fetch")) {
            errorMessage = "🌐 Network error. Please check your internet connection.";
        }
        
        loadingElement.innerHTML = `<div class="bot-response text" text-first="true">${errorMessage}</div>`;
        loadingElement.scrollIntoView();
    })
    .finally(() => {
        // Reset Bot Status
        status_func_SendMsgBot = 0;
    });
}

// Initial Bot Greeting
function sendInitialGreeting() {
    const greetingElement = document.createElement("div");
    greetingElement.classList.add("massage");
    greetingElement.innerHTML = `<div class="bot-response text" text-first="true">Hi 👋 ! It's good to see you!</div><div class="bot-response text" text-last="true">How can I help you?</div>`;
    ContentChat.appendChild(greetingElement);
    greetingElement.scrollIntoView();
}

// Send Initial Greeting After 2 Seconds
setTimeout(sendInitialGreeting, 2000);