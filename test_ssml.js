#!/usr/bin/env node

/**
 * Script de prueba para generar audios con SSML y diferentes configuraciones
 * Genera 3 ejemplos de palabras con distintos enfoques de pronunciación
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Configuración de ElevenLabs
const ELEVENLABS_API_KEY = 'sk_e14225510247087d1684d92ddf2f37f501bbae9baf285c9d';
const VOICE_ID = 'JYyJjNPfmNJdaby8LdZs';
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

// Directorio de salida
const OUTPUT_DIR = path.join(__dirname, 'pruebas_audio');

// Palabras de prueba con diferentes enfoques
const testCases = [
    {
        name: '01_brujula_normal',
        text: 'Brújula',
        description: 'Pronunciación normal sin SSML'
    },
    {
        name: '02_brujula_ssml_emphasis',
        text: '<speak><emphasis level="strong">BRÚ</emphasis>jula</speak>',
        description: 'Con énfasis SSML en la sílaba tónica',
        useSSML: true
    },
    {
        name: '03_brujula_phonetic',
        text: '<speak><prosody rate="95%">BRÚ-ju-la</prosody></speak>',
        description: 'Con separación silábica y velocidad ajustada',
        useSSML: true
    }
];

/**
 * Genera un audio usando la API de ElevenLabs
 */
async function generateAudio(text, outputPath, useSSML = false) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            text: text,
            model_id: 'eleven_turbo_v2_5',
            language_code: 'es',
            voice_settings: {
                stability: 0.75,
                similarity_boost: 0.75,
                style: 0.0,
                use_speaker_boost: false
            }
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
                res.on('end', () => {
                    reject(new Error(`Error ${res.statusCode}: ${errorData}`));
                });
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

        req.on('error', (err) => {
            reject(err);
        });

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
        execSync(
            `ffmpeg -i "${filePath}" -af "volume=-1dB:eval=frame" -ar 44100 -c:a libmp3lame -b:a 192k "${tempFile}" -y`,
            { stdio: 'ignore' }
        );
        fs.unlinkSync(filePath);
        fs.renameSync(tempFile, filePath);
        return true;
    } catch (error) {
        console.warn(`  ⚠️  Error al normalizar: ${error.message}`);
        return false;
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
    console.log('🎙️  Generador de Audios de Prueba con SSML\n');
    console.log('==========================================\n');

    // Crear directorio si no existe
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (let i = 0; i < testCases.length; i++) {
        const test = testCases[i];
        const outputPath = path.join(OUTPUT_DIR, `${test.name}.mp3`);

        console.log(`[${i + 1}/${testCases.length}] Generando: ${test.name}`);
        console.log(`  📝 Descripción: ${test.description}`);
        console.log(`  💬 Texto: ${test.text}`);

        try {
            await generateAudio(test.text, outputPath, test.useSSML);
            console.log(`  ✅ Generado: ${outputPath}`);
            
            // Normalizar
            console.log(`  🎚️  Normalizando...`);
            normalizePeak(outputPath);
            
            console.log(`  ✅ Completado\n`);
            
            // Rate limiting
            if (i < testCases.length - 1) {
                await delay(1000);
            }
        } catch (error) {
            console.error(`  ❌ Error: ${error.message}\n`);
        }
    }

    console.log('==========================================');
    console.log('✨ Pruebas completadas!');
    console.log(`📂 Archivos guardados en: ${OUTPUT_DIR}`);
    console.log('==========================================\n');
    console.log('💡 Escucha los archivos y compara la pronunciación.');
    console.log('💡 Usa el método que mejor funcione en generate_audios.js\n');
}

// Ejecutar
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}
