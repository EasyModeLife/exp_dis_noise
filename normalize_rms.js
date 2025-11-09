#!/usr/bin/env node

/**
 * Script para normalizar el volumen de todos los archivos de audio
 * usando RMS Normalization (volumen percibido consistente)
 * 
 * Este método ajusta el volumen promedio de cada archivo para que
 * todas las palabras tengan el mismo volumen percibido, 
 * subiendo unas y bajando otras según sea necesario.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración
const AUDIO_DIR = path.join(__dirname, 'public', 'audio', 'words');
const BACKUP_DIR = path.join(__dirname, 'public', 'audio', 'words_backup_rms');
const TARGET_RMS = -20.0; // dB - nivel de volumen promedio objetivo

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
 * Obtiene todos los archivos MP3 recursivamente
 */
function getAllMP3Files(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllMP3Files(filePath));
        } else if (file.endsWith('.mp3')) {
            results.push(filePath);
        }
    });
    
    return results;
}

/**
 * Crea backup de los archivos originales
 */
function createBackup(files) {
    if (fs.existsSync(BACKUP_DIR)) {
        console.log('⚠️  El backup ya existe, saltando...\n');
        return;
    }
    
    console.log('📦 Creando backup de archivos originales...');
    
    files.forEach(file => {
        const relativePath = path.relative(AUDIO_DIR, file);
        const backupPath = path.join(BACKUP_DIR, relativePath);
        const backupFolder = path.dirname(backupPath);
        
        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder, { recursive: true });
        }
        
        fs.copyFileSync(file, backupPath);
    });
    
    console.log(`✅ Backup creado en: ${BACKUP_DIR}\n`);
}

/**
 * Obtiene el nivel RMS de un archivo
 */
function getRMSLevel(filePath) {
    try {
        const output = execSync(
            `ffmpeg -i "${filePath}" -af "volumedetect" -f null - 2>&1`,
            { encoding: 'utf8' }
        );
        
        const match = output.match(/mean_volume:\s*(-?\d+\.?\d*)\s*dB/);
        if (match) {
            return parseFloat(match[1]);
        }
        return null;
    } catch (error) {
        console.error(`Error al obtener RMS de ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Normaliza un archivo usando RMS
 */
function normalizeRMS(filePath, currentRMS, targetRMS) {
    try {
        const gain = targetRMS - currentRMS;
        const tempFile = filePath + '.tmp.mp3';
        
        // Aplicar ganancia para alcanzar el RMS objetivo
        execSync(
            `ffmpeg -i "${filePath}" -af "volume=${gain}dB" -ar 44100 -c:a libmp3lame -b:a 192k "${tempFile}" -y`,
            { stdio: 'ignore' }
        );
        
        // Reemplazar archivo original
        fs.unlinkSync(filePath);
        fs.renameSync(tempFile, filePath);
        
        return gain;
    } catch (error) {
        console.error(`Error al normalizar ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Obtiene el nuevo nivel RMS después de normalizar
 */
function getNewRMS(filePath) {
    try {
        const output = execSync(
            `ffmpeg -i "${filePath}" -af "volumedetect" -f null - 2>&1`,
            { encoding: 'utf8' }
        );
        
        const match = output.match(/mean_volume:\s*(-?\d+\.?\d*)\s*dB/);
        if (match) {
            return parseFloat(match[1]);
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Main
 */
function main() {
    console.log('🎚️  Normalizador de Audio - RMS Normalization\n');
    console.log('===============================================\n');
    
    // Verificar ffmpeg
    if (!checkFFmpeg()) {
        console.error('❌ ffmpeg no está instalado o no está en el PATH');
        console.error('   Instala ffmpeg: sudo apt install ffmpeg');
        process.exit(1);
    }
    console.log('✅ ffmpeg encontrado\n');
    
    // Obtener todos los archivos
    const files = getAllMP3Files(AUDIO_DIR);
    console.log(`📁 Encontrados ${files.length} archivos MP3\n`);
    
    if (files.length === 0) {
        console.log('⚠️  No se encontraron archivos MP3');
        process.exit(0);
    }
    
    // Crear backup
    createBackup(files);
    
    // Normalizar todos los archivos
    console.log(`🎚️  Normalizando todos los archivos a ${TARGET_RMS} dB RMS...\n`);
    
    let successCount = 0;
    
    files.forEach((file, index) => {
        const relativePath = path.relative(AUDIO_DIR, file);
        console.log(`[${index + 1}/${files.length}] ${relativePath}`);
        
        // Obtener RMS actual
        const currentRMS = getRMSLevel(file);
        if (currentRMS === null) {
            console.log('  ❌ Error al leer nivel RMS\n');
            return;
        }
        
        console.log(`  📊 RMS actual: ${currentRMS.toFixed(2)} dB`);
        
        // Calcular y aplicar ganancia
        const gain = normalizeRMS(file, currentRMS, TARGET_RMS);
        if (gain === null) {
            console.log('  ❌ Error al normalizar\n');
            return;
        }
        
        console.log(`  🎚️  Ganancia aplicada: ${gain > 0 ? '+' : ''}${gain.toFixed(2)} dB`);
        
        // Verificar nuevo nivel
        const newRMS = getNewRMS(file);
        if (newRMS !== null) {
            console.log(`  ✅ Nuevo RMS: ${newRMS.toFixed(2)} dB\n`);
        } else {
            console.log('  ✅ Normalizado\n');
        }
        
        successCount++;
    });
    
    console.log('===============================================');
    console.log('✨ Proceso completado!');
    console.log(`✅ Archivos normalizados: ${successCount}/${files.length}`);
    console.log(`🎚️  Todos los archivos ahora tienen RMS: ${TARGET_RMS} dB`);
    console.log(`💾 Backup guardado en: ${BACKUP_DIR}`);
    console.log('===============================================');
}

if (require.main === module) {
    main();
}
