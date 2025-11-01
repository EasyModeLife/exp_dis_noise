# Experimento de Discriminación Auditiva con Ruido

Aplicación web para realizar experimentos de discriminación auditiva de palabras en presencia de ruido blanco a diferentes niveles de intensidad.

## 🎯 Descripción

Este experimento evalúa la capacidad de reconocimiento auditivo de palabras cuando se presentan simultáneamente con ruido blanco. El sistema utiliza:

- **6 listas de palabras** (2 de 3 sílabas, 2 de 4 sílabas, 2 de 5 sílabas)
- **6 niveles de ruido** (del 70.79% al 112.20% del volumen de las palabras)
- **36 combinaciones totales** para probar diferentes condiciones experimentales

## ✨ Características

- ✅ Reproducción de palabras individuales con ruido blanco superpuesto
- ✅ Temporizador que inicia automáticamente al comenzar la reproducción
- ✅ Control manual para detener el temporizador (permite reconocimiento anticipado)
- ✅ Almacenamiento de tiempos de respuesta individuales
- ✅ Cálculo de tiempo total acumulado
- ✅ Generación dinámica de ruido blanco mediante Web Audio API
- ✅ Interfaz moderna y responsiva
- ✅ 36 combinaciones de audio predefinidas

## 🌐 Aplicación en Vivo

**🚀 URL de producción**: https://ffbc3673.exp-dis-noise.pages.dev

La aplicación está completamente funcional con los 90 audios generados y lista para ser utilizada.

## 🚀 Inicio Rápido

### Desarrollo Local

1. **Clonar el repositorio**:
```bash
git clone https://github.com/EasyModeLife/exp_dis_noise.git
cd exp_dis_noise
```

2. **Iniciar servidor de desarrollo con Wrangler**:
```bash
bunx wrangler pages dev .
```

3. **Abrir en el navegador**:
   - La aplicación estará disponible en `http://localhost:8788`

### Despliegue a Cloudflare Pages

#### Método 1: Despliegue Manual con Wrangler

```bash
# Asegúrate de estar autenticado
bunx wrangler login

# Desplegar a Cloudflare Pages
bunx wrangler pages deploy . --project-name=exp-dis-noise
```

#### Método 2: GitHub Actions (Automático)

El proyecto incluye configuración de GitHub Actions para despliegue automático en cada push a `main`.

1. Configura los siguientes secrets en tu repositorio de GitHub:
   - `CLOUDFLARE_API_TOKEN`: Token de API de Cloudflare con permisos de Pages
   - `CLOUDFLARE_ACCOUNT_ID`: ID de tu cuenta de Cloudflare

2. Haz push a la rama `main`:
```bash
git add .
git commit -m "Desplegar aplicación"
git push origin main
```

3. GitHub Actions desplegará automáticamente a Cloudflare Pages

## 📁 Estructura del Proyecto

```
exp_dis_noise/
├── public/
│   └── audio/
│       └── words/
│           ├── lista1-3sil/       # 15 palabras de 3 sílabas (Lista 1)
│           ├── lista2-3sil/       # 15 palabras de 3 sílabas (Lista 2)
│           ├── lista1-4sil/       # 15 palabras de 4 sílabas (Lista 1)
│           ├── lista2-4sil/       # 15 palabras de 4 sílabas (Lista 2)
│           ├── lista1-5sil/       # 15 palabras de 5 sílabas (Lista 1)
│           └── lista2-5sil/       # 15 palabras de 5 sílabas (Lista 2)
├── index.html                      # Interfaz principal
├── styles.css                      # Estilos de la aplicación
├── app.js                          # Lógica del experimento
├── wrangler.toml                   # Configuración de Cloudflare Pages
├── INSTRUCTIONS.md                 # Instrucciones detalladas del experimento
└── README.md                       # Este archivo
```

## 🎵 Generación de Audios con ElevenLabs

Los archivos de audio deben generarse con ElevenLabs y colocarse en las carpetas correspondientes:

### Estructura de Archivos de Audio

Cada lista debe contener 15 archivos de audio nombrados como `palabra01.mp3` hasta `palabra15.mp3`:

```
public/audio/words/lista1-3sil/
├── palabra01.mp3  (Obstante)
├── palabra02.mp3  (Brújula)
├── palabra03.mp3  (Guitarra)
...
└── palabra15.mp3  (Séquito)
```

### Palabras por Lista

Las palabras completas para cada lista están documentadas en el archivo [`INSTRUCTIONS.md`](./INSTRUCTIONS.md).

**Resumen:**
- **Lista 1 (3 sílabas)**: Obstante, Brújula, Guitarra, Comida, Fábula, etc.
- **Lista 2 (3 sílabas)**: Palabra, Número, Mercado, Ventana, Insignia, etc.
- **Lista 1 (4 sílabas)**: Restaurante, Bolígrafo, Efímero, Importante, etc.
- **Lista 2 (4 sílabas)**: Teléfono, Bicicleta, Simpático, Pentagrama, etc.
- **Lista 1 (5 sílabas)**: Especialista, Universidad, Laboratorio, etc.
- **Lista 2 (5 sílabas)**: Investigación, Estrafalario, Especulación, etc.

### Configuración Recomendada para ElevenLabs

