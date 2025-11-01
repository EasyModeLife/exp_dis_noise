// Experimento de Discriminación Auditiva con Ruido
// Estado de la aplicación
const state = {
    listId: null,
    noiseLevel: null,
    participantName: '',
    experimentDate: null,
    currentWord: 0,
    isPlaying: false,
    isTimerRunning: false,
    timerStartTime: null,
    elapsedTime: 0,  // Tiempo acumulado cuando se pausa
    wordTimes: [],
    audioContext: null,
    whiteNoiseSource: null,
    wordAudio: null,
    noiseRatio: 1.0,
    isFullscreen: false,
    waitingForResponse: false  // Indica si estamos esperando respuesta (correcto/incorrecto)
};

// Definición de palabras por lista
const wordLists = {
    'lista1-3sil': [
        'Obstante', 'Brújula', 'Guitarra', 'Comida', 'Fábula',
        'Rúbrica', 'Cebolla', 'Crónica', 'Escuela', 'Familia',
        'Vértigo', 'Mochila', 'Cuchara', 'Botella', 'Séquito'
    ],
    'lista2-3sil': [
        'Palabra', 'Número', 'Mercado', 'Ventana', 'Insignia',
        'Enigma', 'Diluvio', 'Mañana', 'Camisa', 'Plátano',
        'Amigo', 'Trabajo', 'Dinero', 'Zapato', 'Naranja'
    ],
    'lista1-4sil': [
        'Restaurante', 'Bolígrafo', 'Efímero', 'Importante', 'Mandíbula',
        'Obelisco', 'Monasterio', 'Presidente', 'Carpintero', 'Calendario',
        'Secretaria', 'Periscopio', 'Cucaracha', 'Kilómetro', 'Semáforo'
    ],
    'lista2-4sil': [
        'Teléfono', 'Bicicleta', 'Simpático', 'Pentagrama', 'Mariposa',
        'Diferente', 'Elefante', 'Termómetro', 'Necesario', 'Chocolate',
        'Catapulta', 'Eucalipto', 'Compañero', 'Televisión', 'Murciélago'
    ],
    'lista1-5sil': [
        'Especialista', 'Universidad', 'Laboratorio', 'Categórico', 'Caleidoscopio',
        'Felicidades', 'Oportunidad', 'Estacionamiento', 'Computadora', 'Estetoscopio',
        'Melancólico', 'Inverosímil', 'Aristocracia', 'Helicóptero', 'Comunicación'
    ],
    'lista2-5sil': [
        'Investigación', 'Estrafalario', 'Especulación', 'Inteligente', 'Idiosincrasia',
        'Electricidad', 'Matemáticas', 'Hipopótamo', 'Administración', 'Agradecimiento',
        'Antibiótico', 'Efervescencia', 'Temperatura', 'Necesidades', 'Experiencia'
    ]
};

// Mapeo de niveles de ruido predefinidos (valor del select -> ratio de volumen)
const noiseRatios = {
    '0': 0,              // Sin ruido
    '33.33': 0.3333,     // Muy bajo
    '70.7946': 0.707946,
    '79.4328': 0.794328,
    '84.1395': 0.841395,
    '89.1255': 0.891255,
    '100': 1.0,
    '112.2018': 1.122018
};

// Obtener el ratio de ruido (soporta valores personalizados)
function getNoiseRatio(noiseLevel) {
    if (noiseRatios.hasOwnProperty(noiseLevel)) {
        return noiseRatios[noiseLevel];
    }
    // Si es un valor personalizado, convertir porcentaje a ratio
    const customValue = parseFloat(noiseLevel);
    if (!isNaN(customValue) && customValue >= 0) {
        return customValue / 100.0;
    }
    return 0;
}

