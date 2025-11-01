# Información de Despliegue

## 🌐 URLs del Proyecto

### Repositorio GitHub
- **URL**: https://github.com/EasyModeLife/exp_dis_noise
- **Rama principal**: main

### Cloudflare Pages
- **Proyecto**: exp-dis-noise
- **URL esperada**: https://exp-dis-noise.pages.dev
- **Account ID**: 2c3d1df31d34ec4a881f270c81e493db

> **Nota**: Para verificar la URL exacta de tu despliegue, visita el dashboard de Cloudflare Pages en: https://dash.cloudflare.com

## 📦 Estado del Despliegue

✅ **Commit realizado**: fda9d9f
- 11 archivos modificados
- 1,319 inserciones
- 806 eliminaciones

✅ **Push a GitHub**: Completado exitosamente

✅ **Configuración de Cloudflare Pages**: Completa

## 🔄 Próximos Despliegues

Para futuros despliegues, puedes usar cualquiera de estos métodos:

### Método 1: Wrangler CLI (Directo)

```bash
cd /home/sonnyboy/Documents/exp_dis_noise
bunx wrangler pages deploy . --project-name exp-dis-noise
```

### Método 2: Git Push (Recomendado)

```bash
# Hacer cambios en el código
git add .
git commit -m "Descripción de cambios"
git push origin main

# Si tienes GitHub Actions configurado, el despliegue será automático
```

### Método 3: Dashboard de Cloudflare

1. Ve a https://dash.cloudflare.com
2. Navega a Pages > exp-dis-noise
3. Desde "Settings" puedes conectar tu repositorio de GitHub para despliegues automáticos

## 📝 Verificar Despliegue

Para verificar que tu aplicación está funcionando:

1. Visita https://exp-dis-noise.pages.dev (o la URL que aparece en tu dashboard)
2. Selecciona una combinación de lista y nivel de ruido
3. Verifica que los controles de reproducción funcionen
4. El ruido blanco debe generarse automáticamente

## 🎵 Próximos Pasos

1. **Generar audios con ElevenLabs**:
   - Crea archivos MP3 para cada palabra de cada lista
   - Colócalos en `/public/audio/words/lista{X}-{Y}sil/palabra{NN}.mp3`
   - Ver `INSTRUCTIONS.md` para las palabras exactas de cada lista

2. **Subir audios al proyecto**:
   ```bash
   # Después de generar los audios
   git add public/audio/words/
   git commit -m "Añadir audios generados con ElevenLabs"
   git push origin main
   
   # Desplegar con los nuevos audios
   bunx wrangler pages deploy . --project-name exp-dis-noise
   ```

3. **Probar el experimento completo** con audios reales

## 🔧 Comandos Útiles

```bash
# Ver logs de despliegue
bunx wrangler pages deployment list --project-name=exp-dis-noise

# Ver información del proyecto
bunx wrangler pages project view exp-dis-noise

# Desarrollo local
bunx wrangler pages dev .

# Ver quién está autenticado
bunx wrangler whoami
```

## 📊 Estructura de Audios Requerida

Actualmente faltan los archivos de audio. Necesitas generar 90 archivos MP3 (6 listas × 15 palabras):

```
public/audio/words/
├── lista1-3sil/  (15 archivos: palabra01.mp3 a palabra15.mp3)
├── lista2-3sil/  (15 archivos: palabra01.mp3 a palabra15.mp3)
├── lista1-4sil/  (15 archivos: palabra01.mp3 a palabra15.mp3)
├── lista2-4sil/  (15 archivos: palabra01.mp3 a palabra15.mp3)
├── lista1-5sil/  (15 archivos: palabra01.mp3 a palabra15.mp3)
└── lista2-5sil/  (15 archivos: palabra01.mp3 a palabra15.mp3)
```

## ✅ Checklist de Implementación

- [x] Estructura base del proyecto
- [x] HTML con selector de 36 combinaciones
- [x] CSS moderno y responsivo
- [x] JavaScript con Web Audio API
- [x] Sistema de temporizador
- [x] Generación de ruido blanco
- [x] Documentación completa
- [x] Configuración de Wrangler
- [x] Push a GitHub
- [x] Despliegue inicial a Cloudflare Pages
- [ ] Generar audios con ElevenLabs
- [ ] Subir audios al proyecto
- [ ] Pruebas del experimento completo

---

**Fecha de despliegue inicial**: 1 de noviembre de 2025