- **Formato**: MP3
- **Voz**: Voz clara en español (recomendado: voz neutral sin acentos marcados)
- **Velocidad**: Normal
- **Calidad**: Alta definición

## 🎚️ Niveles de Ruido

El ruido blanco se genera dinámicamente y se mezcla con el audio de las palabras a los siguientes niveles:

| Nivel | Porcentaje | Descripción |
|-------|-----------|-------------|
| 0 | 0% | Sin ruido (control) |
| 1 | 33.33% | Muy bajo |
| 2 | 70.79% | Significativamente menor |
| 3 | 79.43% | Notablemente menor |
| 4 | 84.14% | Moderadamente menor |
| 5 | 89.13% | Ligeramente menor |
| 6 | 100% | Igual al volumen de las palabras |
| 7 | 112.20% | Ruido más alto que las palabras |

## 🧪 Uso del Experimento

1. **Configurar**: 
   - Selecciona una lista de palabras (6 opciones)
   - Selecciona un nivel de ruido (8 opciones: 0%, 33.33%, 70.79%, 79.43%, 84.14%, 89.13%, 100%, 112.20%)

2. **Iniciar**: Presiona "Iniciar Experimento en Pantalla Completa"

3. **Reproducir**: Presiona el botón verde "Reproducir"
   - El audio de la palabra se reproduce con ruido blanco superpuesto
   - El temporizador inicia automáticamente al comenzar el audio

4. **Responder**: Cuando reconozcas la palabra, presiona el botón correspondiente:
   - **Verde (✓)** si identificaste correctamente la palabra
   - **Rojo (✗)** si no pudiste identificarla o te equivocaste
   - El temporizador se detiene y avanza automáticamente a la siguiente palabra

5. **Continuar**: Repite el proceso para las 15 palabras de la lista

6. **Resultados**: Al finalizar, se muestra:
   - Tiempo total acumulado
   - Cantidad de respuestas correctas e incorrectas
   - Porcentaje de precisión
   - Detalle de cada palabra con su tiempo y resultado

## 🛠️ Tecnologías

- **HTML5**: Estructura de la aplicación
- **CSS3**: Diseño moderno y responsivo
- **JavaScript (ES6+)**: Lógica del experimento
- **Web Audio API**: Generación de ruido blanco y control de audio
- **Cloudflare Pages**: Hosting y despliegue
- **Wrangler**: CLI para gestión de Cloudflare
- **Bun**: Runtime y gestor de paquetes

## 📋 Requisitos

### Para Desarrollo Local
- Bun instalado (`curl -fsSL https://bun.sh/install | bash`)
- Navegador moderno (Chrome, Firefox, Edge, Safari actualizados)

### Para Despliegue
- Cuenta de Cloudflare
- Wrangler CLI (instalado con `bun add -g wrangler`)

## 🔧 Configuración de Cloudflare

### Obtener Credenciales

1. **API Token**:
   - Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Crea un token con permisos de "Cloudflare Pages:Edit"
   
2. **Account ID**:
   - Ve a tu dashboard de Cloudflare
   - Selecciona tu sitio web
   - El Account ID está en la barra lateral derecha

### Autenticación Local

```bash
bunx wrangler login
```

Esto abrirá tu navegador para autenticarte con Cloudflare.

## 📝 Control de Versiones con Git

### Configuración Inicial

```bash
# Inicializar repositorio (si no está inicializado)
git init

# Añadir archivos
git add .

# Commit inicial
git commit -m "Configuración inicial del experimento de discriminación auditiva"

# Conectar con repositorio remoto
git remote add origin https://github.com/EasyModeLife/exp_dis_noise.git

# Push a GitHub
git push -u origin main
```

### Flujo de Trabajo

```bash
# Hacer cambios
git add .
git commit -m "Descripción de cambios"
git push

# El despliegue se realizará automáticamente con GitHub Actions
```

## 🐛 Solución de Problemas

### Los audios no se reproducen

- **Verifica que los archivos de audio existan** en `/public/audio/words/`
- Los nombres deben seguir el formato: `palabraXX.mp3` (ejemplo: `palabra01.mp3`)
- Verifica la consola del navegador para ver errores específicos

### El temporizador no inicia

- Asegúrate de seleccionar un audio antes de presionar "Reproducir Palabra"
- Verifica que el navegador tenga permisos para reproducir audio

### Error de despliegue en Cloudflare

```bash
# Verificar autenticación
bunx wrangler whoami

# Si no está autenticado
bunx wrangler login

# Intentar despliegue nuevamente
bunx wrangler pages deploy . --project-name=exp-dis-noise
```

## 📊 Datos Recolectados

El experimento recolecta:

- ✅ Tiempo de respuesta individual para cada palabra (en segundos con 3 decimales)
- ✅ Tiempo total acumulado para las 15 palabras
- ✅ Lista y nivel de ruido utilizados

**Nota**: Los datos actualmente solo se muestran en pantalla. Para almacenamiento persistente, considera integrar una base de datos (Cloudflare D1, Supabase, etc.).

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 📧 Contacto

Para preguntas o sugerencias sobre el experimento, abre un issue en el repositorio de GitHub.

---

**Desarrollado con ❤️ para la investigación en discriminación auditiva**