// Referencias a elementos del DOM
const elements = {
    // Selectores principales
    participantNameInput: document.getElementById('participantName'),
    listSelect: document.getElementById('listSelect'),
    noiseSelect: document.getElementById('noiseSelect'),
    customNoiseGroup: document.getElementById('customNoiseGroup'),
    customNoiseInput: document.getElementById('customNoiseInput'),
    startExperimentBtn: document.getElementById('startExperimentBtn'),
    
    // Interfaz principal
    currentWordDisplay: document.getElementById('currentWord'),
    timerDisplay: document.getElementById('timerDisplay'),
    progressFill: document.getElementById('progressFill'),
    wordTimes: document.getElementById('wordTimes'),
    totalTime: document.getElementById('totalTime'),
    totalTimeValue: document.getElementById('totalTimeValue'),
    resetButton: document.getElementById('resetButton'),
    copyResultsBtn: document.getElementById('copyResultsBtn'),
    mainContainer: document.getElementById('mainContainer'),
    
    // Modo pantalla completa
    fullscreenMode: document.getElementById('fullscreenMode'),
    exitFullscreenBtn: document.getElementById('exitFullscreenBtn'),
    fullscreenCurrentWord: document.getElementById('fullscreenCurrentWord'),
    fullscreenTimer: document.getElementById('fullscreenTimer'),
    fullscreenWordNumber: document.getElementById('fullscreenWordNumber'),
    fullscreenProgressFill: document.getElementById('fullscreenProgressFill'),
    fullscreenPlayPauseBtn: document.getElementById('fullscreenPlayPauseBtn'),
    fullscreenNextBtn: document.getElementById('fullscreenNextBtn'),
    fullscreenPlayIcon: document.getElementById('fullscreenPlayIcon'),
    fullscreenPauseIcon: document.getElementById('fullscreenPauseIcon'),
    fullscreenPlayPauseText: document.getElementById('fullscreenPlayPauseText'),
    fullscreenResponseButtons: document.getElementById('fullscreenResponseButtons'),
    fullscreenCorrectBtn: document.getElementById('fullscreenCorrectBtn'),
    fullscreenIncorrectBtn: document.getElementById('fullscreenIncorrectBtn')
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
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
}

