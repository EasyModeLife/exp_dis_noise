// Experimento de Discriminación Auditiva con Ruido
// Estado de la aplicación
const state = {
    selectedAudio: null,
    currentWord: 0,
    isPlaying: false,
    isTimerRunning: false,
    timerStartTime: null,
    wordTimes: [],
    audioContext: null,
    whiteNoiseSource: null,
    wordAudio: null,
    noiseRatio: 1.0,
    listId: null
};

// Mapeo de listas y niveles de ruido
const noiseRatios = {
    '112.2018': 1.122018,
    '100': 1.0,
    '89.1255': 0.891255,
    '84.1395': 0.841395,
    '79.4328': 0.794328,
    '70.7946': 0.707946
};

// Referencias a elementos del DOM
const elements = {
    audioSelect: document.getElementById('audioSelect'),
    playButton: document.getElementById('playButton'),
    stopButton: document.getElementById('stopButton'),
    resetButton: document.getElementById('resetButton'),
    currentWordDisplay: document.getElementById('currentWord'),
    timerDisplay: document.getElementById('timerDisplay'),
    progressFill: document.getElementById('progressFill'),
    wordTimes: document.getElementById('wordTimes'),
    totalTime: document.getElementById('totalTime'),
    totalTimeValue: document.getElementById('totalTimeValue')
};

