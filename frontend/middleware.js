import { NextResponse } from 'next/server';

export function middleware(request) {
  // Verificar si la URL es la de callback
  if (request.nextUrl.pathname === '/callback') {
    // Obtener los parámetros de error
    const searchParams = request.nextUrl.searchParams;
    const error = searchParams.get('error');
    
    // Si el error es access_denied, redirigir a sign-in
    if (error === 'access_denied') {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  // Para cualquier otra ruta, continuar normalmente
  return NextResponse.next();
}

// Configurar en qué rutas se ejecutará el middleware
export const config = {
  matcher: '/callback',
}; 