# Normalización de Audio

Este documento explica cómo normalizar los archivos de audio para mantener un volumen consistente en todos los experimentos.

## Problema

Los archivos de audio generados por ElevenLabs pueden tener diferentes niveles de volumen, causando inconsistencias en los experimentos. Necesitamos que todas las palabras tengan el mismo volumen percibido.

## Soluciones

### 1. Normalizar Audios Existentes

Si ya tienes archivos de audio generados, usa el script `normalize_audio.js`:

```bash
# Normalizar todos los audios en public/audio/words
bun run normalize_audio.js
```

Este script:
- ✅ Crea un backup automático en `public/audio/words_backup`
- ✅ Normaliza todos los MP3 a -16 LUFS (estándar de streaming)
- ✅ Preserva la calidad con 192 kbps MP3
- ✅ Muestra el nivel LUFS antes y después

**Requisito:** Necesitas tener `ffmpeg` instalado:

```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Descarga desde https://ffmpeg.org/download.html
```

### 2. Normalización Automática en Generación

El script `generate_audios.js` ahora normaliza automáticamente cada audio después de generarlo.

Para **activar/desactivar** la normalización automática, edita `generate_audios.js`:

```javascript
// Línea 10-11
const NORMALIZE_AUDIO = true;  // Cambiar a false para desactivar
const TARGET_LUFS = -16;       // Ajustar nivel objetivo
```

### 3. Normalización Manual con FFmpeg

Si prefieres normalizar archivos individuales manualmente:

```bash
# Normalizar un solo archivo
ffmpeg -i input.mp3 -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 44100 -c:a libmp3lame -b:a 192k output.mp3
```

## Parámetros de Normalización

- **TARGET_LUFS**: `-16` (recomendado para streaming)
  - `-23 LUFS`: Estándar de broadcast TV/radio
  - `-16 LUFS`: Estándar de plataformas streaming (Spotify, YouTube)
  - `-14 LUFS`: Más alto, para ambientes ruidosos

- **True Peak (TP)**: `-1.5 dB` (evita distorsión)
- **Loudness Range (LRA)**: `11` (rango dinámico natural)

## Verificar Niveles de Audio

Para verificar el nivel LUFS de un archivo:

```bash
ffmpeg -i archivo.mp3 -af loudnorm=print_format=json -f null - 2>&1 | grep input_i
```

## Workflow Recomendado

1. **Primera vez**: Normalizar audios existentes
   ```bash
   bun run normalize_audio.js
   ```

2. **Nuevos audios**: Generar con normalización automática
   ```bash
   bun run generate_audios.js
   ```

3. **Verificación**: Probar reproducción y ajustar `TARGET_LUFS` si es necesario

## Restaurar desde Backup

Si necesitas restaurar los archivos originales:

```bash
# Copiar backup de vuelta a la ubicación original
cp -r public/audio/words_backup/* public/audio/words/
```

## Notas Importantes

- ⚠️ La normalización requiere `ffmpeg` instalado
- 💾 Siempre se crea un backup antes de normalizar
- 🎚️ El nivel -16 LUFS es el estándar de la industria para contenido web
- 📊 La normalización LUFS es superior a la normalización por picos
- 🔊 Todos los audios mantendrán su rango dinámico natural

## Troubleshooting

**Error: "ffmpeg no está instalado"**
- Solución: Instalar ffmpeg según tu sistema operativo (ver arriba)

**Los audios suenan distorsionados**
- Solución: Aumentar TARGET_LUFS a -14 o -12

**Los audios están muy bajos**
- Solución: Disminuir TARGET_LUFS a -18 o -20

**Quiero volumen máximo sin distorsión**
- Solución: Usar normalización por picos en lugar de LUFS:
  ```bash
  ffmpeg -i input.mp3 -af "volume=0dB:replaygain_noclip=1" output.mp3
  ```
