// DOM Elements
const send_icon = document.getElementsByClassName("send-icon")[0];
const input = document.getElementsByClassName("InputMSG")[0];
const ContentChat = document.getElementsByClassName("ContentChat")[0];
const send1 = document.getElementById("send1");
const send2 = document.getElementById("send2");

// Server URL
const SERVER_URL = "https://hono-vercel-mistral.vercel.app/api/chat";

// Bot and User Avatar URLs
const BOT_AVATAR = "https://raw.githubusercontent.com/siddh-kivtechs/ai_image_gen/refs/heads/main/ai-8330457_1280.avif";
const USER_AVATAR = "https://media3.giphy.com/media/S92yRSCr7xdji/giphy.gif";

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
        userMsgElement.innerHTML = `<span class="captionUser"><img src="${USER_AVATAR}" alt="User">You</span><div class="user-response">${userMessage}</div>`;
        ContentChat.appendChild(userMsgElement);
        userMsgElement.scrollIntoView();

        // Clear Input and Send Bot Response
        input.value = "";
        SendMsgToServer(userMessage);
    }
}

// Function to create fancy loader HTML
function createLoaderHTML() {
    return `
        <div class="loader-container">
            <div class="loader">
                <div class="loader-dot"></div>
            </div>
        </div>
    `;
}

// Function to Send Message to Server
function SendMsgToServer(msg) {
    // Prevent multiple simultaneous requests
    if (status_func_SendMsgBot === 1) return;

    status_func_SendMsgBot = 1;

    // Add Loading Animation
    const loadingElement = document.createElement("div");
    loadingElement.classList.add("massage");
    loadingElement.innerHTML = `<span class="captionBot"><img src="${BOT_AVATAR}" alt="Bot">MISTRAL</span><div class="bot-response text" text-first="true">${createLoaderHTML()}</div>`;
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
        loadingElement.innerHTML = `<span class="captionBot"><img src="${BOT_AVATAR}" alt="Bot">MISTRAL</span><div class="bot-response text" text-first="true">${data.response}</div>`;
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

        loadingElement.innerHTML = `<span class="captionBot"><img src="${BOT_AVATAR}" alt="Bot">MISTRAL</span><div class="bot-response text" text-first="true">${errorMessage}</div>`;
        loadingElement.scrollIntoView();
    })
    .finally(() => {
        // Reset Bot Status
        status_func_SendMsgBot = 0;
    });
}

// Create initial page loading screen
function createInitialLoadingScreen() {
    // Create a full-page loader that will be removed once the app is ready
    const initialLoader = document.createElement('div');
    initialLoader.id = 'initial-loader';
    initialLoader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #1a1a1a;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        flex-direction: column;
    `;
    
    // Add loader HTML
    initialLoader.innerHTML = `
        <div class="loader-container" style="width: 150px; height: 150px;">
            <div class="loader">
                <div class="loader-dot"></div>
            </div>
        </div>
        <p style="color: white; margin-top: 20px; font-family: 'Source Sans Pro', sans-serif;">Loading Mistral Bot...</p>
    `;
    
    document.body.appendChild(initialLoader);
    
    // Remove the loader after app is ready
    setTimeout(() => {
        const loader = document.getElementById('initial-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.5s ease';
            setTimeout(() => loader.remove(), 500);
        }
        // Send initial greeting after loader is removed
        setTimeout(sendInitialGreeting, 500);
    }, 2500);
}

// Initial Bot Greeting
function sendInitialGreeting() {
    const greetingElement = document.createElement("div");
    greetingElement.classList.add("massage");
    greetingElement.innerHTML = `<span class="captionBot"><img src="${BOT_AVATAR}" alt="Bot">MISTRAL</span><div class="bot-response text" text-first="true">Hi 👋 ! It's good to see you!</div><div class="bot-response text" text-last="true">How can I help you?</div>`;
    ContentChat.appendChild(greetingElement);
    greetingElement.scrollIntoView();
}

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
    createInitialLoadingScreen();
});