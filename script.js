// original home page scripts
function toggleSidebar() {
  document.getElementById("sidebarMenu").classList.toggle("active");
}

function openPolicy(type) {
  window.scrollTo(0,0);
  document.getElementById("policyPage").style.display = "block";
  document.body.style.overflow = "hidden";
  
  if(type === 'terms') {
    document.getElementById("termsContent").style.display = "block";
    document.getElementById("privacyContent").style.display = "none";
  } else if(type === 'privacy') {
    document.getElementById("termsContent").style.display = "none";
    document.getElementById("privacyContent").style.display = "block";
  }
}

function showPrivacyInsideTerms() {
  window.scrollTo(0,0);
  document.getElementById("termsContent").style.display = "none";
  document.getElementById("privacyContent").style.display = "block";
}

function closePolicy() {
  document.getElementById("policyPage").style.display = "none";
  document.body.style.overflow = "auto";
}

function acceptPolicy() {
  document.getElementById("policyPage").style.display = "none";
  
  const loader = document.getElementById("loadingState");
  loader.style.display = "flex";
  
  setTimeout(() => {
    loader.style.display = "none";
    
    // Purge landing interfaces entirely
    document.getElementById("landingView").style.display = "none";
    document.getElementById("mainNav").style.display = "none";
    document.body.style.overflow = "auto";
    
    // Launch completely workspace for AI application
    const workspace = document.getElementById("appWorkspace");
    workspace.style.display = "block";
    
    console.log("Workspace Activated: Ready.");
  }, 1500);
}

// AI Agent app workspaces scripts
let currentAgent = {};
let recognition;
let isAgentBuilt = false; 

const chatBody = document.getElementById("chatBody");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const panel = document.getElementById("panel");
const searchContainer = document.getElementById("searchContainer");
const voiceBtn = document.getElementById("voiceBtn");
const waveContainer = document.getElementById("waveContainer");
const buildBtn = document.getElementById("buildBtn");
const loaderText = document.getElementById("loaderText");

function updateCounter(id, max) {
  const el = document.getElementById(id);
  const counter = document.getElementById(id + "Counter");
  counter.innerText = `${el.value.length} / ${max} characters`;
}

function updateWordCounter(id, maxWords) {
  const el = document.getElementById(id);
  const counter = document.getElementById(id + "Counter");
  let words = el.value.trim().split(/\s+/).filter(w => w.length > 0);
  
  if (words.length > maxWords) {
    const truncated = el.value.split(/\s+/).slice(0, maxWords).join(" ");
    el.value = truncated;
    words = el.value.trim().split(/\s+/).filter(w => w.length > 0);
  }
  counter.innerText = `${words.length} / ${maxWords} words maximum`;
}

function handleFormChange() {
  if (isAgentBuilt) {
    buildBtn.disabled = false;
    buildBtn.style.opacity = "1";
    buildBtn.style.cursor = "pointer";
  }
}

document.querySelectorAll("#builderSection input, #builderSection textarea, #builderSection select").forEach(element => {
  element.addEventListener("input", handleFormChange);
  element.addEventListener("change", handleFormChange);
});

input.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 100) + "px";
  sendBtn.disabled = this.value.trim() === "";
});

if ('webkitSpeechRecognition' in window || 'speechRecognition' in window) {
  const SpeechObj = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechObj();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    voiceBtn.classList.add("recording-mic");
    waveContainer.style.display = "flex";
    input.placeholder = "";
  };
  recognition.onerror = () => { stopRecordingUI(); };
  recognition.onend = () => { stopRecordingUI(); };
  recognition.onresult = (event) => {
    const resultText = event.results[0][0].transcript;
    if (resultText) {
      input.value += (input.value ? " " : "") + resultText;
      input.dispatchEvent(new Event('input'));
    }
  };
} else {
  voiceBtn.style.display = "none";
}

function startVoiceRecognition(event) {
  event.stopPropagation();
  if (!recognition) return;
  try { recognition.start(); } catch(e) { recognition.stop(); }
}

function stopRecordingUI() {
  voiceBtn.classList.remove("recording-mic");
  waveContainer.style.display = "none";
  input.placeholder = "Type or use your voice to dictate...";
}

