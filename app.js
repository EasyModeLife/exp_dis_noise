// Word lists
const wordLists = {
    'lista1-3': [
        'Obstante', 'Brújula', 'Guitarra', 'Comida', 'Fábula',
        'Rúbrica', 'Cebolla', 'Crónica', 'Escuela', 'Familia',
        'Vértigo', 'Mochila', 'Cuchara', 'Botella', 'Séquito'
    ],
    'lista2-3': [
        'Palabra', 'Número', 'Mercado', 'Ventana', 'Insignia',
        'Enigma', 'Diluvio', 'Mañana', 'Camisa', 'Plátano',
        'Amigo', 'Trabajo', 'Dinero', 'Zapato', 'Naranja'
    ],
    'lista1-4': [
        'Restaurante', 'Bolígrafo', 'Efímero', 'Importante', 'Mandíbula',
        'Obelisco', 'Monasterio', 'Presidente', 'Carpintero', 'Calendario',
        'Secretaria', 'Periscopio', 'Cucaracha', 'Kilómetro', 'Semáforo'
    ],
    'lista2-4': [
        'Teléfono', 'Bicicleta', 'Simpático', 'Pentagrama', 'Mariposa',
        'Diferente', 'Elefante', 'Termómetro', 'Necesario', 'Chocolate',
        'Catapulta', 'Eucalipto', 'Compañero', 'Televisión', 'Murciélago'
    ],
    'lista1-5': [
        'Especialista', 'Universidad', 'Laboratorio', 'Categórico', 'Caleidoscopio',
        'Felicidades', 'Oportunidad', 'Estacionamiento', 'Computadora', 'Estetoscopio',
        'Melancólico', 'Inverosímil', 'Aristocracia', 'Helicóptero', 'Comunicación'
    ],
    'lista2-5': [
        'Investigación', 'Estrafalario', 'Especulación', 'Inteligente', 'Idiosincrasia',
        'Electricidad', 'Matemáticas', 'Hipopótamo', 'Administración', 'Agradecimiento',
        'Antibiótico', 'Efervescencia', 'Temperatura', 'Necesidades', 'Experiencia'
    ]
};

const noiseLevels = [
    { value: 1.0, label: '100%' },
    { value: 0.841395, label: '84.1395%' },
    { value: 0.707946, label: '70.7946%' }
];

let audioContext;
let whiteNoiseBuffer;
let currentAudioSource = null;
let selectedConfig = null;
let currentWordIndex = 0;
let wordTimes = [];
let timerInterval = null;
let startTime = null;
let accumulatedTime = 0;

// Initialize audio context and create white noise
async function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create white noise buffer (5 seconds should be enough for any word)
        const sampleRate = audioContext.sampleRate;
        const duration = 5;
        const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1; // White noise between -1 and 1
        }
        
        whiteNoiseBuffer = buffer;
    } catch (error) {
        console.error('Error initializing audio:', error);
        alert('Error al inicializar el audio. Asegúrate de que tu navegador soporte Web Audio API.');
    }
}


// Populate audio selection dropdown
function populateAudioSelect() {
    const select = document.getElementById('audio-select');
    
    Object.keys(wordLists).forEach(listKey => {
        const listInfo = listKey.split('-');
        const syllables = listInfo[1];
        const listNum = listInfo[0].replace('lista', 'Lista ');
        
        noiseLevels.forEach((noiseLevel, index) => {
            const option = document.createElement('option');
            option.value = `${listKey}-${index}`;
            option.textContent = `${listNum} (${syllables} sílabas) - Ruido ${noiseLevel.label}`;
            select.appendChild(option);
        });
    });
}

// Start timer
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    startTime = Date.now();
    
    timerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        document.getElementById('current-time').textContent = elapsed.toFixed(2);
    }, 10);
}

// Stop timer and save time
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    if (startTime) {
        const elapsed = (Date.now() - startTime) / 1000;
        accumulatedTime += elapsed;
        wordTimes.push(elapsed);
        
        const word = selectedConfig.words[currentWordIndex];
        displayWordTime(word, elapsed);
        
        startTime = null;
        document.getElementById('current-time').textContent = '0.00';
        document.getElementById('total-time').textContent = accumulatedTime.toFixed(2);
    }
}

// Display word time in the list
function displayWordTime(word, time) {
    const list = document.getElementById('word-times-list');
    const li = document.createElement('li');
    li.innerHTML = `<span class="word-name">${word}</span> <span class="word-time">${time.toFixed(2)}s</span>`;
    list.appendChild(li);
}

