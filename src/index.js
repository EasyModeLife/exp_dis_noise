/**
 * Cloudflare Worker para servir la aplicación estática
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Obtener la ruta del archivo solicitado
    let pathname = url.pathname;
    
    // Si es la raíz, servir index.html
    if (pathname === '/' || pathname === '') {
      pathname = '/index.html';
    }
    
    // Construir la ruta completa del archivo
    const filePath = `.${pathname}`;
    
    try {
      // Intentar obtener el archivo del bucket
      const file = await env.ASSETS.fetch(new URL(pathname, request.url));
      
      if (file.status === 404) {
        // Si no se encuentra, intentar servir index.html (SPA routing)
        return await env.ASSETS.fetch(new URL('/index.html', request.url));
      }
      
      // Retornar el archivo con los headers apropiados
      const contentType = getContentType(pathname);
      const response = new Response(file.body, file);
      response.headers.set('Content-Type', contentType);
      
      // Headers de CORS si es necesario
      response.headers.set('Access-Control-Allow-Origin', '*');
      
      return response;
    } catch (error) {
      // En caso de error, retornar error 500
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

function getContentType(pathname) {
  const ext = pathname.split('.').pop().toLowerCase();
  const contentTypes = {
    'html': 'text/html; charset=utf-8',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'eot': 'application/vnd.ms-fontobject',
  };
  
  return contentTypes[ext] || 'text/plain';
}

