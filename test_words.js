#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuración de ElevenLabs
const ELEVENLABS_API_KEY = 'sk_e14225510247087d1684d92ddf2f37f501bbae9baf285c9d';
const VOICE_ID = 'JYyJjNPfmNJdaby8LdZs';
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

// Palabras de prueba
const testWords = [
    { word: 'Brújula', filename: 'brujula.mp3' },
    { word: 'Mariposa', filename: 'mariposa.mp3' }
];

async function generateAudio(text, outputPath) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            text: text,
            model_id: 'eleven_turbo_v2_5',
            language_code: 'es',
            voice_settings: {
                stability: 0.3,
                similarity_boost: 0.8,
                style: 0.0,
                use_speaker_boost: true
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('🎵 Generando Palabras de Prueba');
    console.log('================================\n');
    console.log('Configuración:');
    console.log('- Modelo: eleven_turbo_v2_5');
    console.log('- Language: es');
    console.log('- Stability: 0.3');
    console.log('- Similarity Boost: 0.8');
    console.log('- SIN Audio Tags\n');

    const outputDir = path.join(__dirname, 'pruebas_audio');

    for (const testWord of testWords) {
        try {
            const outputPath = path.join(outputDir, testWord.filename);
            console.log(`🎙️  Generando: ${testWord.word}...`);
            await generateAudio(testWord.word, outputPath);
            console.log(`✅ Guardado: ${outputPath}`);
            await delay(1000);
        } catch (error) {
            console.error(`❌ Error al generar "${testWord.word}": ${error.message}`);
        }
    }

    console.log('\n================================');
    console.log('✨ Pruebas completadas!');
    console.log(`📂 Archivos en: ${outputDir}`);
    console.log('================================\n');
}

main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});

