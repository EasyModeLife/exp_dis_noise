#!/usr/bin/env node

/**
 * Script para regenerar palabras específicas con diferentes configuraciones de voz
 * para encontrar la mejor pronunciación.
 * 
 * Los archivos se guardarán en `pruebas_audio/` con sufijos (v1, v2, v3).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// --- Configuración ---
const ELEVENLABS_API_KEY = 'sk_e14225510247087d1684d92ddf2f37f501bbae9baf285c9d';
const VOICE_ID = 'JYyJjNPfmNJdaby8LdZs'; // La voz que decidimos usar
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
const OUTPUT_DIR = path.join(__dirname, 'pruebas_audio');

// --- Palabras a Regenerar ---
const wordsToRegenerate = [
    'Brújula', 'Comida', 'Cebolla', 'Cuchara', 'Botella',
    'Palabra', 'Número', 'Mañana', 'Camisa', 'Amigo',
    'Kilómetro',
    'Simpático', 'Pentagrama', 'Diferente', 'Televisión',
    'Universidad', 'Categórico', 'Felicidades', 'Oportunidad', 'Estetoscopio', 'Inverosímil', 'Helicóptero',
    'Electricidad'
];

// --- Variaciones de Configuración de Voz ---
const voiceSettingVariations = [
    {
        suffix: 'v1_stable',
        settings: { stability: 0.8, similarity_boost: 0.75, style: 0.05, use_speaker_boost: false }
    },
    {
        suffix: 'v2_expressive',
        settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true }
    },
    {
        suffix: 'v3_balanced',
        settings: { stability: 0.7, similarity_boost: 0.7, style: 0.1, use_speaker_boost: false }
    }
];

/**
 * Genera un audio usando la API de ElevenLabs
 */
async function generateAudio(text, outputPath, voiceSettings) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2', // Usamos un modelo más reciente para mejor pronunciación
            language_code: 'es',
            voice_settings: voiceSettings
        });

        const options = {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Length': Buffer.byteLength(postData)
            }
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

/**
 * Normaliza un archivo de audio por picos
 */
function normalizePeak(filePath) {
    try {
        const tempFile = filePath + '.tmp.mp3';
        execSync(`ffmpeg -i "${filePath}" -af "volume=-1dB:eval=frame" -ar 44100 -c:a libmp3lame -b:a 192k "${tempFile}" -y`, { stdio: 'ignore' });
        fs.unlinkSync(filePath);
        fs.renameSync(tempFile, filePath);
    } catch (error) {
        console.warn(`  ⚠️  Error al normalizar: ${error.message}`);
    }
}

/**
 * Delay helper
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Función principal
 */
async function main() {
    console.log('🎙️  Regenerando palabras específicas con diferentes configuraciones...\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Limpiar pruebas anteriores
    console.log(`🧹 Limpiando directorio de pruebas: ${OUTPUT_DIR}`);
    const oldFiles = fs.readdirSync(OUTPUT_DIR);
    for (const file of oldFiles) {
        fs.unlinkSync(path.join(OUTPUT_DIR, file));
    }
    console.log('');

    let totalGenerated = 0;
    for (const word of wordsToRegenerate) {
        console.log(`--- Procesando "${word}" ---`);
        for (const variation of voiceSettingVariations) {
            const fileName = `${word}_${variation.suffix}.mp3`;
            const outputPath = path.join(OUTPUT_DIR, fileName);

            try {
                console.log(`  - Generando ${variation.suffix}...`);
                await generateAudio(word, outputPath, variation.settings);
                normalizePeak(outputPath);
                console.log(`    ✅ Guardado y normalizado: ${fileName}`);
                totalGenerated++;
                await delay(1000); // Rate limiting
            } catch (error) {
                console.error(`    ❌ Error al generar "${word}" (${variation.suffix}): ${error.message}`);
            }
        }
        console.log('');
    }

    console.log('==========================================');
    console.log('✨ Proceso completado!');
    console.log(`Total de archivos generados: ${totalGenerated}`);
    console.log(`📂 Revisa los nuevos audios en la carpeta: ${OUTPUT_DIR}`);
    console.log('💡 Escucha las versiones (v1, v2, v3) y elige la mejor para cada palabra.');
    console.log('==========================================\n');
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}

