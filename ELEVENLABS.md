# Generación de Audios con ElevenLabs

## 🎙️ Configuración

Los audios se generan usando la API de ElevenLabs con la siguiente configuración:

- **Voice ID**: `JYyJjNPfmNJdaby8LdZs`
- **Modelo**: `eleven_multilingual_v2` (optimizado para español)
- **API Key**: Configurada en el script

## 📊 Audios a Generar

**Total**: 90 archivos MP3 (6 listas × 15 palabras)

### Listas de 3 Sílabas (30 palabras)
- **Lista 1**: Obstante, Brújula, Guitarra, Comida, Fábula, Rúbrica, Cebolla, Crónica, Escuela, Familia, Vértigo, Mochila, Cuchara, Botella, Séquito
- **Lista 2**: Palabra, Número, Mercado, Ventana, Insignia, Enigma, Diluvio, Mañana, Camisa, Plátano, Amigo, Trabajo, Dinero, Zapato, Naranja

### Listas de 4 Sílabas (30 palabras)
- **Lista 1**: Restaurante, Bolígrafo, Efímero, Importante, Mandíbula, Obelisco, Monasterio, Presidente, Carpintero, Calendario, Secretaria, Periscopio, Cucaracha, Kilómetro, Semáforo
- **Lista 2**: Teléfono, Bicicleta, Simpático, Pentagrama, Mariposa, Diferente, Elefante, Termómetro, Necesario, Chocolate, Catapulta, Eucalipto, Compañero, Televisión, Murciélago

### Listas de 5 Sílabas (30 palabras)
- **Lista 1**: Especialista, Universidad, Laboratorio, Categórico, Caleidoscopio, Felicidades, Oportunidad, Estacionamiento, Computadora, Estetoscopio, Melancólico, Inverosímil, Aristocracia, Helicóptero, Comunicación
- **Lista 2**: Investigación, Estrafalario, Especulación, Inteligente, Idiosincrasia, Electricidad, Matemáticas, Hipopótamo, Administración, Agradecimiento, Antibiótico, Efervescencia, Temperatura, Necesidades, Experiencia

## 🚀 Uso del Script

### Generar Todos los Audios

```bash
cd /home/sonnyboy/Documents/exp_dis_noise
bun run generate_audios.js
```

El script:
- ✅ Crea automáticamente las carpetas necesarias
- ✅ Salta archivos que ya existen (puedes reanudar si se interrumpe)
- ✅ Muestra progreso en tiempo real
- ✅ Respeta los rate limits de la API (1 segundo entre requests)
- ✅ Guarda archivos como `palabra01.mp3` hasta `palabra15.mp3` en cada carpeta

### Estructura de Salida

```
public/audio/words/
├── lista1-3sil/
│   ├── palabra01.mp3 (Obstante)
│   ├── palabra02.mp3 (Brújula)
│   └── ... (15 archivos total)
├── lista2-3sil/
│   └── ... (15 archivos)
├── lista1-4sil/
│   └── ... (15 archivos)
├── lista2-4sil/
│   └── ... (15 archivos)
├── lista1-5sil/
│   └── ... (15 archivos)
└── lista2-5sil/
    └── ... (15 archivos)
```

## ⏱️ Tiempo Estimado

- **Por palabra**: ~2 segundos (1s generación + 1s rate limit)
- **Total para 90 palabras**: ~3-4 minutos

## 💰 Cuota de ElevenLabs

Cada palabra consume aproximadamente 10-20 caracteres de tu cuota:

- **Total estimado**: 900-1800 caracteres para las 90 palabras
- **Plan gratuito**: 10,000 caracteres/mes
- **Suficiente para**: ~5-10 generaciones completas del set

Verifica tu cuota en: https://elevenlabs.io/app/speech-synthesis

## 🔧 Configuración de Voz

El script usa estos parámetros optimizados para claridad:

```javascript
{
    model_id: 'eleven_turbo_v2_5',  // Modelo v2.5 Turbo (más rápido y claro)
    language_code: 'es',            // Español
    voice_settings: {
        stability: 0.3,             // Mayor consistencia y claridad
        similarity_boost: 0.8,      // Alta fidelidad a la voz
        style: 0.0,                 // Sin exageración
        use_speaker_boost: true     // Mejor calidad de audio
    }
}
```

**Nota**: NO se usan Audio Tags (como `[pronunciar con claridad]`) ya que se leen literalmente.

## 📝 Después de Generar los Audios

1. **Verificar que todos se generaron**:
```bash
find public/audio/words -name "*.mp3" | wc -l
# Debería mostrar: 90
```

2. **Subir al repositorio**:
```bash
git add public/audio/words/
git commit -m "Añadir audios generados con ElevenLabs"
git push origin main
```

3. **Desplegar a Cloudflare Pages**:
```bash
bunx wrangler pages deploy . --project-name exp-dis-noise
```

## 🐛 Solución de Problemas

### Error: API Key inválida
- Verifica que la API key no haya expirado
- Revisa que tengas permisos de Text-to-Speech

### Error: Rate limit excedido
- El script ya incluye 1 segundo de espera entre requests
- Si persiste, aumenta el delay en el código

### Archivos no se generan
- Verifica tu cuota en el dashboard de ElevenLabs
- Asegúrate de tener conexión a internet

### Algunos audios faltan
- El script puede reanudarse; simplemente ejecútalo de nuevo
- Los archivos existentes se saltarán automáticamente

## 🔐 Seguridad

⚠️ **IMPORTANTE**: El script contiene tu API key. 

- NO subas `generate_audios.js` a GitHub sin remover la API key
- Considera moverla a una variable de entorno

### Usar con Variable de Entorno (Recomendado)

```bash
# En tu terminal
export ELEVENLABS_API_KEY="sk_e14225510247087d1684d92ddf2f37f501bbae9baf285c9d"
bun run generate_audios.js
```

Luego modifica el script para leer de la variable:
```javascript
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'tu-api-key';
```

## 📊 Progreso

Usa este checklist para verificar:

```bash
# Lista 1 (3 sílabas)
ls -1 public/audio/words/lista1-3sil/*.mp3 | wc -l  # Debe ser 15

# Lista 2 (3 sílabas)
ls -1 public/audio/words/lista2-3sil/*.mp3 | wc -l  # Debe ser 15

# Lista 1 (4 sílabas)
ls -1 public/audio/words/lista1-4sil/*.mp3 | wc -l  # Debe ser 15

# Lista 2 (4 sílabas)
ls -1 public/audio/words/lista2-4sil/*.mp3 | wc -l  # Debe ser 15

# Lista 1 (5 sílabas)
ls -1 public/audio/words/lista1-5sil/*.mp3 | wc -l  # Debe ser 15

# Lista 2 (5 sílabas)
ls -1 public/audio/words/lista2-5sil/*.mp3 | wc -l  # Debe ser 15
```

## ✅ Resultado Esperado

Después de ejecutar el script exitosamente:

```
🎵 Generador de Audios con ElevenLabs
=====================================

📂 Procesando lista1-3sil...
  🎙️  Generando palabra 01: Obstante...
  ✅ Guardado: public/audio/words/lista1-3sil/palabra01.mp3
  ...

=====================================
✨ Proceso completado!
✅ Archivos generados: 90/90
❌ Archivos fallidos: 0
=====================================
```

¡Ahora tu experimento estará completo con audios reales! 🎉

