
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
        addMessage("❌ Error: A virus or malicious attack has caused this issue. The system is currently under maintenance.", 'ai-response');
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
            const codeBlock = document.createElement("pre");
            codeBlock.className = "code-block";
            const codeElement = document.createElement("code");
            codeElement.textContent = part.content.trim();
            codeBlock.appendChild(codeElement);
            messageDiv.appendChild(codeBlock);
        } else {
            await typeFormattedResponse(part.content, messageDiv);
        }
    }

    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function typeFormattedResponse(text, container) {
    // Split text into sections based on headings
    const sections = text.split(/(?=\*\*[^*]+\*\*)/);

    for (const section of sections) {
        if (!section.trim()) continue;

        // Check if section starts with a heading
        if (section.startsWith('**')) {
            // Extract heading and content
            const [fullMatch, heading, content] = section.match(/\*\*([^*]+)\*\*([\s\S]*)/);

            // Create and append heading
            const h2 = document.createElement('h2');
            await typeText(heading.trim(), h2);
            container.appendChild(h2);

            // Create and append content if exists
            if (content.trim()) {
                const p = document.createElement('p');
                await typeText(content.trim(), p);
                container.appendChild(p);
            }
        } else {
            // Regular paragraph
            const paragraphs = section.split('\n\n');
            for (const para of paragraphs) {
                if (para.trim()) {
                    const p = document.createElement('p');
                    await typeText(para.trim(), p);
                    container.appendChild(p);
                }
            }
        }
    }
}

// Update typeText function for better character rendering
async function typeText(text, container) {
    const words = text.split(' ');
    let currentSpan = document.createElement('span');
    container.appendChild(currentSpan);

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        for (let char of word) {
            currentSpan.textContent += char;
            chatWindow.scrollTop = chatWindow.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, 5));
        }

        if (i < words.length - 1) {
            currentSpan.textContent += ' ';
        }
    }
}

// Add these styles for better formatting
const updatedStyles = `
<style>
.chat-bubble h2 {
    color: #fff;
    font-size: 1.4em;
    margin: 20px 0 10px 0;
    font-weight: 600;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 5px;
}

.chat-bubble p {
    margin: 12px 0;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
    white-space: pre-wrap;
}

.chat-bubble p:last-child {
    margin-bottom: 0;
}

.chat-bubble span {
    white-space: pre-wrap;
}
</style>
`;

// Add the updated styles
document.head.insertAdjacentHTML('beforeend', updatedStyles);

function formatText(text) {
    // First process the headings and sections
    text = text.replace(/\*\*([^*]+)\*\*/g, '<h2>$1</h2>');

    // Process paragraphs (split by double newlines)
    const paragraphs = text.split(/\n\n/);
    return paragraphs.map(para => {
        if (!para.trim()) return '';

        // Skip if it's already wrapped in HTML tags
        if (para.match(/^<[^>]+>/)) return para;

        // Process inline formatting
        return `<p>${para
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .trim()}</p>`;
    }).join('\n');
}

// Update styles for better formatting
const formattingStyles = `
<style>
.chat-bubble h2 {
    color: #fff;
    font-size: 1.4em;
    margin: 20px 0 10px 0;
    font-weight: 600;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 5px;
}

.chat-bubble p {
    margin: 12px 0;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
}

.chat-bubble strong {
    color: #fff;
    font-weight: 600;
}

.chat-bubble em {
    font-style: italic;
    color: rgba(255, 255, 255, 0.8);
}

.chat-bubble br {
    display: block;
    margin: 5px 0;
    content: "";
}
</style>
`;

// Add the new styles
document.head.insertAdjacentHTML('beforeend', formattingStyles);

// Update the typeText function to handle line breaks better
async function typeText(text, container) {
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const span = document.createElement("span");
        container.appendChild(span);

        // Type each character in the line
        for (let char of lines[i]) {
            span.innerHTML += char;
            chatWindow.scrollTop = chatWindow.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, 5));
        }

        // Add line break if not the last line
        if (i < lines.length - 1) {
            container.appendChild(document.createElement('br'));
        }
    }
}