// Play current word
async function playCurrentWord() {
    if (currentWordIndex >= selectedConfig.words.length) {
        showFinalResults();
        return;
    }
    
    const word = selectedConfig.words[currentWordIndex];
    
    try {
        // Stop any previous audio
        speechSynthesis.cancel();
        if (currentAudioSource) {
            currentAudioSource.stop();
            currentAudioSource = null;
        }
        
        // Create noise gain node for volume control
        const noiseGainNode = audioContext.createGain();
        noiseGainNode.gain.value = selectedConfig.noiseLevel;
        
        // Create noise source
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = whiteNoiseBuffer;
        noiseSource.loop = true;
        noiseSource.connect(noiseGainNode);
        noiseGainNode.connect(audioContext.destination);
        
        // Create speech synthesis utterance
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'es-ES';
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Start playing noise
        noiseSource.start(0);
        currentAudioSource = noiseSource;
        
        utterance.onend = () => {
            // Stop noise when speech ends
            if (noiseSource && noiseSource.playbackState !== 3) { // 3 = finished
                noiseSource.stop();
            }
            currentAudioSource = null;
            
            // Audio stops automatically, now start the timer
            startTimer();
            document.getElementById('play-button').disabled = true;
            document.getElementById('stop-timer-button').disabled = false;
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            if (noiseSource && noiseSource.playbackState !== 3) {
                noiseSource.stop();
            }
            currentAudioSource = null;
            document.getElementById('play-button').disabled = false;
        };
        
        // Start speech synthesis
        speechSynthesis.speak(utterance);
        
        // Disable play button during playback
        document.getElementById('play-button').disabled = true;
        document.getElementById('stop-timer-button').disabled = false;
        
    } catch (error) {
        console.error('Error playing word:', error);
        alert('Error al reproducir la palabra. Intenta nuevamente.');
        document.getElementById('play-button').disabled = false;
        if (currentAudioSource) {
            currentAudioSource.stop();
            currentAudioSource = null;
        }
    }
}

// Update progress display
function updateProgress() {
    document.getElementById('current-word-number').textContent = currentWordIndex;
    
    if (currentWordIndex >= selectedConfig.words.length) {
        document.getElementById('play-button').disabled = true;
    }
}

// Show final results
function showFinalResults() {
    document.getElementById('experiment-section').style.display = 'none';
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('final-time').textContent = accumulatedTime.toFixed(2);
}

// Reset experiment
function resetExperiment() {
    currentWordIndex = 0;
    wordTimes = [];
    accumulatedTime = 0;
    startTime = null;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    if (currentAudioSource) {
        currentAudioSource.stop();
        currentAudioSource = null;
    }
    
    document.getElementById('word-times-list').innerHTML = '';
    document.getElementById('current-word-number').textContent = '0';
    document.getElementById('total-time').textContent = '0.00';
    document.getElementById('current-time').textContent = '0.00';
    document.getElementById('play-button').disabled = false;
    document.getElementById('stop-timer-button').disabled = true;
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('experiment-section').style.display = 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    populateAudioSelect();
    
    // Initialize audio on first user interaction (browser requirement)
    const initAudioOnInteraction = async () => {
        if (!audioContext) {
            await initAudio();
        }
        document.removeEventListener('click', initAudioOnInteraction);
        document.removeEventListener('touchstart', initAudioOnInteraction);
    };
    
    document.addEventListener('click', initAudioOnInteraction, { once: true });
    document.addEventListener('touchstart', initAudioOnInteraction, { once: true });
    
    const audioSelect = document.getElementById('audio-select');
    const playButton = document.getElementById('play-button');
    const stopTimerButton = document.getElementById('stop-timer-button');
    const resetButton = document.getElementById('reset-button');
    const newExperimentButton = document.getElementById('new-experiment-button');
    
    audioSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        if (value) {
            const [listKey, noiseIndex] = value.split('-');
            const words = wordLists[listKey];
            const noiseLevel = noiseLevels[parseInt(noiseIndex)].value;
            
            selectedConfig = {
                words: words,
                noiseLevel: noiseLevel,
                label: audioSelect.options[audioSelect.selectedIndex].text
            };
            
            resetExperiment();
            document.getElementById('experiment-section').style.display = 'block';
        }
    });
    
    playButton.addEventListener('click', async () => {
        // Ensure audio context is initialized
        if (!audioContext) {
            await initAudio();
        }
        stopTimer(); // Stop previous timer if any
        await playCurrentWord();
    });
    
    stopTimerButton.addEventListener('click', () => {
        stopTimer();
        currentWordIndex++;
        updateProgress();
        
        if (currentWordIndex >= selectedConfig.words.length) {
            document.getElementById('play-button').disabled = true;
            document.getElementById('stop-timer-button').disabled = true;
            showFinalResults();
        } else {
            document.getElementById('play-button').disabled = false;
            document.getElementById('stop-timer-button').disabled = true;
        }
    });
    
    resetButton.addEventListener('click', () => {
        resetExperiment();
    });
    
    newExperimentButton.addEventListener('click', () => {
        resetExperiment();
        audioSelect.value = '';
    });
});

