#!/usr/bin/env node

/**
 * Script para regenerar y reemplazar palabras específicas con la mejor configuración de voz.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// --- Configuración ---
const ELEVENLABS_API_KEY = 'sk_e14225510247087d1684d92ddf2f37f501bbae9baf285c9d';
const VOICE_ID = 'JYyJjNPfmNJdaby8LdZs';
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
const AUDIO_BASE_DIR = path.join(__dirname, 'public', 'audio', 'words');

// --- Palabras a Regenerar ---
const wordsToFix = {
    'lista1-3sil': ['Brújula', 'Comida', 'Cebolla', 'Cuchara', 'Botella'],
    'lista2-3sil': ['Palabra', 'Número', 'Mañana', 'Camisa', 'Amigo'],
    'lista1-4sil': ['Kilómetro'],
    'lista2-4sil': ['Simpático', 'Pentagrama', 'Diferente', 'Televisión'],
    'lista1-5sil': ['Universidad', 'Categórico', 'Felicidades', 'Oportunidad', 'Estetoscopio', 'Inverosímil', 'Helicóptero'],
    'lista2-5sil': ['Electricidad']
};

// --- Configuración de Voz Preferida ("stable") ---
const preferredVoiceSettings = {
    stability: 0.8,
    similarity_boost: 0.75,
    style: 0.05,
    use_speaker_boost: false
};

// --- Listas de palabras originales para encontrar el nombre de archivo correcto ---
const originalWordLists = {
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

async function generateAudio(text, outputPath, voiceSettings) {
    // ... (función de generación de audio, igual que en test_words.js pero con modelo corregido)
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            text: text,
            model_id: 'eleven_turbo_v2_5', // Modelo más confiable para español
            language_code: 'es',
            voice_settings: voiceSettings
        });

        const options = {
            method: 'POST',
            headers: { 'Accept': 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': ELEVENLABS_API_KEY },
        };

        const req = https.request(API_URL, options, (res) => {
            if (res.statusCode !== 200) {
                let errorData = '';
                res.on('data', chunk => errorData += chunk);
                res.on('end', () => reject(new Error(`Error ${res.statusCode}: ${errorData}`)));
                return;
            }
            const fileStream = fs.createWriteStream(outputPath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve(outputPath);
            });
            fileStream.on('error', (err) => {
                fs.unlink(outputPath, () => {});
                reject(err);
            });
        });
        req.on('error', (err) => reject(err));
        req.write(postData);
        req.end();
    });
}

function normalizePeak(filePath) {
    // ... (función de normalización, igual que antes)
    try {
        const tempFile = filePath + '.tmp.mp3';
        execSync(`ffmpeg -i "${filePath}" -af "volume=-1dB:eval=frame" -ar 44100 -c:a libmp3lame -b:a 192k "${tempFile}" -y`, { stdio: 'ignore' });
        fs.unlinkSync(filePath);
        fs.renameSync(tempFile, filePath);
    } catch (error) {
        console.warn(`  ⚠️  Error al normalizar: ${error.message}`);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('🎙️  Regenerando y reemplazando palabras mal pronunciadas...\n');

    let totalReplaced = 0;
    for (const [listName, words] of Object.entries(wordsToFix)) {
        console.log(`--- Procesando lista: ${listName} ---`);
        const listDir = path.join(AUDIO_BASE_DIR, listName);
        if (!fs.existsSync(listDir)) {
            console.warn(`  ⚠️  Directorio no encontrado, saltando: ${listDir}`);
            continue;
        }

        for (const word of words) {
            const wordIndex = originalWordLists[listName].indexOf(word);
            if (wordIndex === -1) {
                console.warn(`  - ⚠️  Palabra "${word}" no encontrada en la lista original, saltando.`);
                continue;
            }

            const wordNumber = String(wordIndex + 1).padStart(2, '0');
            const fileName = `palabra${wordNumber}.mp3`;
            const outputPath = path.join(listDir, fileName);

            try {
                console.log(`  - Regenerando "${word}" -> ${fileName}`);
                await generateAudio(word, outputPath, preferredVoiceSettings);
                normalizePeak(outputPath);
                console.log(`    ✅ Reemplazado y normalizado.`);
                totalReplaced++;
                await delay(1000); // Rate limiting
            } catch (error) {
                console.error(`    ❌ Error al regenerar "${word}": ${error.message}`);
            }
        }
        console.log('');
    }

    console.log('==========================================');
    console.log('✨ Proceso de corrección completado!');
    console.log(`Total de archivos reemplazados: ${totalReplaced}`);
    console.log('✅ Las palabras problemáticas han sido actualizadas.');
    console.log('==========================================\n');
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}
