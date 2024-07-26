const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleBtn = document.querySelector(".toggle_button");
const deleteBtn = document.querySelector(".del");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");



let userMessage = null;
let isResponseGenerating = false;

const API_KEY = "AIzaSyC7pjg0iDkeqeaSSTeDmBIEu5ou5Jg07U4";

const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const loadLocalStorage = () => {
    const savedChats = localStorage.getItem('savedChats');
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

    document.body.classList.toggle("light_mode", isLightMode);
    toggleBtn.innerText = isLightMode ? "dark_mode" : "light_mode";

    chatList.innerHTML = savedChats || "";
    document.body.classList.toggle("hide-header", savedChats);
    chatList.scrollTo(0, chatList.scrollHeight);
}
loadLocalStorage();  
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

const showTypingEffect = (text, textElement, incomingMessageDiv) =>{
    const words = text.split(' ')
    let currentWordIndex = 0;

    const typingInterval = setInterval(() => {
        textElement.innerText += (currentWordIndex === 0 ? ' ' : ' ') + words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");

        if(currentWordIndex === words.length){
            clearInterval(typingInterval);
            let isResponseGenerating = false;
        localStorage.setItem("savedChats", chatList.innerHTML)
        incomingMessageDiv.querySelector(".icon").classList.remove("hide");
    }

        chatList.scrollTo(0, chatList.scrollHeight);
    } ,75)
}

const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }]
            })
        });
        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);

        const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1')
        showTypingEffect(apiResponse, textElement, incomingMessageDiv)
    } catch (err) {
        let isResponseGenerating = false;
        textElement.innerText = err.message;
        textElement.classList.add("error");
    } finally{
        incomingMessageDiv.classList.remove("loading");
    }
}

    const showLoadingAnimation = () => {
        const html = `<div class="message-content">
                        <img src="./gemini.svg" alt="" class="avatar gem">
                        <p class="text"></p>
                        <div class="loading-indicator">
                            <div class="loading-bar"></div>
                            <div class="loading-bar"></div>
                            <div class="loading-bar"></div>
                        </div>
                        <span  onclick="copyMessage(this)" class="icon material-symbols-rounded">
                            content_copy
                            </span>`

        const incomingMessageDiv = createMessageElement(html, "incoming", "loading")
        chatList.appendChild(incomingMessageDiv);
        chatList.scrollTo(0, chatList.scrollHeight);

        generateAPIResponse(incomingMessageDiv);

    };

    const copyMessage = (copyIcon) => {
        const messageText = copyIcon.parentElement.querySelector(".text").innerText

        navigator.clipboard.writeText(messageText);
        copyIcon.innerText = "done";
        setTimeout(() => copyIcon.innerText = "content_copy", 1000)
    }

    const handleOutgoingChat = () => {
        userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
        if (!userMessage) return;

        let isResponseGenerating = true;

        const html = `<div class="message-content">
                    <img src="./profile.jpg" alt="" class="avatar">
                    <p class="text"></p>
                </div>`

        const outgoingMessageDiv = createMessageElement(html, "outgoing")
        outgoingMessageDiv.querySelector(".text").innerText = userMessage;
        chatList.appendChild(outgoingMessageDiv);

        typingForm.reset();
        chatList.scrollTo(0, chatList.scrollHeight);
        document.body.classList.add("hide-header")
        setTimeout(showLoadingAnimation, 500)
    };

    suggestions.forEach(suggestion => {
        suggestion.addEventListener("click", () =>{
            userMessage = suggestion.querySelector(".text").innerText;
            handleOutgoingChat()
        })
    })

    deleteBtn.addEventListener("click", () =>{
        if(confirm("Are You Sure To Delete Chats?")){
            chatList.innerHTML = "";
            localStorage.removeItem("savedChats");
            document.body.classList.remove("hide-header")
        }
    })
    toggleBtn.addEventListener("click", () => {
        const isLightMode = document.body.classList.toggle("light_mode")
        localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode")
        toggleBtn.innerText = isLightMode ? "dark_mode" : "light_mode"
    })
    typingForm.addEventListener("submit", (e) => {
        e.preventDefault();

        handleOutgoingChat();
});