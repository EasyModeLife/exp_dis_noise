#!/usr/bin/env node

/**
 * Script para normalizar audios usando Peak Normalization
 * 
 * Este método asegura que TODOS los archivos alcancen el mismo pico máximo,
 * garantizando volumen consistente entre todos los archivos.
 * 
 * Uso:
 *   bun run normalize_peak.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración
const AUDIO_DIR = path.join(__dirname, 'public', 'audio', 'words');
const TARGET_PEAK = -1.0;  // dB - Dejar 1dB de headroom para evitar clipping
const BACKUP_DIR = path.join(__dirname, 'public', 'audio', 'words_backup_original');

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
 * Obtiene el nivel de pico de un archivo
 */
function getPeakLevel(filePath) {
    try {
        const output = execSync(
            `ffmpeg -i "${filePath}" -af "volumedetect" -f null - 2>&1`,
            { encoding: 'utf8' }
        );
        
        const match = output.match(/max_volume:\s*(-?\d+\.?\d*)\s*dB/);
        if (match) {
            return parseFloat(match[1]);
        }
        return null;
    } catch (error) {
        console.error(`Error al obtener pico de ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Normaliza un archivo por picos
 */
function normalizePeak(inputPath, outputPath, targetPeak = TARGET_PEAK) {
    try {
        // Obtener pico actual
        const currentPeak = getPeakLevel(inputPath);
        
        if (currentPeak === null) {
            console.warn('  ⚠️  No se pudo detectar el pico');
            return false;
        }
        
        // Calcular ganancia necesaria
        const gain = targetPeak - currentPeak;
        
        console.log(`  📊 Pico actual: ${currentPeak.toFixed(2)} dB`);
        console.log(`  🎚️  Aplicando ganancia: ${gain > 0 ? '+' : ''}${gain.toFixed(2)} dB`);
        
        // Aplicar normalización
        const tempOutput = outputPath + '.tmp.mp3';
        execSync(
            `ffmpeg -i "${inputPath}" -af "volume=${gain}dB" -ar 44100 -c:a libmp3lame -b:a 192k "${tempOutput}" -y`,
            { stdio: 'ignore' }
        );
        
        // Verificar nuevo pico
        const newPeak = getPeakLevel(tempOutput);
        if (newPeak !== null) {
            console.log(`  ✅ Nuevo pico: ${newPeak.toFixed(2)} dB`);
        }
        
        // Reemplazar archivo original
        fs.renameSync(tempOutput, outputPath);
        
        return true;
    } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
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
    console.log('🎚️  Normalizador de Audio - Peak Normalization\n');
    console.log('===============================================\n');
    
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
    console.log(`🎚️  Normalizando todos los archivos a ${TARGET_PEAK} dB peak...\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < mp3Files.length; i++) {
        const file = mp3Files[i];
        const relativePath = path.relative(AUDIO_DIR, file);
        const progress = `[${i + 1}/${mp3Files.length}]`;
        
        console.log(`${progress} ${relativePath}`);
        
        const success = normalizePeak(file, file, TARGET_PEAK);
        
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
        
        console.log('');
    }
    
    // Resumen
    console.log('===============================================');
    console.log('✨ Proceso completado!');
    console.log(`✅ Archivos normalizados: ${successCount}/${mp3Files.length}`);
    if (failCount > 0) {
        console.log(`❌ Archivos fallidos: ${failCount}`);
    }
    console.log(`🎚️  Todos los archivos ahora tienen pico máximo: ${TARGET_PEAK} dB`);
    console.log(`💾 Backup guardado en: ${BACKUP_DIR}`);
    console.log('===============================================\n');
}

// Ejecutar
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}

module.exports = { normalizePeak, getPeakLevel };