// Reproducir ruido blanco
function playWhiteNoise(volume = 1.0) {
    if (state.noiseRatio === 0) {
        // No reproducir ruido si el nivel es 0%
        return;
    }
    
    if (state.whiteNoiseSource) {
        state.whiteNoiseSource.stop();
    }
    
    initAudioContext();
    
    const noiseBuffer = createWhiteNoise(15);
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

// Obtener nombre de archivo de audio
function getAudioFilename() {
    const words = wordLists[state.listId];
    const word = words[state.currentWord];
    return `public/audio/words/${state.listId}/${word}.mp3`;
}

// Reproducir audio de palabra
function playWordAudio() {
    if (!state.listId || state.currentWord >= 15) {
        return;
    }
    
    const audioPath = getAudioFilename();
    state.wordAudio = new Audio(audioPath);
    
    state.wordAudio.addEventListener('loadedmetadata', () => {
        state.wordAudio.play().catch(error => {
            console.error('Error al reproducir audio:', error);
            alert('No se pudo cargar el audio. Verifica que los archivos estén disponibles.');
        });
        
        // Reproducir ruido blanco simultáneamente (si no es 0%)
        if (state.noiseRatio > 0) {
            playWhiteNoise(0.5);
        }
        
        // Iniciar temporizador inmediatamente
        state.elapsedTime = 0; // Resetear tiempo acumulado
        state.waitingForResponse = false;
        startTimer();
        
        // Actualizar UI del botón
        updatePlayPauseButton(true);
    });
    
    state.wordAudio.addEventListener('ended', () => {
        // El audio terminó, pausar timer y mostrar botones de respuesta
        stopWordAudio();
        pauseTimer();
        updatePlayPauseButton(false);
        
        // Mostrar botones de respuesta
        if (state.isFullscreen) {
            elements.fullscreenPlayPauseBtn.style.display = 'none';
            elements.fullscreenResponseButtons.style.display = 'flex';
            state.waitingForResponse = true;
        }
        
        // Actualizar display del timer con el tiempo pausado
        updateTimerDisplay();
    });
    
    state.wordAudio.addEventListener('error', (e) => {
        console.warn('Audio no encontrado:', audioPath);
        alert(`No se encontró el archivo de audio: ${audioPath}`);
        updatePlayPauseButton(false);
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
    state.elapsedTime = 0; // Resetear tiempo acumulado
    state.isTimerRunning = true;
    state.waitingForResponse = false;
    updateTimerDisplay();
}

// Pausar temporizador (cuando se detiene el audio)
function pauseTimer() {
    if (state.isTimerRunning && state.timerStartTime) {
        state.elapsedTime = (performance.now() - state.timerStartTime) / 1000;
        state.isTimerRunning = false;
    }
}

// Guardar tiempo y avanzar (cuando se presiona correcto/incorrecto)
function saveTimerResult(isCorrect) {
    // Calcular tiempo final (usar tiempo acumulado si existe, sino calcular desde inicio)
    let finalTime = 0;
    
    if (state.isTimerRunning && state.timerStartTime) {
        // Si el timer aún está corriendo, calcular tiempo total
        finalTime = (performance.now() - state.timerStartTime) / 1000;
        state.isTimerRunning = false;
    } else if (state.elapsedTime > 0) {
        // Usar el tiempo que se guardó al pausar
        finalTime = state.elapsedTime;
    } else if (state.timerStartTime) {
        // Fallback: calcular desde el inicio si hay tiempo de inicio
        finalTime = (performance.now() - state.timerStartTime) / 1000;
    }
    
    // Resetear estado del timer
    state.elapsedTime = 0;
    state.timerStartTime = null;
    state.waitingForResponse = false;
    
    // Almacenar tiempo con nombre de palabra y si fue correcta
    const words = wordLists[state.listId];
    const wordName = words[state.currentWord];
    
    state.wordTimes.push({
        word: state.currentWord + 1,
        wordName: wordName,
        time: finalTime,
        correct: isCorrect  // true, false, o null si no aplica
    });
    
    // Actualizar UI
    updateWordTimesDisplay();
    updateTimerDisplay(); // Resetear display a 0.000
    
    // Avanzar a siguiente palabra automáticamente
    state.currentWord++;
    updateProgress();
    
    if (state.currentWord >= 15) {
        finishExperiment();
    } else {
        // Preparar para siguiente palabra
        updatePlayPauseButton(false);
        if (state.isFullscreen) {
            elements.fullscreenResponseButtons.style.display = 'none';
            elements.fullscreenPlayPauseBtn.style.display = 'flex';
        }
    }
    
    return finalTime;
}

// Actualizar display del temporizador
function updateTimerDisplay() {
    let timeStr = '0.000';
    
    if (state.isTimerRunning && state.timerStartTime) {
        // Timer corriendo: mostrar tiempo en tiempo real
        const elapsed = (performance.now() - state.timerStartTime) / 1000;
        timeStr = elapsed.toFixed(3);
        requestAnimationFrame(updateTimerDisplay);
    } else if (state.elapsedTime > 0 && !state.isTimerRunning) {
        // Timer pausado: mostrar tiempo pausado
        timeStr = state.elapsedTime.toFixed(3);
    }
    
    elements.timerDisplay.textContent = timeStr;
    if (state.isFullscreen) {
        elements.fullscreenTimer.textContent = timeStr;
    }
}

// Actualizar progreso
function updateProgress() {
    const progress = (state.currentWord / 15) * 100;
    
    elements.currentWordDisplay.textContent = state.currentWord;
    elements.progressFill.style.width = `${progress}%`;
    
    if (state.isFullscreen) {
        elements.fullscreenCurrentWord.textContent = state.currentWord;
        elements.fullscreenWordNumber.textContent = state.currentWord > 0 ? state.currentWord : '—';
        elements.fullscreenProgressFill.style.width = `${progress}%`;
    }
}

// Actualizar display de tiempos de palabras
function updateWordTimesDisplay() {
    if (state.wordTimes.length === 0) {
        return;
    }
    
    if (state.wordTimes.length === 1) {
        elements.wordTimes.innerHTML = '';
    }
    
    const lastTime = state.wordTimes[state.wordTimes.length - 1];
    const timeItem = document.createElement('div');
    timeItem.className = 'word-time-item';
    
    // Determinar ícono de correcto/incorrecto
    let correctIcon = '';
    if (lastTime.correct === true) {
        correctIcon = '<span class="correct-icon" title="Correcto">✓</span>';
    } else if (lastTime.correct === false) {
        correctIcon = '<span class="incorrect-icon" title="Incorrecto">✗</span>';
    }
    
    timeItem.innerHTML = `
        <span class="word-number">${lastTime.word}. ${lastTime.wordName} ${correctIcon}</span>
        <span class="word-time">${lastTime.time.toFixed(3)} s</span>
    `;
    elements.wordTimes.appendChild(timeItem);
    
    // Scroll al final
    elements.wordTimes.scrollTop = elements.wordTimes.scrollHeight;
    
    // Mostrar botón de copiar
    if (elements.copyResultsBtn) {
        elements.copyResultsBtn.style.display = 'inline-flex';
    }
}

// Finalizar experimento
function finishExperiment() {
    const totalTime = state.wordTimes.reduce((sum, item) => sum + item.time, 0);
    elements.totalTimeValue.textContent = totalTime.toFixed(3);
    elements.totalTime.style.display = 'block';
    
    // Salir del modo pantalla completa
    if (state.isFullscreen) {
        exitFullscreen();
    }
}

// Reiniciar experimento
function resetExperiment() {
    stopWordAudio();
    pauseTimer(); // Asegurar que el timer esté detenido
    
    state.currentWord = 0;
    state.isPlaying = false;
    state.isTimerRunning = false;
    state.timerStartTime = null;
    state.elapsedTime = 0;
    state.wordTimes = [];
    state.waitingForResponse = false;
    // No resetear participantName ni experimentDate al reiniciar el experimento
    
    elements.currentWordDisplay.textContent = '0';
    elements.timerDisplay.textContent = '0.000';
    elements.progressFill.style.width = '0%';
    elements.wordTimes.innerHTML = '<p class="no-data">Los tiempos aparecerán aquí después de cada palabra</p>';
    elements.totalTime.style.display = 'none';
    elements.copyResultsBtn.style.display = 'none';
    
    if (state.isFullscreen) {
        elements.fullscreenTimer.textContent = '0.000';
        elements.fullscreenCurrentWord.textContent = '0';
        elements.fullscreenWordNumber.textContent = '—';
        elements.fullscreenProgressFill.style.width = '0%';
        elements.fullscreenNextBtn.disabled = true;
        
        // Asegurar que los botones estén en el estado correcto
        elements.fullscreenResponseButtons.style.display = 'none';
        elements.fullscreenPlayPauseBtn.style.display = 'flex';
    }
    
    updateProgress();
    updatePlayPauseButton(false);
}

// Actualizar botón Play/Pause
function updatePlayPauseButton(isPlaying) {
    state.isPlaying = isPlaying;
    
    if (state.isFullscreen) {
        if (isPlaying) {
            elements.fullscreenPlayIcon.style.display = 'none';
            elements.fullscreenPauseIcon.style.display = 'block';
            elements.fullscreenPlayPauseText.textContent = 'Detener';
            elements.fullscreenPlayPauseBtn.classList.add('playing');
        } else {
            elements.fullscreenPlayIcon.style.display = 'block';
            elements.fullscreenPauseIcon.style.display = 'none';
            elements.fullscreenPlayPauseText.textContent = 'Reproducir';
            elements.fullscreenPlayPauseBtn.classList.remove('playing');
        }
    }
}

// Entrar en modo pantalla completa
function enterFullscreen() {
    // Guardar nombre del participante y fecha
    state.participantName = elements.participantNameInput.value.trim();
    state.experimentDate = new Date();
    
    state.isFullscreen = true;
    elements.fullscreenMode.style.display = 'block';
    elements.mainContainer.style.display = 'none';
    
    // Resetear experimento
    resetExperiment();
    
    // Actualizar displays
    updateProgress();
    updatePlayPauseButton(false);
}

// Salir de modo pantalla completa
function exitFullscreen() {
    state.isFullscreen = false;
    elements.fullscreenMode.style.display = 'none';
    elements.mainContainer.style.display = 'block';
    
    // Detener audio si está sonando
    if (state.isPlaying) {
        stopWordAudio();
        updatePlayPauseButton(false);
    }
}

// Avanzar a siguiente palabra
function nextWord() {
    state.currentWord++;
    updateProgress();
    
    if (state.currentWord >= 15) {
        finishExperiment();
    } else {
        // Preparar para siguiente palabra
        updatePlayPauseButton(false);
        elements.fullscreenNextBtn.disabled = true;
    }
}

// Copiar resultados al portapapeles
async function copyResults() {
    if (state.wordTimes.length === 0) {
        alert('No hay resultados para copiar');
        return;
    }
    
    const listName = state.listId;
    const noiseLevel = state.noiseLevel;
    const participantName = state.participantName || 'No especificado';
    const experimentDate = state.experimentDate || new Date();
    const totalTime = state.wordTimes.reduce((sum, item) => sum + item.time, 0);
    const correctCount = state.wordTimes.filter(item => item.correct === true).length;
    const incorrectCount = state.wordTimes.filter(item => item.correct === false).length;
    
    // Formatear fecha de forma legible
    const dateStr = experimentDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let text = `Experimento de Discriminación Auditiva\n`;
    text += `========================================\n\n`;
    text += `Participante: ${participantName}\n`;
    text += `Fecha: ${dateStr}\n`;
    text += `Lista: ${listName}\n`;
    text += `Nivel de ruido: ${noiseLevel}%\n`;
    text += `Correctas: ${correctCount} | Incorrectas: ${incorrectCount}\n\n`;
    text += `Resultados:\n`;
    text += `-----------\n\n`;
    
    state.wordTimes.forEach(item => {
        const correctStr = item.correct === true ? ' ✓' : item.correct === false ? ' ✗' : '';
        text += `${item.word}. ${item.wordName}${correctStr}: ${item.time.toFixed(3)} s\n`;
    });
    
    text += `\n-----------\n`;
    text += `Tiempo total: ${totalTime.toFixed(3)} segundos\n`;
    text += `Precisión: ${correctCount}/${state.wordTimes.length} (${((correctCount / state.wordTimes.length) * 100).toFixed(1)}%)\n`;
    
    try {
        await navigator.clipboard.writeText(text);
        
        // Feedback visual
        const originalText = elements.copyResultsBtn.innerHTML;
        elements.copyResultsBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
            </svg>
            ¡Copiado!
        `;
        
        setTimeout(() => {
            elements.copyResultsBtn.innerHTML = originalText;
        }, 2000);
    } catch (err) {
        alert('No se pudo copiar al portapapeles. Por favor, inténtalo de nuevo.');
        console.error('Error al copiar:', err);
    }
}

// Event Listeners
elements.participantNameInput.addEventListener('input', () => {
    state.participantName = elements.participantNameInput.value.trim();
    checkStartButton();
});

elements.listSelect.addEventListener('change', (e) => {
    const value = e.target.value;
    if (value) {
        state.listId = value;
        elements.noiseSelect.disabled = false;
        checkStartButton();
    } else {
        state.listId = null;
        elements.noiseSelect.disabled = true;
        elements.noiseSelect.value = '';
        elements.startExperimentBtn.disabled = true;
    }
});

elements.noiseSelect.addEventListener('change', (e) => {
    const value = e.target.value;
    
    if (value === 'custom') {
        // Mostrar input personalizado
        elements.customNoiseGroup.style.display = 'block';
        elements.customNoiseInput.focus();
        state.noiseLevel = null;
        checkStartButton();
    } else if (value) {
        // Ocultar input personalizado
        elements.customNoiseGroup.style.display = 'none';
        state.noiseLevel = value;
        state.noiseRatio = noiseRatios[value];
        checkStartButton();
    } else {
        elements.customNoiseGroup.style.display = 'none';
        state.noiseLevel = null;
        elements.startExperimentBtn.disabled = true;
    }
});

elements.customNoiseInput.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    
    if (!isNaN(value) && value >= 0) {
        state.noiseLevel = value.toString();
        state.noiseRatio = value / 100.0;
        checkStartButton();
    } else {
        state.noiseLevel = null;
        state.noiseRatio = null;
        elements.startExperimentBtn.disabled = true;
    }
});

function checkStartButton() {
    const hasParticipantName = state.participantName.trim().length > 0;
    const hasListAndNoise = state.listId && state.noiseLevel !== null;
    elements.startExperimentBtn.disabled = !(hasParticipantName && hasListAndNoise);
}

elements.startExperimentBtn.addEventListener('click', () => {
    if (state.listId && state.noiseLevel !== null) {
        enterFullscreen();
    }
});

elements.exitFullscreenBtn.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres salir? Se perderá el progreso actual.')) {
        exitFullscreen();
    }
});

elements.fullscreenPlayPauseBtn.addEventListener('click', () => {
    if (state.currentWord >= 15 || state.waitingForResponse) {
        return;
    }
    
    if (!state.isPlaying) {
        // Reproducir
        playWordAudio();
    } else {
        // Detener audio y pausar timer
        stopWordAudio();
        pauseTimer();
        updatePlayPauseButton(false);
        
        // Mostrar botones de correcto/incorrecto
        if (state.isFullscreen) {
            elements.fullscreenPlayPauseBtn.style.display = 'none';
            elements.fullscreenResponseButtons.style.display = 'flex';
            state.waitingForResponse = true;
        }
        
        // Actualizar display del timer con el tiempo pausado
        updateTimerDisplay();
    }
});

elements.fullscreenCorrectBtn.addEventListener('click', () => {
    if (!state.waitingForResponse) {
        return;
    }
    saveTimerResult(true);  // Correcto
});

elements.fullscreenIncorrectBtn.addEventListener('click', () => {
    if (!state.waitingForResponse) {
        return;
    }
    saveTimerResult(false);  // Incorrecto
});

elements.resetButton.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres reiniciar el experimento? Se perderán todos los datos.')) {
        resetExperiment();
    }
});

elements.copyResultsBtn.addEventListener('click', () => {
    copyResults();
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicación de Discriminación Auditiva iniciada');
    updateProgress();
});
