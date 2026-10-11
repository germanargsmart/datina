# Suscripción por correo: cómo hacerla funcionar

Escrito el 11 de octubre de 2026. Los cambios en Netlify los hace el autor desde su cuenta: un agente no toca la configuración de los servidores.

## Qué hay hoy en el sitio

- Un formulario en el pie de todas las páginas: "Novedades por correo", el campo con `nombre@ejemplo.com` de ejemplo y el botón "Avisarme".
- Es un formulario de Netlify (Netlify Forms) llamado `suscripcion`. Guarda cada correo en la cuenta de Netlify del sitio.
- Con el código del sitio, se envía sin salir de la página. El botón dice "Enviando" y después "Anotado", y debajo aparece "Listo, tu correo quedó anotado". Si falla, dice "No se pudo enviar. Probá de nuevo en un rato".
- Tiene un campo trampa invisible contra los programas que mandan basura (`no-completar`).
- **Solo funciona con el sitio publicado en Netlify.** En la computadora (`python -m http.server`) o en GitHub Pages el envío falla, porque no hay nadie del otro lado que lo reciba.

## Pasos en Netlify (una sola vez)

1. **Publicar el sitio en Netlify**, si todavía no está:
   - En app.netlify.com, "Add new site" o "Add new project", después "Import an existing project" y GitHub.
   - Elegir el repositorio `datina`.
   - La carpeta de publicación (`sitio`) ya está en `netlify.toml`, así que no hace falta escribir ningún comando de armado.
2. **Activar los formularios:**
   - Dentro del sitio, ir a la configuración ("Site configuration" o "Project configuration") y abrir "Forms".
   - Tocar "Enable form detection".
3. **Volver a publicar**, para que Netlify lea las páginas y registre los formularios `suscripcion` y `contacto`: en "Deploys", "Trigger deploy" y después "Deploy site".
4. **Probar:**
   - Abrir el sitio publicado, escribir un correo propio y tocar "Avisarme". El botón tiene que decir "Anotado".
   - En Netlify, en "Forms", el formulario `suscripcion` tiene que mostrar el correo.
5. **Recibir un aviso por cada suscripción (opcional):**
   - En "Forms", abrir "Form notifications" y tocar "Add notification".
   - Elegir "Email notification", el formulario `suscripcion` y el correo del autor.

Los nombres de los menús de Netlify cambian con el tiempo. Si alguno no aparece, buscar "Forms" en la configuración del sitio.

## Mandar las novedades

Netlify solo junta la lista: no manda boletines. Hay dos caminos.

- **A mano, para pocos suscriptores:**
  - En "Forms", abrir `suscripcion`, descargar la lista en CSV y escribir el aviso desde el correo del autor.
  - Poner las direcciones en copia oculta (CCO), nunca en "Para".
  - Cada persona que pida la baja se borra a mano de la lista.
- **Con un servicio de boletines (recomendado si la lista crece):** por ejemplo Buttondown, MailerLite o Brevo, que tienen planes gratis para empezar (revisar los límites en la página de cada uno). Estos servicios:
  - mandan el correo de confirmación;
  - ponen en cada envío el enlace para darse de baja;
  - guardan la lista.

  Para pasar a uno: crear la cuenta y copiar la dirección a la que su formulario manda los datos (la "action" del formulario que ofrecen para insertar). Con esa dirección, se cambia el formulario del pie para que mande ahí en lugar de a Netlify. Es un cambio chico en `scripts/plantilla.html` y en `datina.js`.

## A tener en cuenta

- El plan gratis de Netlify tiene un tope mensual de envíos de formularios. El número está en la página de precios de Netlify.
- Una lista de correos es una base de datos personales (en la Argentina, Ley 25.326 de Protección de los Datos Personales). Hay que decir en algún lugar visible para qué se usa el correo y cómo darse de baja. El pie ya no lo dice, por pedido del autor del 11 de octubre de 2026: desde el mismo día está en Sobre nosotros, "Tus datos" (`nosotros.html#privacidad`).
- Esto no es asesoramiento legal.
