function renderAssistant(c) {
  const appLanguage = () => localStorage.language === 'ta' ? 'ta' : 'en';
  const text = (en, ta) => appLanguage() === 'ta' ? ta : en;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let listening = false;
  let lastAnswer = '';
  let lastSpokenLanguage = 'en';

  c.innerHTML = `<section class="panel"><h3>${text('Real-time AI farming assistant', 'நிகழ்நேர AI விவசாய உதவியாளர்')}</h3>
    <p>${text('Ask about soil, crops, irrigation, weather, pests, leaf symptoms, yield, or fertilizer. Answers are decision support, not a diagnosis or prescription.',
      'மண், பயிர்கள், நீர்ப்பாசனம், வானிலை, பூச்சிகள், இலை அறிகுறிகள், மகசூல் அல்லது உரம் பற்றி கேளுங்கள். பதில்கள் வழிகாட்டல் மட்டுமே; நோயறிதல் அல்லது மருந்து பரிந்துரை அல்ல.')}</p>
    <div class="voice-assistant"><strong>${text('Voice assistant', 'குரல் உதவியாளர்')}</strong>
      <span>${text('Voice language is independent of application language.', 'குரல் மொழி பயன்பாட்டு மொழியிலிருந்து தனித்தது.')}</span>
      <label>${text('Voice language', 'குரல் மொழி')}<select id="voice-language">
        <option value="auto">${text('Auto (best effort)', 'தானியங்கி (முயற்சி)')}</option>
        <option value="ta">${text('Tamil voice', 'தமிழ் குரல்')}</option>
        <option value="en">${text('English voice', 'ஆங்கில குரல்')}</option>
      </select></label>
      <button id="voice-input" type="button">${text('Start listening', 'கேட்கத் தொடங்கு')}</button>
      <small id="voice-status" aria-live="polite"></small>
    </div>
    <div class="quick-questions">
      <button type="button" data-question="${text('When should I irrigate my field?', 'எனது வயலுக்கு எப்போது நீர்ப்பாசனம் செய்ய வேண்டும்?')}">${text('Irrigation', 'நீர்ப்பாசனம்')}</button>
      <button type="button" data-question="${text('Why are my crop leaves turning yellow?', 'எனது பயிரின் இலைகள் ஏன் மஞ்சள் நிறமாகின்றன?')}">${text('Leaf symptoms', 'இலை அறிகுறிகள்')}</button>
      <button type="button" data-question="${text('What fertilizer does my soil need?', 'எனது மண்ணுக்கு எந்த உரம் தேவை?')}">${text('Soil and fertilizer', 'மண் மற்றும் உரம்')}</button>
    </div>
    <div id="chat" class="chat"><div class="bubble bot">${text('Ask your farming question in English or Tamil. Include the crop, age, soil moisture, rainfall, or symptoms.',
      'உங்கள் விவசாயக் கேள்வியை தமிழ் அல்லது ஆங்கிலத்தில் கேளுங்கள். பயிர், வயது, மண் ஈரப்பதம், மழை அல்லது அறிகுறிகளைச் சேர்க்கவும்.')}</div></div>
    <form id="chat-form" class="chat-form"><input name="question" placeholder="${text('Type your farming question here...', 'உங்கள் விவசாயக் கேள்வியை இங்கே எழுதுங்கள்...')}" required>
      <button>${text('Ask', 'கேள்')}</button></form></section>`;

  const voiceButton = $('#voice-input');
  const status = $('#voice-status');
  const input = $('#chat-form input');
  const voiceLanguage = $('#voice-language');
  const setStatus = message => { status.textContent = message; };
  const stopRecognition = () => {
    if (recognition && listening) recognition.stop();
    listening = false;
    voiceButton.textContent = text('Start listening', 'கேட்கத் தொடங்கு');
  };

  const availableVoice = language => {
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    const prefix = language === 'ta' ? 'ta' : 'en';
    return voices.find(voice => voice.lang.toLowerCase().startsWith(prefix)) || null;
  };
  const speak = (answer, language) => {
    if (!window.speechSynthesis || !answer) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    const voice = availableVoice(language);
    if (voice) utterance.voice = voice;
    else setStatus(text('No matching voice is installed; using the browser default.', 'பொருத்தமான குரல் இல்லை; உலாவியின் இயல்புநிலை குரல் பயன்படுத்தப்படுகிறது.'));
    window.speechSynthesis.speak(utterance);
  };
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();

  if (!Recognition) {
    voiceButton.disabled = true;
    setStatus(text('Voice input is not supported in this browser. Use text input instead.', 'இந்த உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. உரை உள்ளீட்டைப் பயன்படுத்தவும்.'));
  }
  voiceButton.onclick = async () => {
    if (!Recognition) return;
    if (listening) { stopRecognition(); return; }
    if (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(location.hostname)) {
      setStatus(text('Microphone requires HTTPS or localhost.', 'ஒலிவாங்கிக்கு HTTPS அல்லது localhost தேவை.')); return;
    }
    recognition = new Recognition();
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.lang = voiceLanguage.value === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.onstart = () => { listening = true; voiceButton.textContent = text('Stop listening', 'கேட்பதை நிறுத்து'); setStatus(text('Listening...', 'கேட்கிறது...')); };
    recognition.onresult = event => {
      input.value = event.results[0][0].transcript;
      lastSpokenLanguage = /[\u0B80-\u0BFF]/.test(input.value) ? 'ta' : (voiceLanguage.value === 'ta' ? 'ta' : 'en');
      setStatus(text('Voice captured. Press Ask.', 'குரல் பெறப்பட்டது. கேள் என்பதை அழுத்தவும்.'));
    };
    recognition.onerror = event => {
      const errors = { 'not-allowed': 'Microphone permission was denied.', 'audio-capture': 'No microphone was found.', 'no-speech': 'No speech was detected.', network: 'Speech recognition needs a network connection.' };
      setStatus(text(errors[event.error] || `Voice input error: ${event.error}`, 'குரல் உள்ளீட்டில் பிழை ஏற்பட்டது.'));
    };
    recognition.onend = stopRecognition;
    try { recognition.start(); } catch (error) { setStatus(text(`Could not start voice input: ${error.message}`, 'குரல் உள்ளீட்டைத் தொடங்க முடியவில்லை.')); stopRecognition(); }
  };

  c.querySelectorAll('.quick-questions button').forEach(button => button.onclick = () => { input.value = button.dataset.question; input.focus(); });
  $('#chat-form').onsubmit = async event => {
    event.preventDefault();
    const question = new FormData(event.target).get('question');
    if (!question) return;
    stopRecognition();
    $('#chat').insertAdjacentHTML('beforeend', `<div class="bubble me">${esc(question)}</div>`);
    const submit = event.target.querySelector('button');
    submit.disabled = true;
    event.target.reset();
    try {
      const point = await browserLocation();
      const selectedVoiceLanguage = voiceLanguage.value === 'auto' ? lastSpokenLanguage : voiceLanguage.value;
      const response = await api('/assistant/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, response_language: appLanguage(), voice_language: selectedVoiceLanguage, ...(point || {}) }) });
      lastAnswer = String(response.answer || '');
      lastSpokenLanguage = response.voice_language || selectedVoiceLanguage;
      $('#chat').insertAdjacentHTML('beforeend', `<div class="bubble bot">${esc(lastAnswer)}<br>
        <button type="button" class="speak-answer">${text('Speak', 'பேசு')}</button>
        <button type="button" class="stop-answer">${text('Stop', 'நிறுத்து')}</button>
        <button type="button" class="replay-answer">${text('Replay', 'மீண்டும் பேசு')}</button>
        <small>${esc((response.sources || []).join(', '))}</small></div>`);
      const bubble = $('#chat').lastElementChild;
      const spokenAnswer = String(response.voice_answer || lastAnswer);
      bubble.querySelector('.speak-answer').onclick = () => speak(spokenAnswer, lastSpokenLanguage);
      bubble.querySelector('.stop-answer').onclick = () => window.speechSynthesis?.cancel();
      bubble.querySelector('.replay-answer').onclick = () => speak(spokenAnswer, lastSpokenLanguage);
    } catch (error) {
      $('#chat').insertAdjacentHTML('beforeend', `<div class="bubble bot error">${esc(error.message || text('Request failed.', 'கோரிக்கை தோல்வியடைந்தது.'))}</div>`);
    } finally { submit.disabled = false; $('#chat').scrollTop = $('#chat').scrollHeight; }
  };
  document.addEventListener('change', event => {
    if (event.target.id !== 'language' || listening) return;
    c.querySelector('h3').textContent = text('Real-time AI farming assistant', 'நிகழ்நேர AI விவசாய உதவியாளர்');
    c.querySelector('.panel > p').textContent = text(
      'Ask about soil, crops, irrigation, weather, pests, leaf symptoms, yield, or fertilizer. Answers are decision support, not a diagnosis or prescription.',
      'மண், பயிர்கள், நீர்ப்பாசனம், வானிலை, பூச்சிகள், இலை அறிகுறிகள், மகசூல் அல்லது உரம் பற்றி கேளுங்கள். பதில்கள் வழிகாட்டல் மட்டுமே; நோயறிதல் அல்லது மருந்து பரிந்துரை அல்ல.',
    );
    c.querySelector('.voice-assistant span').textContent = text(
      'Voice language is independent of application language.',
      'குரல் மொழி பயன்பாட்டு மொழியிலிருந்து தனித்தது.',
    );
    c.querySelector('.quick-questions button:nth-child(1)').textContent = text('Irrigation', 'நீர்ப்பாசனம்');
    c.querySelector('.quick-questions button:nth-child(2)').textContent = text('Leaf symptoms', 'இலை அறிகுறிகள்');
    c.querySelector('.quick-questions button:nth-child(3)').textContent = text('Soil and fertilizer', 'மண் மற்றும் உரம்');
    c.querySelector('.chat > .bubble:first-child').textContent = text(
      'Ask your farming question in English or Tamil. Include the crop, age, soil moisture, rainfall, or symptoms.',
      'உங்கள் விவசாயக் கேள்வியை தமிழ் அல்லது ஆங்கிலத்தில் கேளுங்கள். பயிர், வயது, மண் ஈரப்பதம், மழை அல்லது அறிகுறிகளைச் சேர்க்கவும்.',
    );
    voiceButton.textContent = text('Start listening', 'கேட்கத் தொடங்கு');
    input.placeholder = text('Type your farming question here...', 'உங்கள் விவசாயக் கேள்வியை இங்கே எழுதுங்கள்...');
  });
}
