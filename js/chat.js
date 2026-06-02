// ============================================
//   AI CHAT WIDGET
//   Connects to Netlify Function → Claude API
//   Watches for BOOKING_READY signal to
//   submit booking to Netlify Forms
// ============================================

let conversationHistory = [];
let isTyping = false;
let bookingData = {};

const SUGGESTIONS = [
  "I want to book an appointment",
  "What services do you offer?",
  "How much is a full detail?",
  "Do you do ceramic coating?",
];

// ── Initialize ─────────────────────────────────────────────────────────────
function initChat() {
  const widget = document.getElementById('chatWidget');
  if (!widget) return;

  const toggle      = document.getElementById('chatToggle');
  const closeBtn    = document.getElementById('chatClose');
  const chatWindow  = document.getElementById('chatWindow');
  const input       = document.getElementById('chatInput');
  const sendBtn     = document.getElementById('chatSend');
  const suggestions = document.getElementById('chatSuggestions');

  // Build suggestion buttons
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

  // Toggle chat open/close
  toggle.addEventListener('click', () => {
    chatWindow.classList.toggle('open');
    const dot = document.getElementById('chatDot');
    if (dot) dot.style.display = 'none';
    if (chatWindow.classList.contains('open')) {
      setTimeout(() => input.focus(), 300);
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  // Send on button click
  sendBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (text && !isTyping) {
      sendMessage(text);
      input.value = '';
      input.style.height = 'auto';
    }
  });

  // Send on Enter
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = input.value.trim();
      if (text && !isTyping) {
        sendMessage(text);
        input.value = '';
        input.style.height = 'auto';
      }
    }
  });

  // Auto resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  });
}

// ── Add message bubble ─────────────────────────────────────────────────────
function addMessage(text, role) {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-message chat-message--${role === 'user' ? 'user' : 'bot'}`;
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerHTML = text.replace(/\n/g, '<br>');
  div.appendChild(bubble);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// ── Typing indicator ───────────────────────────────────────────────────────
function showTyping() {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-message chat-message--bot';
  div.id = 'typingIndicator';
  div.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

// ── Submit booking to Netlify Forms ───────────────────────────────────────
async function submitBooking(data) {
  try {
    const formData = new URLSearchParams();
    formData.append('form-name', 'ai-booking');
    formData.append('name',    data.name    || '');
    formData.append('phone',   data.phone   || '');
    formData.append('email',   data.email   || '');
    formData.append('vehicle', data.vehicle || '');
    formData.append('service', data.service || '');
    formData.append('date',    data.date    || '');
    formData.append('source',  'AI Chat Widget');

    await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    console.log('Booking submitted successfully:', data);
    return true;
  } catch (error) {
    console.error('Booking submission error:', error);
    return false;
  }
}

// ── Send message ───────────────────────────────────────────────────────────
async function sendMessage(text) {
  if (isTyping) return;
  isTyping = true;

  // Hide suggestions
  const suggestions = document.getElementById('chatSuggestions');
  if (suggestions) suggestions.style.display = 'none';

  const sendBtn = document.getElementById('chatSend');
  sendBtn.disabled = true;

  addMessage(text, 'user');
  conversationHistory.push({ role: 'user', content: text });
  showTyping();

  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory })
    });

    const data = await response.json();
    let message = data.message;

    hideTyping();

    // Check if Claude has collected all booking info
    // Look for the BOOKING_READY signal
    const bookingMatch = message.match(/BOOKING_READY:(\{.*?\})/s);

    if (bookingMatch) {
      // Strip the signal from the displayed message
      message = message.replace(/BOOKING_READY:(\{.*?\})/s, '').trim();

      // Parse the booking data
      const booking = JSON.parse(bookingMatch[1]);

      // Submit to Netlify Forms silently
      await submitBooking(booking);
    }

    // Display the clean message
    addMessage(message, 'bot');
    conversationHistory.push({ role: 'assistant', content: message });

  } catch (error) {
    hideTyping();
    addMessage("Sorry, something went wrong. Please call us at (555) 000-0000.", 'bot');
  }

  isTyping = false;
  sendBtn.disabled = false;
}

document.addEventListener('DOMContentLoaded', initChat);