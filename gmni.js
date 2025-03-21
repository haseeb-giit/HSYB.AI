// DOM elements
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("userInput");

// Add an event listener to send a message on pressing "Enter"
userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
});

// Function to split text into different parts
function splitMessage(text) {
    return [{ type: "text", content: text }];
}

// Send Message Function
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Show user message
    addMessage(message, "user-message");

    // Clear the input field
    userInput.value = "";

    try {
        // Replace this with your actual OpenRouter API key
        const apiKey = "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";
        const url = "https://openrouter.ai/api/v1/chat/completions"; // OpenRouter API endpoint

        // API request to OpenRouter
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4", // Specify the model
                messages: [
                              { role: "system", content: "This AI was developed by Haseeb." },{ role: "user", content: message }
                          ], // User message payload
                
                stream: false // Set to false for non-streaming response
            }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || "No response received from the AI.";

        // Show AI response
        showAIResponse(aiResponse, "ai-response");
    } catch (error) {
        console.error("Error:", error);
        addMessage("❌ Error: Unable to connect to OpenRouter API.", "ai-response");
    }
}

// Add a user message to the chat window
function addMessage(text, className) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-bubble ${className}`;
    messageDiv.textContent = text;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Show AI response in the chat window
function showAIResponse(text, className) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-bubble ${className}`;
    chatWindow.appendChild(messageDiv);

    const parts = splitMessage(text);
    for (const part of parts) {
        if (part.type === "code") {
            const codeBlock = document.createElement("pre");
            const codeElement = document.createElement("code");
            codeElement.textContent = part.content.trim();
            codeBlock.appendChild(codeElement);

            // Syntax highlighting (requires Highlight.js library)
            hljs.highlightElement(codeElement);
            messageDiv.appendChild(codeBlock);
        } else {
            messageDiv.textContent = part.content;
        }
    }
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
