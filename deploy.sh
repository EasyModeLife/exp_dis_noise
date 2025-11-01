#!/bin/bash

# Script de despliegue para Cloudflare Pages
# Uso: ./deploy.sh

echo "🚀 Desplegando exp_dis_noise a Cloudflare Pages..."

# Verificar si wrangler está instalado
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler no está instalado."
    echo "📦 Instalando wrangler..."
    
    if command -v npm &> /dev/null; then
        npm install -g wrangler
    else
        echo "❌ npm no está instalado. Por favor instálalo primero:"
        echo "   sudo apt install nodejs npm"
        echo ""
        echo "Luego ejecuta: npm install -g wrangler"
        exit 1
    fi
fi

# Verificar si está autenticado
echo "🔐 Verificando autenticación..."
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  No estás autenticado. Ejecutando 'wrangler login'..."
    wrangler login
fi

# Desplegar
echo "📤 Desplegando proyecto..."
wrangler pages deploy . --project-name=exp_dis_noise

echo ""
echo "✅ ¡Despliegue completado!"
echo "🌐 La URL del proyecto debería ser: https://exp-dis-noise.pages.dev"
echo "   (Verifica en el dashboard de Cloudflare para la URL exacta)"