// Update styles
const markdownStyles = `
<style>
.chat-bubble h2 {
    color: #fff;
    font-size: 1.4em;
    margin: 20px 0 10px 0;
    font-weight: 600;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 5px;
}

.chat-bubble p {
    margin: 10px 0;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
}

.chat-bubble strong {
    color: #fff;
    font-weight: 600;
}

.chat-bubble em {
    font-style: italic;
    color: rgba(255, 255, 255, 0.8);
}
</style>
`;

// Add the new styles
document.head.insertAdjacentHTML('beforeend', markdownStyles);

// New function to process formatted text
async function processFormattedText(text) {
    // Split text into sections based on headings
    const sections = text.split(/(?=\*\*[^*]+\*\*)/);
    let formattedHtml = '';

    for (const section of sections) {
        if (section.trim()) {
            // Extract heading and content
            const headingMatch = section.match(/\*\*([^*]+)\*\*(.*)/s);
            if (headingMatch) {
                const [, heading, content] = headingMatch;
                formattedHtml += `<h2>${heading}</h2><p>${content.trim()}</p>`;
            } else {
                formattedHtml += `<p>${section}</p>`;
            }
        }
    }

    return formattedHtml;
}

// Update the styles
const additionalStyles = `
<style>
.chat-bubble h2 {
    color: #fff;
    font-size: 1.3em;
    margin: 15px 0 10px 0;
    font-weight: 600;
}

.chat-bubble p {
    margin: 8px 0;
    line-height: 1.5;
}

.chat-bubble strong {
    font-weight: 600;
    color: #fff;
}
</style>
`;

// Add the new styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// New function to handle text formatting
function formatText(text) {
    return text
        // Headers with bold
        .replace(/\*\*(\d+)\.\s+([^*]+)\*\*/g, '<h2>$1. $2</h2>')

        // Bold text
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

        // Italic text
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')

        // Numbered lists
        .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.+<\/li>)\s*(?=<li>|$)/gs, '<ol>$1</ol>')

        // Line breaks
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
}

// New function to type formatted text
async function typeFormattedText(html, container) {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    for (const node of temp.childNodes) {
        if (node.nodeType === 3) { // Text node
            await typeText(node.textContent, container);
        } else {
            const element = document.createElement(node.tagName);
            element.className = node.className;
            if (node.textContent.trim()) {
                await typeText(node.textContent, element);
            }
            container.appendChild(element);
        }
    }
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
    // First handle code blocks
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
        return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
    });

    // Format other elements
    text = text
        // Headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')

        // Bold, Italic, Strike-through
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>')

        // Lists
        .replace(/^\s*[-+*]\s(.+)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/^\d+\.\s(.+)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')

        // Links and Images
        .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/!\[([^\]]+)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">')

        // Blockquotes
        .replace(/^\> (.+)/gm, '<blockquote>$1</blockquote>')

        // Tables
        .replace(/\|(.+)\|/g, function (match) {
            const cells = match.split('|').slice(1, -1);
            const row = cells.map(cell => `<td>${cell.trim()}</td>`).join('');
            return `<tr>${row}</tr>`;
        })
        .replace(/(<tr>.*<\/tr>)/s, '<table class="custom-table">$1</table>')

        // Line breaks
        .replace(/\n/g, '<br>');

    return text;
}

// Add this CSS to your styles for better table formatting
const tableStyles = `
<style>
.custom-table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    overflow: hidden;
}

.custom-table td, .custom-table th {
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

blockquote {
    border-left: 4px solid rgba(255, 255, 255, 0.2);
    margin: 10px 0;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}

ul, ol {
    margin: 10px 0;
    padding-left: 20px;
}

li {
    margin: 5px 0;
}

h1, h2, h3 {
    margin: 15px 0;
    color: #fff;
}

h1 { font-size: 1.8em; }
h2 { font-size: 1.5em; }
h3 { font-size: 1.2em; }

img {
    max-width: 100%;
    border-radius: 8px;
    margin: 10px 0;
}

a {
    color: #7289da;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
</style>
`;

// Add styles to the document head
document.head.insertAdjacentHTML('beforeend', tableStyles);
