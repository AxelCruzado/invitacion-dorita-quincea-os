# XV años de Dorita

Invitación de una sola página con Vite. Usa Node.js 22.12 o posterior.

```sh
npm install
npm run dev
```

Para compilar y revisar la versión de producción:

```sh
npm run build
npm run preview
```

## Despliegue en Vercel

Importa el repositorio desde GitHub, selecciona la rama de producción `main`, el directorio raíz del repositorio y el preset **Vite**. Usa `npm install` para instalar, `npm run build` para compilar y `dist` como directorio de salida. Pulsa **Deploy**. Cuando la integración Git esté activa, cada push a `main` generará un despliegue de producción.

## Personalización

- Sustituye `public/img/dorita.jpg` por la foto de Dorita. El archivo inicial es un monograma.
- Para cambiar la canción, sustituye `public/audio/musica.mp3`.
- Edita los nombres de padrino y madrina en el objeto `datos` al principio de `src/main.js`.
- Las ilustraciones están en `public/img/`. Las dos animaciones originales en formato Lottie están en `public/lottie/`. Conserva los nombres al reemplazarlas. El farol usa la ilustración `public/img/farol.png`.

La hora del evento se define con el desplazamiento UTC−5 y se muestra en America/Lima. El enlace de WhatsApp abre un borrador que cada invitado puede revisar. El mapa externo se carga al pulsar «Ver mapa aquí».