// Inicializar Web Audio API
function initAudioContext() {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Generar ruido blanco
function createWhiteNoise(duration = 10) {
    initAudioContext();
    
    const bufferSize = state.audioContext.sampleRate * duration;
    const buffer = state.audioContext.createBuffer(1, bufferSize, state.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    // Generar ruido blanco aleatorio
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
}

// Reproducir ruido blanco
function playWhiteNoise(volume = 1.0) {
    if (state.whiteNoiseSource) {
        state.whiteNoiseSource.stop();
    }
    
    initAudioContext();
    
    const noiseBuffer = createWhiteNoise(10);
    state.whiteNoiseSource = state.audioContext.createBufferSource();
    state.whiteNoiseSource.buffer = noiseBuffer;
    state.whiteNoiseSource.loop = true;
    
    const gainNode = state.audioContext.createGain();
    gainNode.gain.value = volume * state.noiseRatio;
    
    state.whiteNoiseSource.connect(gainNode);
    gainNode.connect(state.audioContext.destination);
    
    state.whiteNoiseSource.start(0);
}

// Detener ruido blanco
function stopWhiteNoise() {
    if (state.whiteNoiseSource) {
        try {
            state.whiteNoiseSource.stop();
        } catch (e) {
            // Ya estaba detenido
        }
        state.whiteNoiseSource = null;
    }
}

// Reproducir audio de palabra
function playWordAudio() {
    if (!state.listId || state.currentWord >= 15) {
        return;
    }
    
    const wordNumber = String(state.currentWord + 1).padStart(2, '0');
    const audioPath = `public/audio/words/${state.listId}/palabra${wordNumber}.mp3`;
    
    state.wordAudio = new Audio(audioPath);
    
    state.wordAudio.addEventListener('loadedmetadata', () => {
        // Iniciar reproducción
        state.wordAudio.play().catch(error => {
            console.error('Error al reproducir audio:', error);
            // Si falla la carga del audio, continuar con sonido de prueba
            alert('No se pudo cargar el audio. Asegúrate de que los archivos de audio estén en la carpeta correcta.');
        });
        
        // Reproducir ruido blanco simultáneamente
        playWhiteNoise(0.5); // Volumen base del ruido
        
        // Iniciar temporizador inmediatamente
        startTimer();
    });
    
    state.wordAudio.addEventListener('ended', () => {
        // El audio terminó pero el temporizador sigue corriendo
        // El usuario debe detenerlo manualmente
    });
    
    state.wordAudio.addEventListener('error', (e) => {
        console.warn('Audio no encontrado, usando modo de prueba');
        // En modo de prueba, simular reproducción de 2 segundos
        playWhiteNoise(0.5);
        startTimer();
        
        setTimeout(() => {
            // Audio simulado termina pero temporizador sigue
        }, 2000);
    });
}

// Detener audio de palabra
function stopWordAudio() {
    if (state.wordAudio) {
        state.wordAudio.pause();
        state.wordAudio.currentTime = 0;
        state.wordAudio = null;
    }
    stopWhiteNoise();
}

// Iniciar temporizador
function startTimer() {
    state.timerStartTime = performance.now();
    state.isTimerRunning = true;
    updateTimerDisplay();
}

// Detener temporizador
function stopTimer() {
    if (!state.isTimerRunning) {
        return;
    }
    
    const elapsedTime = (performance.now() - state.timerStartTime) / 1000;
    state.isTimerRunning = false;
    
    // Almacenar tiempo
    state.wordTimes.push({
        word: state.currentWord + 1,
        time: elapsedTime
    });
    
    // Actualizar UI
    updateWordTimesDisplay();
    
    // Avanzar a siguiente palabra
    state.currentWord++;
    updateProgress();
    
    // Verificar si terminó el experimento
    if (state.currentWord >= 15) {
        finishExperiment();
    } else {
        // Habilitar botón de reproducir para siguiente palabra
        elements.playButton.disabled = false;
        elements.stopButton.disabled = true;
    }
}

// Actualizar display del temporizador
function updateTimerDisplay() {
    if (state.isTimerRunning) {
        const elapsed = (performance.now() - state.timerStartTime) / 1000;
        elements.timerDisplay.textContent = elapsed.toFixed(3);
        requestAnimationFrame(updateTimerDisplay);
    }
}

// Actualizar progreso
function updateProgress() {
    elements.currentWordDisplay.textContent = state.currentWord;
    const progress = (state.currentWord / 15) * 100;
    elements.progressFill.style.width = `${progress}%`;
}

// Actualizar display de tiempos de palabras
function updateWordTimesDisplay() {
    if (state.wordTimes.length === 0) {
        return;
    }
    
    if (state.wordTimes.length === 1) {
        // Remover mensaje de "no data"
        elements.wordTimes.innerHTML = '';
    }
    
    const lastTime = state.wordTimes[state.wordTimes.length - 1];
    const timeItem = document.createElement('div');
    timeItem.className = 'word-time-item';
    timeItem.innerHTML = `
        <span class="word-number">Palabra ${lastTime.word}</span>
        <span class="word-time">${lastTime.time.toFixed(3)} s</span>
    `;
    elements.wordTimes.appendChild(timeItem);
    
    // Scroll al final
    elements.wordTimes.scrollTop = elements.wordTimes.scrollHeight;
}

// Finalizar experimento
function finishExperiment() {
    const totalTime = state.wordTimes.reduce((sum, item) => sum + item.time, 0);
    elements.totalTimeValue.textContent = totalTime.toFixed(3);
    elements.totalTime.style.display = 'block';
    
    elements.playButton.disabled = true;
    elements.stopButton.disabled = true;
}

// Reiniciar experimento
function resetExperiment() {
    // Detener audio actual
    stopWordAudio();
    
    // Reiniciar estado
    state.currentWord = 0;
    state.isPlaying = false;
    state.isTimerRunning = false;
    state.timerStartTime = null;
    state.wordTimes = [];
    
    // Reiniciar UI
    elements.currentWordDisplay.textContent = '0';
    elements.timerDisplay.textContent = '0.000';
    elements.progressFill.style.width = '0%';
    elements.wordTimes.innerHTML = '<p class="no-data">Los tiempos aparecerán aquí después de cada palabra</p>';
    elements.totalTime.style.display = 'none';
    
    // Habilitar botón de reproducir si hay audio seleccionado
    if (state.selectedAudio) {
        elements.playButton.disabled = false;
    }
    elements.stopButton.disabled = true;
}

// Event Listeners
elements.audioSelect.addEventListener('change', (e) => {
    const value = e.target.value;
    if (!value) {
        state.selectedAudio = null;
        state.listId = null;
        elements.playButton.disabled = true;
        return;
    }
    
    // Parsear selección: lista1-3sil-112.2018
    const parts = value.split('-');
    const listName = parts[0]; // lista1 o lista2
    const syllables = parts[1]; // 3sil, 4sil, 5sil
    const noiseLevel = parts[2]; // 112.2018, 100, etc.
    
    state.selectedAudio = value;
    state.listId = `${listName}-${syllables}`;
    state.noiseRatio = noiseRatios[noiseLevel];
    
    // Reiniciar experimento con nueva selección
    resetExperiment();
});

elements.playButton.addEventListener('click', () => {
    if (!state.selectedAudio || state.currentWord >= 15) {
        return;
    }
    
    state.isPlaying = true;
    elements.playButton.disabled = true;
    elements.stopButton.disabled = false;
    
    playWordAudio();
});

elements.stopButton.addEventListener('click', () => {
    if (!state.isPlaying && !state.isTimerRunning) {
        return;
    }
    
    state.isPlaying = false;
    stopWordAudio();
    stopTimer();
});

elements.resetButton.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres reiniciar el experimento? Se perderán todos los datos.')) {
        resetExperiment();
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicación de Discriminación Auditiva iniciada');
    updateProgress();
});

