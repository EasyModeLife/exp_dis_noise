# Experimento de Discriminación con Ruido

Aplicación web para experimento de discriminación auditiva con ruido blanco. Permite reproducir listas de palabras mezcladas con ruido blanco a diferentes niveles de volumen y medir el tiempo de respuesta del usuario.

## Características

- 6 listas de palabras (2 de 3 sílabas, 2 de 4 sílabas, 2 de 5 sílabas)
- 3 niveles de ruido por lista (100%, 84.1395%, 70.7946%)
- Reproducción palabra por palabra con ruido blanco mezclado
- Temporizador automático que inicia al terminar cada palabra
- Almacenamiento de tiempos individuales y tiempo total acumulado

## Uso

1. Selecciona uno de los 18 audios disponibles (6 listas × 3 niveles de ruido)
2. Presiona "Reproducir Palabra" para escuchar la primera palabra
3. Al terminar la palabra, el temporizador se inicia automáticamente
4. Presiona "Detener Temporizador" cuando estés listo
5. Repite el proceso para las 15 palabras
6. Al finalizar, se muestra el tiempo total acumulado

## Tecnologías

- HTML5
- CSS3
- JavaScript (ES6+)
- Web Audio API
- Web Speech API (Speech Synthesis)

## Requisitos

- Navegador moderno con soporte para Web Audio API y Speech Synthesis API
- Chrome, Firefox, Edge o Safari actualizados

## Instalación Local

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/exp_dis_noise.git
cd exp_dis_noise
```

2. Abre `index.html` en tu navegador o usa un servidor local:
```bash
python -m http.server 8000
# o
npx serve
```

## Despliegue

### URL del Proyecto

**URL esperada:** https://exp-dis-noise.pages.dev

(La URL puede variar según la configuración de Cloudflare. Verifica en el dashboard para la URL exacta)

### Cloudflare Pages (Recomendado)

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Selecciona "Pages" en el menú
3. Conecta tu repositorio de GitHub
4. Configura el build:
   - Framework preset: None
   - Build command: (dejar vacío)
   - Build output: `.`
5. Despliega

O usa el script de despliegue:
```bash
./deploy.sh
```

### Usando Wrangler CLI

1. Instala Wrangler:
```bash
npm install -g wrangler
```

2. Autentica:
```bash
wrangler login
```

3. Despliega:
```bash
wrangler pages deploy .
```

### Variables de Entorno

Para el despliegue automático con GitHub Actions, necesitas configurar estos secrets en tu repositorio:
- `CLOUDFLARE_API_TOKEN`: Token de API de Cloudflare
- `CLOUDFLARE_ACCOUNT_ID`: ID de tu cuenta de Cloudflare

## Licencia

MIT