function startBuild() {
  const name = document.getElementById("name").value.trim();
  const creator = document.getElementById("creator").value.trim();
  const aboutCreator = document.getElementById("aboutCreator").value.trim();
  const personality = document.getElementById("personality").value.trim();
  const extra = document.getElementById("extra").value.trim();
  const theme = document.getElementById("theme").value;

  if (!name || !creator) return alert("Validation Failed: Fields are mandatory.");

  currentAgent = { name, creator, aboutCreator, personality, extra, theme };

  const loader = document.getElementById("loader");
  const percentageLabel = document.getElementById("percentageLabel");
  
  // Dynamic changes based on agent creation status
  if (isAgentBuilt) {
    loaderText.innerText = "Updating...";
  } else {
    loaderText.innerText = "Building...";
  }
  
  loader.style.display = "flex";
  let currentPercent = 0;

  const intervalProgress = setInterval(() => {
    currentPercent += 2;
    percentageLabel.innerText = currentPercent + "%";
    
    if(currentPercent >= 100) {
      clearInterval(intervalProgress);
      loader.style.display = "none";
      
      isAgentBuilt = true;
      buildBtn.innerText = "Update Agent";
      buildBtn.classList.add("update-state");
      
      buildBtn.disabled = true;
      buildBtn.style.opacity = "0.6";
      buildBtn.style.cursor = "not-allowed";
      
      document.getElementById("successCardSection").style.display = "block";
      document.getElementById("successCardSection").scrollIntoView({ behavior: 'smooth' });
    }
  }, 50);
}

function copyAgentLiveLink() {
  const linkInput = document.getElementById("liveAgentLink");
  linkInput.select();
  document.execCommand("copy");
}

function visitChatInterface() {
  document.getElementById("builderSection").style.display = "none";
  document.getElementById("mainHeader").style.display = "none";
  document.getElementById("chatSection").style.display = "flex";

  document.getElementById("chatTitle").innerText = currentAgent.name;
  document.getElementById("chatCreator").innerText = `By ${currentAgent.creator}`;
  document.documentElement.setAttribute("data-theme", currentAgent.theme);

  chatBody.innerHTML = "";
  sendBtn.disabled = true;

  const welcomeBanner = document.createElement("div");
  welcomeBanner.className = "chat-welcome-banner";
  welcomeBanner.innerHTML = `<b>Hi, I am ${currentAgent.name}</b>`;
  chatBody.appendChild(welcomeBanner);
  
  window.scrollTo(0, 0);
  input.focus();
}

