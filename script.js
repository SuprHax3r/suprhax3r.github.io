const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const messages = document.getElementById('messages');

const userResponses = [
    'Great idea!',
    'Vote for StrmPunch!',
    'Thanks for checking out StrmPunch!',
    '👊 Punching into live entertainment!'
];

const automatedMessages = [
    { user: 'EDP445', text: 'Where\'s the cupcakes?' },
    { user: 'Taneesha', text: '94%? So close!' },
    { user: 'Gabb', text: 'Shut up @Taneesha, larpfest' },
    { user: 'Winzarr', text: '👊 Let\'s go!' },
    { user: 'RedRasberry', text: 'More streams like this please' },
    { user: 'Chud', text: 'Way better than Kick and twitch!' },
    { user: '67MangoMonster', text: 'This chat is so closely monitored and safe for minors!' },
    { user: 'BusinessIsTrash', text: 'Can\'t wait to get outta Business!' },
    { user: 'RandomStray', text: 'Absolute Cinema.' },
    { user: 'Wpopuff', text: 'You ####### suck at geometry dash lolz' }
];

function appendMessage(author, text) {
    const msg = document.createElement('div');
    msg.className = 'msg';
    msg.innerHTML = `<strong>${author}:</strong> ${text}`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
    const messageText = chatInput.value.trim();
    if (!messageText) return;

    appendMessage('You', messageText);
    chatInput.value = '';
    chatInput.focus();

    setTimeout(() => {
        appendMessage('Streamer', userResponses[Math.floor(Math.random() * userResponses.length)]);
    }, 700);
}

let lastAutomatedIndex = -1;

function getRandomAutomatedIndex() {
    if (automatedMessages.length === 0) return -1;
    let index = Math.floor(Math.random() * automatedMessages.length);
    if (automatedMessages.length === 1) return index;
    while (index === lastAutomatedIndex) {
        index = Math.floor(Math.random() * automatedMessages.length);
    }
    lastAutomatedIndex = index;
    return index;
}

function sendAutomatedMessage() {
    const index = getRandomAutomatedIndex();
    if (index === -1) return;
    const message = automatedMessages[index];
    appendMessage(message.user, message.text);
}

function startAutomatedChat() {
    setInterval(() => {
        const randomDelay = Math.random() * 1000 + 1000;
        setTimeout(sendAutomatedMessage, randomDelay);
    }, 2200);
}

sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

startAutomatedChat();

// Ensure the local video keeps playing (some browsers pause autoplay intermittently)
const streamVideo = document.getElementById('streamVideo');
if (streamVideo) {
    const playOverlay = document.getElementById('playOverlay');
    const videoErrorEl = document.getElementById('videoError');

    const tryPlay = async () => {
        try {
            await streamVideo.play();
            if (playOverlay) playOverlay.hidden = true;
            if (videoErrorEl) videoErrorEl.hidden = true;
            return true;
        } catch (err) {
            if (playOverlay) playOverlay.hidden = false;
            return false;
        }
    };

    // initial attempt
    tryPlay();

    // overlay click: user gesture to start playback and allow audio
    if (playOverlay) {
        playOverlay.addEventListener('click', async () => {
            try {
                streamVideo.muted = false; // allow audio after user gesture
                const ok = await tryPlay();
                if (!ok && videoErrorEl) {
                    videoErrorEl.hidden = false;
                    videoErrorEl.textContent = 'Playback failed — try reloading the page or serve files over HTTP.';
                }
            } catch (e) {
                if (videoErrorEl) {
                    videoErrorEl.hidden = false;
                    videoErrorEl.textContent = 'Playback error. See console for details.';
                }
            }
        });
    }

    // show/hide overlay on playing
    streamVideo.addEventListener('playing', () => {
        if (playOverlay) playOverlay.hidden = true;
        if (videoErrorEl) videoErrorEl.hidden = true;
    });

    // show error details if the video fails to load/play
    streamVideo.addEventListener('error', () => {
        if (!videoErrorEl) return;
        const code = streamVideo.error && streamVideo.error.code ? streamVideo.error.code : 0;
        let msg = 'Unknown video error.';
        if (code === 1) msg = 'Aborted.';
        else if (code === 2) msg = 'Network error (file missing or CORS).';
        else if (code === 3) msg = 'Decoding error (unsupported codec).';
        else if (code === 4) msg = 'Source not supported.';
        videoErrorEl.textContent = `Video error (${code}): ${msg}`;
        videoErrorEl.hidden = false;
        if (playOverlay) playOverlay.hidden = false;
        console.error('Video element error', streamVideo.error);
    });

    // retry when tab becomes visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) tryPlay();
    });

    // periodic check: if paused, attempt to resume (still keep overlay visible if play fails)
    setInterval(() => {
        if (document.visibilityState === 'visible' && streamVideo.paused) {
            tryPlay();
        }
    }, 1000);
}
