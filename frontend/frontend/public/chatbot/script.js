/* ============================================
   HR ASSIST — Chat Logic & API Integration
   ============================================ */

(function () {
    'use strict';

    // ---- Configuration ----
    const API_URL = 'http://127.0.0.1:8000/api/chat'; // Python backend URL
    const TYPING_DELAY_MIN = 600;
    const TYPING_DELAY_MAX = 1800;

    // ---- DOM Elements ----
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const typingIndicator = document.getElementById('typingIndicator');
    const suggestionChips = document.querySelectorAll('.chip');
    const sidebarNavItems = document.querySelectorAll('.nav-item');
    const newChatBtn = document.getElementById('newChatBtn');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const historyList = document.getElementById('historyList');

    // ---- State ----
    let conversationHistory = [];
    let isWaitingForResponse = false;
    let currentLanguage = 'English';

    // ---- Mock Responses (used when backend is unreachable) ----
    function getMockResponse(message) {
        const m = message.toLowerCase();
        if (m.includes("menu") || m.includes("today"))
          return "Today's menu isn't available right now — the canteen server may be offline. Try again in a moment! 🍽️";
        if (m.includes("calorie") || m.includes("kcal") || m.includes("healthy"))
          return "I couldn't fetch calorie info — the canteen server may be offline. Please try again shortly. 🥗";
        if (m.includes("payment") || m.includes("razorpay") || m.includes("pay"))
          return "Payments are processed via **Razorpay**. You'll receive a confirmation e-mail after checkout. For failed transactions, the amount is refunded within 5–7 business days. 💳";
        if (m.includes("refund"))
          return "Refunds are issued within 5–7 business days back to your original payment method. Contact the canteen admin for urgent cases. 🔄";
        if (m.includes("cancel"))
          return "Orders can be cancelled **before** the canteen starts preparing them. Open the Orders section and tap **Cancel**. ❌";
        return "I can help with today's menu, calorie info, healthy picks, payments, refunds, and order cancellations. What would you like to know? 😊 (Note: Canteen server is currently offline in background)";
    }

    // ---- Utilities ----
    function getTimestamp() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function randomDelay() {
        return Math.floor(Math.random() * (TYPING_DELAY_MAX - TYPING_DELAY_MIN)) + TYPING_DELAY_MIN;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function simpleMarkdown(text) {
        // Bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Inline code
        text = text.replace(/`(.*?)`/g, '<code>$1</code>');
        // Bullet lists
        text = text.replace(/^• (.+)$/gm, '<li>$1</li>');
        text = text.replace(/(<li>.*<\/li>\n?)+/gs, (match) => `<ul>${match}</ul>`);
        // Line breaks
        text = text.replace(/\n/g, '<br>');
        // Clean up extra <br> inside <ul>
        text = text.replace(/<ul><br>/g, '<ul>');
        text = text.replace(/<br><\/ul>/g, '</ul>');
        text = text.replace(/<\/li><br><li>/g, '</li><li>');
        return text;
    }

    // ---- Scroll to bottom ----
    function scrollToBottom() {
        requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // ---- Hide Welcome Screen ----
    function hideWelcome() {
        if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
            welcomeScreen.classList.add('hidden');
        }
    }

    // ---- Show / Hide Typing Indicator ----
    function showTyping() {
        typingIndicator.classList.add('visible');
        scrollToBottom();
    }

    function hideTyping() {
        typingIndicator.classList.remove('visible');
    }

    // ---- Create Message Element ----
    function createMessageEl(text, sender, timestamp) {
        const msg = document.createElement('div');
        msg.className = `message ${sender}`;

        const avatarHtml = sender === 'user'
            ? `<div class="message-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`
            : `<div class="message-avatar"><svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#2c5282"/><path d="M10 12h5v8h-5zM17 12h5v8h-5zM12.5 16h7" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg></div>`;

        const contentHtml = sender === 'user'
            ? escapeHtml(text)
            : simpleMarkdown(text);

        msg.innerHTML = `
            ${avatarHtml}
            <div>
                <div class="message-content">${contentHtml}</div>
                <span class="message-time">${timestamp || getTimestamp()}</span>
            </div>
        `;

        return msg;
    }

    // ---- Add Message to Chat ----
    function addMessage(text, sender) {
        hideWelcome();
        const timestamp = getTimestamp();
        const el = createMessageEl(text, sender, timestamp);

        // Insert before typing indicator
        chatMessages.insertBefore(el, typingIndicator);
        scrollToBottom();

        // Store in conversation history
        conversationHistory.push({ text, sender, timestamp });

        // Update sidebar history
        if (sender === 'user') {
            updateHistory(text);
        }
    }

    // ---- Add Error Message ----
    function addErrorMessage(errorText) {
        hideWelcome();
        const el = document.createElement('div');
        el.className = 'message bot error';
        el.innerHTML = `
            <div class="message-avatar"><svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#2c5282"/><path d="M10 12h5v8h-5zM17 12h5v8h-5zM12.5 16h7" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg></div>
            <div>
                <div class="message-content">⚠️ ${escapeHtml(errorText)}</div>
                <span class="message-time">${getTimestamp()}</span>
            </div>
        `;
        chatMessages.insertBefore(el, typingIndicator);
        scrollToBottom();
    }

    // ---- Send Message to API ----
    async function sendToAPI(userMessage) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, language: currentLanguage })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            return data.response || data.answer || data.reply || 'No response received.';
        } catch (error) {
            console.warn('Backend unreachable, using mock response:', error.message);
            // Fallback to mock responses
            return getMockResponse(userMessage);
        }
    }

    // ---- Handle Send ----
    async function handleSend() {
        const text = messageInput.value.trim();
        if (!text || isWaitingForResponse) return;

        isWaitingForResponse = true;

        // Add user message
        addMessage(text, 'user');

        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        updateSendButton();

        // Show typing indicator
        showTyping();

        // Get response
        const delay = randomDelay();
        const [response] = await Promise.all([
            sendToAPI(text),
            new Promise(resolve => setTimeout(resolve, delay))
        ]);

        // Hide typing and add bot response
        hideTyping();
        addMessage(response, 'bot');

        isWaitingForResponse = false;
        messageInput.focus();
    }

    // ---- Update Send Button State ----
    function updateSendButton() {
        if (messageInput.value.trim().length > 0) {
            sendBtn.classList.add('active');
            sendBtn.removeAttribute('disabled');
        } else {
            sendBtn.classList.remove('active');
            sendBtn.setAttribute('disabled', '');
        }
    }

    // ---- Auto-resize Textarea ----
    function autoResize() {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    }

    // ---- Update Sidebar History ----
    function updateHistory(question) {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.textContent = question;
        item.title = question;
        item.addEventListener('click', () => {
            messageInput.value = question;
            updateSendButton();
            closeSidebar();
            messageInput.focus();
        });

        // Add to top
        if (historyList.firstChild) {
            historyList.insertBefore(item, historyList.firstChild);
        } else {
            historyList.appendChild(item);
        }

        // Keep max 20 items
        while (historyList.children.length > 20) {
            historyList.removeChild(historyList.lastChild);
        }
    }

    // ---- Clear Chat ----
    function clearChat() {
        // Remove all messages (keep welcome and typing indicator)
        const messages = chatMessages.querySelectorAll('.message');
        messages.forEach(msg => msg.remove());

        // Show welcome screen again
        welcomeScreen.classList.remove('hidden');

        // Reset state
        conversationHistory = [];
        hideTyping();
        isWaitingForResponse = false;
    }

    // ---- Mobile Sidebar ----
    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('visible');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('visible');
    }

    // ---- Event Listeners ----

    // Send button click
    sendBtn.addEventListener('click', handleSend);

    // Enter to send (Shift+Enter for new line)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Input events
    messageInput.addEventListener('input', () => {
        updateSendButton();
        autoResize();
    });

    // Suggestion chips
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query');
            if (query) {
                messageInput.value = query;
                updateSendButton();
                handleSend();
            }
        });
    });

    // Sidebar nav items
    sidebarNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const query = item.getAttribute('data-query');
            if (query) {
                messageInput.value = query;
                updateSendButton();
                closeSidebar();
                handleSend();
            }
        });
    });

    // New chat button
    newChatBtn.addEventListener('click', clearChat);

    // Clear chat button
    clearChatBtn.addEventListener('click', clearChat);

    // Mobile menu
    mobileMenuBtn.addEventListener('click', openSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    // Keyboard shortcut: Escape to close sidebar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });

    // Focus input on load
    messageInput.focus();

    // ---- Dark Mode Toggle ----
    const themeToggle = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;

    // Load saved theme
    const savedTheme = localStorage.getItem('canteen-go-theme');
    if (savedTheme === 'dark') {
        htmlEl.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            htmlEl.setAttribute('data-theme', 'dark');
            localStorage.setItem('canteen-go-theme', 'dark');
        } else {
            htmlEl.removeAttribute('data-theme');
            localStorage.setItem('canteen-go-theme', 'light');
        }
    });

    // ---- Language Toggle ----
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = '#2c5282';
                b.style.border = '1px solid #2c5282';
            });
            btn.classList.add('active');
            btn.style.background = '#2c5282';
            btn.style.color = 'white';
            currentLanguage = btn.getAttribute('data-lang');
        });
    });

})();