function addMsg(text, type, id = Date.now()) {
  const wrapper = document.createElement("div");
  wrapper.className = `msg-wrapper ${type}`;
  wrapper.dataset.id = id;
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let layoutStructure = `<div class="msg">${text}</div><div class="msg-meta"><span>${time}</span>`;
  
  if (type === "bot") {
    layoutStructure += `
      <div class="bot-feedback-options">
        <button class="feedback-btn like-trigger" onclick="handleExclusiveFeedback(${id}, 'like')" title="Like">
          <svg viewBox="0 0 24 24"><path d="M4 21h1V8H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2zM20 8h-7l1.1-4.4a1.5 1.5 0 0 0-3-1L7 8v13h11.2a2 2 0 0 0 2-1.6l1.7-9A2 2 0 0 0 20 8z"/></svg>
          Like
        </button>
        <button class="feedback-btn dislike-trigger" onclick="handleExclusiveFeedback(${id}, 'dislike')" title="Dislike">
          <svg viewBox="0 0 24 24"><path d="M20 3h-1v13h1a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM4 16h7l-1.1 4.4a1.5 1.5 0 0 0 3 1L17 16V3H5.8a2 2 0 0 0-2 1.6l-1.7 9A2 2 0 0 0 4 16z"/></svg>
          Dislike
        </button>
        <button class="feedback-btn" onclick="copyMessageText(${id}, this, event)" title="Copy Response">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy
        </button>
      </div>`;
  } else if (type === "user") {
    layoutStructure += `
      <button class="user-menu-trigger" onclick="toggleUserDropdown(${id}, event)">•••</button>
      <div class="msg-dropdown-panel" id="dropdown-${id}">
        <div class="msg-dropdown-item" onclick="copyUserMsgText(${id}, event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy
        </div>
        <div class="msg-dropdown-item" onclick="editUserMsgText(${id}, event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          Edit
        </div>
      </div>`;
  }
  
  layoutStructure += `</div>`;
  wrapper.innerHTML = layoutStructure;
  chatBody.appendChild(wrapper);
  
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function showTyping() {
  const typing = document.createElement("div");
  typing.id = "typingIndicator";
  typing.className = "typing";
  typing.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
  chatBody.appendChild(typing);
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  return typing;
}

async function sendMsg() {
  const text = input.value.trim();
  if (!text) return;

  addMsg(text, "user");
  input.value = "";
  input.style.height = "auto";
  sendBtn.disabled = true;

  const typing = showTyping();
  await new Promise(r => setTimeout(r, 1400));
  typing.remove();

  let reply = `Request logged successfully. Processing data according to preset personality matrix: "${currentAgent.personality || 'General Assistance Parameters Specified'}"`;
  
  const lower = text.toLowerCase();
  if (lower.includes("hi") || lower.includes("hello")) {
    reply = `Greetings! Connection established with <b>${currentAgent.name}</b> runtime systems.`;
  } else if (lower.includes("creator") || lower.includes("who made you")) {
    reply = `Identity Parameter: Designed and optimized under development parameters set by <b>${currentAgent.creator}</b>. Profile: "${currentAgent.aboutCreator || 'No record.'}"`;
  }

  addMsg(reply, "bot");
}

function handleExclusiveFeedback(id, selectionType) {
  const contextNode = document.querySelector(`[data-id="${id}"]`);
  if (!contextNode) return;
  
  const likeBtn = contextNode.querySelector('.like-trigger');
  const dislikeBtn = contextNode.querySelector('.dislike-trigger');
  
  if (selectionType === 'like') {
    dislikeBtn.style.display = 'none';
    likeBtn.style.color = 'var(--primary-ai)';
  } else if (selectionType === 'dislike') {
    likeBtn.style.display = 'none';
    dislikeBtn.style.color = 'var(--primary-ai)';
  }
}

function copyMessageText(id, element, event) {
  event.stopPropagation();
  const targetNode = document.querySelector(`[data-id="${id}"] .msg`);
  if (targetNode) {
    navigator.clipboard.writeText(targetNode.textContent || targetNode.innerText);
    const textNode = element.childNodes[2]; 
    if(textNode) textNode.nodeValue = " Copied!";
    setTimeout(() => { if(textNode) textNode.nodeValue = " Copy"; }, 1500);
  }
}

// Global user dropdown control
function toggleUserDropdown(id, event) {
  event.stopPropagation();
  document.querySelectorAll('.msg-dropdown-panel').forEach(p => p.style.display = 'none');
  const targetDropdown = document.getElementById(`dropdown-${id}`);
  if(targetDropdown) targetDropdown.style.display = 'flex';
}

function copyUserMsgText(id, event) {
  event.stopPropagation();
  const targetNode = document.querySelector(`[data-id="${id}"] .msg`);
  if (targetNode) navigator.clipboard.writeText(targetNode.textContent || targetNode.innerText);
  document.getElementById(`dropdown-${id}`).style.display = 'none';
}

function editUserMsgText(id, event) {
  event.stopPropagation();
  const targetNode = document.querySelector(`[data-id="${id}"] .msg`);
  if (targetNode) {
    input.value = targetNode.textContent || targetNode.innerText;
    input.focus();
    input.dispatchEvent(new Event('input'));
  }
  document.getElementById(`dropdown-${id}`).style.display = 'none';
}

function toggleSearch(event) {
  event.stopPropagation();
  searchContainer.style.display = searchContainer.style.display === "block" ? "none" : "block";
  if(searchContainer.style.display === "block") document.getElementById("searchInput").focus();
}

function filterMessages() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const wrappers = chatBody.querySelectorAll(".msg-wrapper");
  wrappers.forEach(w => {
    const text = w.querySelector(".msg").textContent.toLowerCase();
    w.style.display = text.includes(query) ? "flex" : "none";
  });
}

function clearChat() {
  if (confirm("Execute dynamic data wipe over active memory arrays? All logs will vanish.")) {
    chatBody.innerHTML = "";
    const welcomeBanner = document.createElement("div");
    welcomeBanner.className = "chat-welcome-banner";
    welcomeBanner.innerHTML = `<b>Hi, I am ${currentAgent.name}</b>`;
    chatBody.appendChild(welcomeBanner);
  }
}

function togglePanel(event) {
  event.stopPropagation();
  panel.style.display = panel.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", () => {
  panel.style.display = "none";
  document.querySelectorAll('.msg-dropdown-panel').forEach(p => p.style.display = 'none');
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMsg();
  }
});