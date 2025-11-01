# Pasos para desplegar en Cloudflare Pages

El repositorio ya está creado en GitHub: https://github.com/EasyModeLife/exp_dis_noise

## Opción 1: Despliegue desde Cloudflare Dashboard (Más fácil)

1. Ve a https://dash.cloudflare.com/
2. Navega a **Workers & Pages** → **Create a project**
3. Selecciona **Connect to Git**
4. Autoriza Cloudflare a acceder a tu cuenta de GitHub
5. Selecciona el repositorio **EasyModeLife/exp_dis_noise**
6. Configura el build:
   - **Framework preset:** None
   - **Build command:** (dejar vacío)
   - **Build output directory:** `.`
   - **Root directory:** (dejar vacío)
7. Haz clic en **Save and Deploy**

Cloudflare generará automáticamente la URL: `https://exp-dis-noise.pages.dev`

## Opción 2: Instalar wrangler y usar CLI

Si prefieres usar la línea de comandos:

```bash
# Instalar Rust/Cargo primero
sudo apt install cargo

# Instalar wrangler
cargo install wrangler --locked

# O usar npm si está disponible
npm install -g wrangler

# Autenticar
wrangler login

# Desplegar
cd /home/sonnyboy/Documents/exp_dis_noise
wrangler pages deploy . --project-name=exp_dis_noise
```

## Verificar el despliegue

Una vez desplegado, la URL estará disponible en:
- Cloudflare Dashboard → Workers & Pages → Pages → exp_dis_noise

