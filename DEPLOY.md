# Instrucciones de Despliegue en Cloudflare

## URL del Proyecto

La URL del proyecto en Cloudflare Pages será:
**https://exp-dis-noise.pages.dev**

(O puede ser personalizada si configuraste un dominio personalizado)

## Opción 1: Despliegue Manual desde el Dashboard

1. Ve a https://dash.cloudflare.com/
2. Navega a **Workers & Pages** → **Pages**
3. Haz clic en **Create a project**
4. Selecciona **Connect to Git**
5. Conecta tu repositorio de GitHub `exp_dis_noise`
6. Configura el build:
   - **Framework preset:** None
   - **Build command:** (dejar vacío)
   - **Build output directory:** `.`
   - **Root directory:** (dejar vacío o `/`)
7. Haz clic en **Save and Deploy**

La URL aparecerá en el dashboard una vez completado el despliegue.

## Opción 2: Despliegue con Wrangler CLI

### Prerrequisitos

```bash
# Instalar Node.js y npm si no los tienes
sudo apt update
sudo apt install nodejs npm

# Instalar wrangler globalmente
npm install -g wrangler

# O usar npx (no requiere instalación global)
npx wrangler --version
```

### Pasos

```bash
cd /home/sonnyboy/Documents/exp_dis_noise

# Autenticar con Cloudflare
wrangler login

# Desplegar en Cloudflare Pages
wrangler pages deploy . --project-name=exp_dis_noise

# O usando npm script
npm run deploy
```

La URL se mostrará en la salida del comando después del despliegue.

## Opción 3: Despliegue Automático con GitHub Actions

Si ya tienes configurados los secrets en GitHub:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

El despliegue se hará automáticamente cuando hagas push a la rama `main`.

## Verificar el Despliegue

Una vez desplegado, puedes verificar la URL en:
1. Cloudflare Dashboard → Workers & Pages → Pages → `exp_dis_noise`
2. La URL estará visible en la página del proyecto

## Nota

Si la URL predeterminada no está disponible, Cloudflare puede asignar una URL diferente. Verifica siempre en el dashboard de Cloudflare para obtener la URL exacta.

