// ============================================
//   AI CHAT WIDGET
//   Connects to the Netlify Function which
//   securely calls the Claude API.
// ============================================

// Conversation history — sent with every message
// so Claude remembers the full context
let conversationHistory = [];
let isTyping = false;

// Quick reply suggestions shown at the start
const SUGGESTIONS = [
  "What services do you offer?",
  "How much is a full detail?",
  "Do you do ceramic coating?",
  "How do I book an appointment?"
];

// ── Initialize the widget ──────────────────────────────────────────────────
function initChat() {
  const widget = document.getElementById('chatWidget');
  if (!widget) return;

  const toggle     = document.getElementById('chatToggle');
  const closeBtn   = document.getElementById('chatClose');
  const window_    = document.getElementById('chatWindow');
  const input      = document.getElementById('chatInput');
  const sendBtn    = document.getElementById('chatSend');
  const messages   = document.getElementById('chatMessages');
  const suggestions = document.getElementById('chatSuggestions');

  // Render suggestion buttons
  SUGGESTIONS.forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'chat-suggestion';
    btn.textContent = text;
    btn.addEventListener('click', () => {
      sendMessage(text);
      suggestions.style.display = 'none';
    });
    suggestions.appendChild(btn);
  });

  // Toggle open/close
  toggle.addEventListener('click', () => {
    window_.classList.toggle('open');
    // Remove notification dot when opened
    const dot = document.getElementById('chatDot');
    if (dot) dot.style.display = 'none';
    // Focus input when opened
    if (window_.classList.contains('open')) {
      setTimeout(() => input.focus(), 300);
    }
  });

  closeBtn.addEventListener('click', () => {
    window_.classList.remove('open');
  });

  // Send on button click
  sendBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (text && !isTyping) {
      sendMessage(text);
      input.value = '';
    }
  });

  // Send on Enter (Shift+Enter for new line)
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = input.value.trim();
      if (text && !isTyping) {
        sendMessage(text);
        input.value = '';
      }
    }
  });

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  });
}

// ── Add a message bubble to the chat ──────────────────────────────────────
function addMessage(text, role) {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-message chat-message--${role === 'user' ? 'user' : 'bot'}`;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = text;

  div.appendChild(bubble);
  messages.appendChild(div);

  // Scroll to bottom
  messages.scrollTop = messages.scrollHeight;
  return div;
}

// ── Show typing indicator ──────────────────────────────────────────────────
function showTyping() {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-message chat-message--bot';
  div.id = 'typingIndicator';

  const typing = document.createElement('div');
  typing.className = 'chat-typing';
  typing.innerHTML = '<span></span><span></span><span></span>';

  div.appendChild(typing);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// ── Remove typing indicator ────────────────────────────────────────────────
function hideTyping() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

// ── Send a message ─────────────────────────────────────────────────────────
async function sendMessage(text) {
  if (isTyping) return;
  isTyping = true;

  // Hide suggestions after first message
  const suggestions = document.getElementById('chatSuggestions');
  if (suggestions) suggestions.style.display = 'none';

  // Disable send button
  const sendBtn = document.getElementById('chatSend');
  sendBtn.disabled = true;

  // Add user message to UI
  addMessage(text, 'user');

  // Add to conversation history
  conversationHistory.push({ role: 'user', content: text });

  // Show typing indicator
  showTyping();

  try {
    // Call the Netlify Function
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory })
    });

    const data = await response.json();

    // Hide typing and show response
    hideTyping();
    addMessage(data.message, 'bot');

    // Add to conversation history so Claude remembers
    conversationHistory.push({ role: 'assistant', content: data.message });

  } catch (error) {
    hideTyping();
    addMessage("Sorry, something went wrong. Please call us directly at (555) 000-0000.", 'bot');
  }

  isTyping = false;
  sendBtn.disabled = false;
}

// ── Run on load ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initChat);