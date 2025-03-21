
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("userInput");

// Send message on Enter key
userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
});

// Send Message Function
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Show user message
    addMessage(message, 'user-message');

    // Clear input field
    userInput.value = "";

    // API call to Gemini AI
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB-CNxf3NKK2b0Q82QXc-i5nuo5tRldEkA", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }]
            })
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        // Show AI response properly
        await showAIResponse(aiResponse, 'ai-response');

    } catch (error) {
        console.error("Error:", error);
        addMessage("❌ Error: Unable to connect to Gemini AI API.", 'ai-response');
    }
}

// Function to add simple user message (without typing effect)
function addMessage(text, className) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-bubble ${className}`;
    messageDiv.innerHTML = formatCode(text); // Format if contains code
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to show AI response
async function showAIResponse(text, className) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-bubble ${className}`;
    chatWindow.appendChild(messageDiv);

    const parts = splitMessage(text);

    for (const part of parts) {
        if (part.type === "code") {
            // Code block added instantly
            const codeBlock = document.createElement("pre");
            codeBlock.className = "code-block";
            const codeElement = document.createElement("code");
            codeElement.textContent = part.content.trim();
            codeBlock.appendChild(codeElement);
            messageDiv.appendChild(codeBlock);
        } else {
            // Typing only for text
            await typeText(part.content, messageDiv);
        }
    }

    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Typing text faster
async function typeText(text, container) {
    const span = document.createElement("span");
    container.appendChild(span);

    for (let i = 0; i < text.length; i++) {
        span.innerHTML += text[i];
        chatWindow.scrollTop = chatWindow.scrollHeight;
        await new Promise(resolve => setTimeout(resolve, 5)); // Fast typing speed (5ms)
    }
}

// Split message into normal and code parts
function splitMessage(text) {
    const regex = /```([\s\S]*?)```/g;
    let result, lastIndex = 0;
    const parts = [];

    while ((result = regex.exec(text)) !== null) {
        if (result.index > lastIndex) {
            parts.push({ type: "text", content: text.substring(lastIndex, result.index) });
        }
        parts.push({ type: "code", content: result[1] });
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push({ type: "text", content: text.substring(lastIndex) });
    }

    return parts;
}

// Format code blocks in simple messages (optional)
function formatCode(text) {
    return text.replace(/```([\s\S]*?)```/g, (match, code) => {
        return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
    }).replace(/\n/g, '<br>'); // Line breaks for normal text
}
