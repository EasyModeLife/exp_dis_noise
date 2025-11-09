#!/usr/bin/env node

/**
 * Script para normalizar todos los audios a un volumen consistente
 * 
 * Normaliza todos los archivos MP3 en public/audio/words para que tengan
 * el mismo nivel de volumen percibido (loudness normalization)
 * 
 * Requisitos:
 *   - ffmpeg instalado en el sistema
 * 
 * Uso:
 *   bun run normalize_audio.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración
const AUDIO_DIR = path.join(__dirname, 'public', 'audio', 'words');
const TARGET_LUFS = -23;  // Estándar de broadcast (ajustar según necesidad)
const BACKUP_DIR = path.join(__dirname, 'public', 'audio', 'words_backup');

/**
 * Verifica si ffmpeg está instalado
 */
function checkFFmpeg() {
    try {
        execSync('ffmpeg -version', { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Obtiene el nivel LUFS actual de un archivo de audio
 */
function getLUFS(filePath) {
    try {
        const output = execSync(
            `ffmpeg -i "${filePath}" -af loudnorm=print_format=json -f null - 2>&1`,
            { encoding: 'utf8' }
        );
        
        // Extraer el valor de input_i (integrated loudness)
        const match = output.match(/"input_i"\s*:\s*"(-?\d+\.?\d*)"/);
        if (match) {
            return parseFloat(match[1]);
        }
        return null;
    } catch (error) {
        console.error(`Error al obtener LUFS de ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Normaliza un archivo de audio usando dos pasadas para máxima precisión
 */
function normalizeAudio(inputPath, outputPath, targetLUFS = TARGET_LUFS) {
    try {
        // Primera pasada: analizar el audio
        const analysisOutput = execSync(
            `ffmpeg -i "${inputPath}" -af loudnorm=I=${targetLUFS}:TP=-1.5:LRA=11:print_format=json -f null - 2>&1`,
            { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
        );
        
        // Extraer parámetros medidos del JSON
        const inputI = analysisOutput.match(/"input_i"\s*:\s*"(-?\d+\.?\d*)"/)?.[1];
        const inputTP = analysisOutput.match(/"input_tp"\s*:\s*"(-?\d+\.?\d*)"/)?.[1];
        const inputLRA = analysisOutput.match(/"input_lra"\s*:\s*"(-?\d+\.?\d*)"/)?.[1];
        const inputThresh = analysisOutput.match(/"input_thresh"\s*:\s*"(-?\d+\.?\d*)"/)?.[1];
        const targetOffset = analysisOutput.match(/"target_offset"\s*:\s*"(-?\d+\.?\d*)"/)?.[1];
        
        if (!inputI || !inputTP || !inputLRA || !inputThresh || !targetOffset) {
            console.warn('  ⚠️  No se pudieron extraer parámetros, usando método simple...');
            return normalizeAudioSimple(inputPath, outputPath);
        }
        
        // Segunda pasada: aplicar normalización con parámetros medidos
        const tempOutput = outputPath + '.tmp.mp3';
        execSync(
            `ffmpeg -i "${inputPath}" -af loudnorm=I=${targetLUFS}:TP=-1.5:LRA=11:measured_I=${inputI}:measured_LRA=${inputLRA}:measured_TP=${inputTP}:measured_thresh=${inputThresh}:offset=${targetOffset}:linear=true:print_format=summary -ar 44100 -c:a libmp3lame -b:a 192k "${tempOutput}" -y 2>&1`,
            { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, stdio: 'pipe' }
        );
        
        // Reemplazar archivo original con normalizado
        fs.renameSync(tempOutput, outputPath);
        
        return true;
    } catch (error) {
        console.error(`  ❌ Error al normalizar con dos pasadas: ${error.message}`);
        // Intentar método simple como fallback
        return normalizeAudioSimple(inputPath, outputPath);
    }
}

/**
 * Método alternativo más simple: normalización por picos
 */
function normalizeAudioSimple(inputPath, outputPath) {
    try {
        execSync(
            `ffmpeg -i "${inputPath}" -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 44100 -c:a libmp3lame -b:a 192k "${outputPath}" -y`,
            { stdio: 'ignore' }
        );
        return true;
    } catch (error) {
        console.error(`Error al normalizar ${inputPath}:`, error.message);
        return false;
    }
}

/**
 * Buscar todos los archivos MP3 recursivamente
 */
function findMP3Files(dir) {
    let mp3Files = [];
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            mp3Files = mp3Files.concat(findMP3Files(fullPath));
        } else if (item.endsWith('.mp3')) {
            mp3Files.push(fullPath);
        }
    }
    
    return mp3Files;
}

/**
 * Crear backup de los archivos originales
 */
function createBackup(files) {
    console.log('📦 Creando backup de archivos originales...');
    
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    for (const file of files) {
        const relativePath = path.relative(AUDIO_DIR, file);
        const backupPath = path.join(BACKUP_DIR, relativePath);
        const backupDir = path.dirname(backupPath);
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        fs.copyFileSync(file, backupPath);
    }
    
    console.log(`✅ Backup creado en: ${BACKUP_DIR}\n`);
}

/**
 * Función principal
 */
async function main() {
    console.log('🎵 Normalizador de Audio\n');
    console.log('========================\n');
    
    // Verificar ffmpeg
    if (!checkFFmpeg()) {
        console.error('❌ Error: ffmpeg no está instalado.');
        console.error('Instala ffmpeg con:');
        console.error('  Ubuntu/Debian: sudo apt install ffmpeg');
        console.error('  macOS: brew install ffmpeg');
        console.error('  Windows: https://ffmpeg.org/download.html\n');
        process.exit(1);
    }
    
    console.log('✅ ffmpeg encontrado\n');
    
    // Buscar archivos MP3
    if (!fs.existsSync(AUDIO_DIR)) {
        console.error(`❌ Error: Directorio no encontrado: ${AUDIO_DIR}`);
        process.exit(1);
    }
    
    const mp3Files = findMP3Files(AUDIO_DIR);
    
    if (mp3Files.length === 0) {
        console.log('⚠️  No se encontraron archivos MP3 para normalizar.');
        process.exit(0);
    }
    
    console.log(`📁 Encontrados ${mp3Files.length} archivos MP3\n`);
    
    // Crear backup
    createBackup(mp3Files);
    
    // Normalizar archivos
    console.log(`🎚️  Normalizando a ${TARGET_LUFS} LUFS...\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < mp3Files.length; i++) {
        const file = mp3Files[i];
        const relativePath = path.relative(AUDIO_DIR, file);
        const progress = `[${i + 1}/${mp3Files.length}]`;
        
        console.log(`${progress} Procesando: ${relativePath}`);
        
        // Obtener LUFS actual
        const currentLUFS = getLUFS(file);
        if (currentLUFS !== null) {
            console.log(`  📊 LUFS actual: ${currentLUFS.toFixed(2)}`);
        }
        
        // Normalizar (método simple)
        const tempFile = file + '.normalized.mp3';
        const success = normalizeAudioSimple(file, tempFile);
        
        if (success) {
            // Reemplazar archivo original
            fs.renameSync(tempFile, file);
            
            // Verificar LUFS después
            const newLUFS = getLUFS(file);
            if (newLUFS !== null) {
                console.log(`  ✅ LUFS normalizado: ${newLUFS.toFixed(2)}`);
            } else {
                console.log(`  ✅ Normalizado exitosamente`);
            }
            
            successCount++;
        } else {
            failCount++;
        }
        
        console.log('');
    }
    
    // Resumen
    console.log('========================');
    console.log('✨ Proceso completado!');
    console.log(`✅ Archivos normalizados: ${successCount}/${mp3Files.length}`);
    if (failCount > 0) {
        console.log(`❌ Archivos fallidos: ${failCount}`);
    }
    console.log(`💾 Backup guardado en: ${BACKUP_DIR}`);
    console.log('========================\n');
}

// Ejecutar
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}

module.exports = { normalizeAudio, normalizeAudioSimple, getLUFS };
