# Microservicio de Email Notifications

## Casos de uso

### CU: AB Component

- Precondicion: El Usuario debe ser Administrador

- Camino normal:

  **Alta de Component:**

  - El admin proporciona un nombre y el contenido HTML del componente (ya sea escribiéndolo directo o subiendo un archivo HTML)
  - El sistema valida que el nombre y el HTML sean válidos. Si no cumplen las validaciones, devuelve error con los detalles
  - Se extraen automáticamente las variables del tipo {{variable}} que están en el HTML
  - Se crea el nuevo componente en la base de datos

  **Baja de Component:**

  - El admin solicita eliminar un componente específico por su ID
  - El sistema busca si el componente existe y no está ya eliminado. Si no existe, devuelve error
  - Se verifica que ningún template esté usando ese componente. Si está en uso, devuelve error
  - Si no está en uso, se hace una baja lógica

### CU: AB Template

- Precondición: El Usuario debe ser Administrador

- Camino normal:

  **Alta de Template:**

  - El admin proporciona un nombre y el contenido HTML del template (ya sea escribiéndolo directo o subiendo un archivo HTML)
  - El sistema valida que el nombre y el HTML sean válidos. Si no cumplen las validaciones, devuelve error con los detalles
  - Se extraen automáticamente las variables del tipo {{variable}} y los components del tipo {{>componentName}} que están en el HTML
  - Se verifica que todos los components referenciados existan en la base de datos. Si algún component no existe, devuelve error
  - Se agregan las variables de los components a la lista de variables aceptadas del template
  - Se verifica que no hayan duplicados en las variables
  - Se crea el nuevo template en la base de datos

  **Baja de Template:**

  - El sistema busca si el template existe. Si no existe, devuelve error
  - Se hace una baja lógica

- Caminos alternativos:

### CU: Consultar templates

- Precondición: El Usuario debe ser Administrador

- Camino normal:

  - El sistema busca todos los templates que no estén dados de baja
  - Se reemplaza el contenido de HTML que tenga cada Component del Template
  - Se devuelve la lista de templates

### CU: Consultar components

- Precondición: El Usuario debe ser Administrador

- Camino normal:

  - El sistema busca todos los components que no estén dados de baja
  - Se devuelve la lista de components

### CU: Enviar email

- Precondición:

- Camino normal:

  - El sistema recibe por RabbitMQ una solicitud de envío de email con: template_id, to_email y variables
  - Se busca el template. Si no existe o está eliminado, devuelve error
  - Se obtienen los components referenciados en el template. Si algún component no existe o está eliminado, devuelve error
  - Se reemplazan las variables {{variable}} en el HTML del template con los valores proporcionados
  - Se reemplazan los components {{>componentName}} con su contenido HTML correspondiente
  - Se reemplazan las variables de los components con los valores proporcionados
  - Se genera el HTML final completo (final_body_html)
  - Se crea una instancia de email en la base de datos
  - Se envía el email al destinatario especificado

## Modelo de datos

**Email**

- \_id: String

- to_email: String

- final_body_html: String

- template_id: String

- deleted_at: Date

- created_at: Date

- updated_at: Date

**Template**

- \_id: String

- name: String

- raw_html: String

- variables_accepted: [String]

- deleted_at: Date

- created_at: Date

- updated_at: Date

**Component**

- \_id: String

- name: String

- html_content: String

- variables_accepted: [String]

- deleted_at: Date

- created_at: Date

- updated_at: Date

## Interfaz REST

### Gestión de Components

#### Crear Component

`POST /api/component`

**Content-Type**

- `application/json` (para mandarlo por Body)
- `multipart/form-data` (para subir archivo HTML)

**Body (application/json)**

```json
{
  "name": "HeaderComponent",
  "html_content": "<div class='header'><h1>{{title}}</h1></div>"
}
```

**Body (multipart/form-data)**

- `name`: Nombre del componente
- `file`: Archivo HTML (opcional)

**Response**

`201 CREATED`

```json
{
  "data": {
    "_id": "6507f1f130c72319ebf28a8c",
    "name": "HeaderComponent",
    "html_content": "<div class='header'><h1>{{title}}</h1></div>",
    "variables_accepted": ["title"],
    "deleted_at": null,
    "createdAt": "2023-09-18T10:30:00.000Z",
    "updatedAt": "2023-09-18T10:30:00.000Z"
  }
}
```

`400 BAD REQUEST`

```json
{
  "error": "Debe proporcionar un archivo HTML o contenido HTML en el cuerpo de la solicitud"
}
```

Si no se incluye el HTML

`400 BAD REQUEST`

```json
{
  "error": "{\"formErrors\":[],\"fieldErrors\":{\"name\":[\"Name is required\"]}}"
}
```

Si los datos no son válidos

#### Obtener todos los Components

`GET /api/component`

**Response**

`200 OK`

```json
{
  "data": [
    {
      "deleted_at": null,
      "_id": "68a1380cc204ef29820d8b69",
      "name": "Header",
      "html_content": "<tr>\n    <td class=\"header\"\n        style=\"background-color: #345C72; padding: 40px; text-align: center; color: white; font-size: 24px;\">\n        {{children}}\n    </td>\n</tr>",
      "variables_accepted": [],
      "fecha_baja": null,
      "createdAt": "2025-08-17T02:01:48.896Z",
      "updatedAt": "2025-08-17T02:01:48.896Z"
    },
    {
      "deleted_at": null,
      "_id": "68a13816c204ef29820d8b6b",
      "name": "Footer",
      "html_content": "<tr>\n    <td class=\"footer\"\n        style=\"background-color: #333333; padding: 40px; text-align: center; color: white; font-size: 14px;\">\n        {{children}}\n    </td>\n</tr>",
      "variables_accepted": [],
      "fecha_baja": null,
      "createdAt": "2025-08-17T02:01:58.861Z",
      "updatedAt": "2025-08-17T02:01:58.861Z"
    }
  ]
}
```

#### Eliminar Component

`DELETE /api/component/{id}`

**Params path**

- `id`: ID del componente

**Response**

`204 NO CONTENT`

Si se eliminó correctamente

`404 NOT FOUND`

```json
{
  "error": "Component not found"
}
```

Si el componente no existe

`409 CONFLICT`

```json
{
  "error": "Component is in use"
}
```

Si el componente está siendo usado por algún template

### Gestión de Templates

#### Crear Template

`POST /api/template`

**Content-Type**

- `application/json` (para envío directo de datos)
- `multipart/form-data` (para subir archivo HTML)

**Body (application/json)**

```json
{
  "name": "WelcomeTemplate",
  "raw_html": "<html><body>{{>HeaderComponent}}<p>Bienvenido {{username}}!</p></body></html>"
}
```

**Body (multipart/form-data)**

- `name`: WelcomeTemplate
- `file`: Archivo HTML

**Response**

`201 CREATED`

```json
{
  "data": {
    "_id": "6507f1f130c72319ebf28a8d",
    "name": "WelcomeTemplate",
    "raw_html": "<html><body>{{>HeaderComponent}}<p>Bienvenido {{username}}!</p></body></html>",
    "variables_accepted": ["title", "username"],
    "createdAt": "2023-09-18T10:30:00.000Z",
    "updatedAt": "2023-09-18T10:30:00.000Z"
  }
}
```

`400 BAD REQUEST`

```json
{
  "error": "Debe proporcionar un archivo HTML o contenido HTML en el cuerpo de la solicitud"
}
```

Si no se envía el HTML

`400 BAD REQUEST`

```json
{
  "error": "{\"formErrors\":[],\"fieldErrors\":{\"name\":[\"Name is required\"]}}"
}
```

Si los datos no son válidos

`404 NOT FOUND`

```json
{
  "error": "Component Layout not found"
}
```

Si el component referenciado no existe

#### Obtener todos los Templates

`GET /api/template`

**Response**

`200 OK`

```json
{
  "data": [
    {
      "id": "68a503258bcf37c230cd71bc",
      "name": "Bienvenida",
      "raw_html": "{{>Layout}}\r\n    {{>Header}}\r\n    Bienvenido/a {{nombre_usuario}}!\r\n    {{/Header}}\r\n\r\n    {{>Body}}\r\n    <h2 style=\"color: #345C72; margin-bottom: 20px;\">¡Bienvenido/a {{nombre_usuario}}!</h2>\r\n\r\n    <p>¡Gracias por registrarte en nuestra plataforma! Estamos muy emocionados de tenerte como parte de nuestra comunidad.\r\n    </p>\r\n\r\n    <p>Tu cuenta ha sido creada exitosamente con los siguientes datos:</p>\r\n\r\n    <div\r\n        style=\"background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #345C72;\">\r\n        <p><strong>Email:</strong> {{email_usuario}}</p>\r\n        <p><strong>Nombre de usuario:</strong> {{nombre_usuario}}</p>\r\n    </div>\r\n\r\n    <h3 style=\"color: #345C72; margin-top: 30px;\">¿Qué puedes hacer ahora?</h3>\r\n\r\n    <ul style=\"margin-left: 20px; line-height: 1.8;\">\r\n        <li>Completa tu perfil para una mejor experiencia</li>\r\n        <li>Explora todas las funcionalidades disponibles</li>\r\n        <li>Únete a nuestra comunidad y conecta con otros usuarios</li>\r\n        <li>Configura tus preferencias de notificaciones</li>\r\n    </ul>\r\n\r\n    <p style=\"font-style: italic; color: #666;\">¡Esperamos que disfrutes tu experiencia con nosotros!</p>\r\n    {{/Body}}\r\n\r\n    {{>Footer}}\r\n    <p style=\"font-size: 12px; color: #888;\">\r\n        <strong>Nota importante:</strong> Si no te registraste en nuestra plataforma, por favor ignora este correo o\r\n        contacta a nuestro equipo de soporte.\r\n    </p>\r\n    {{/Footer}}\r\n{{/Layout}}",
      "replaced_html": "<!DOCTYPE html>\r\n<html lang=\"es\">\r\n\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\r\n    <title>{{page_title}}</title>\r\n</head>\r\n\r\n\r\n<body>\r\n    <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\r\n        <tr>\r\n            <td align=\"center\" style=\"padding: 20px;\">\r\n                <table class=\"content\" width=\"600\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"\r\n                    style=\"border-collapse: collapse; border: 1px solid #cccccc;\">\r\n                    \r\n    <tr>\n    <td class=\"header\"\n        style=\"background-color: #345C72; padding: 40px; text-align: center; color: white; font-size: 24px;\">\n        \r\n    Bienvenido/a {{nombre_usuario}}!\r\n    \n    </td>\n</tr>\r\n\r\n    <tr>\n    <td class=\"body\" style=\"padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;\">\n        \r\n    <h2 style=\"color: #345C72; margin-bottom: 20px;\">¡Bienvenido/a {{nombre_usuario}}!</h2>\r\n\r\n    <p>¡Gracias por registrarte en nuestra plataforma! Estamos muy emocionados de tenerte como parte de nuestra comunidad.\r\n    </p>\r\n\r\n    <p>Tu cuenta ha sido creada exitosamente con los siguientes datos:</p>\r\n\r\n    <div\r\n        style=\"background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #345C72;\">\r\n        <p><strong>Email:</strong> {{email_usuario}}</p>\r\n        <p><strong>Nombre de usuario:</strong> {{nombre_usuario}}</p>\r\n    </div>\r\n\r\n    <h3 style=\"color: #345C72; margin-top: 30px;\">¿Qué puedes hacer ahora?</h3>\r\n\r\n    <ul style=\"margin-left: 20px; line-height: 1.8;\">\r\n        <li>Completa tu perfil para una mejor experiencia</li>\r\n        <li>Explora todas las funcionalidades disponibles</li>\r\n        <li>Únete a nuestra comunidad y conecta con otros usuarios</li>\r\n        <li>Configura tus preferencias de notificaciones</li>\r\n    </ul>\r\n\r\n    <p style=\"font-style: italic; color: #666;\">¡Esperamos que disfrutes tu experiencia con nosotros!</p>\r\n    \n    </td>\n</tr>\r\n\r\n    <tr>\n    <td class=\"footer\"\n        style=\"background-color: #333333; padding: 40px; text-align: center; color: white; font-size: 14px;\">\n        \r\n    <p style=\"font-size: 12px; color: #888;\">\r\n        <strong>Nota importante:</strong> Si no te registraste en nuestra plataforma, por favor ignora este correo o\r\n        contacta a nuestro equipo de soporte.\r\n    </p>\r\n    \n    </td>\n</tr>\r\n\r\n                </table>\r\n            </td>\r\n        </tr>\r\n    </table>\r\n</body>\r\n\r\n</html>",
      "variables_accepted": ["nombre_usuario", "email_usuario", "page_title"]
    },
    {
      "id": "68a5dfaafe1eb1ed05b0ac62",
      "name": "Cambio de Contraseña",
      "raw_html": "{{>Layout}}\r\n{{>Header}}\r\nCambio de contraseña - {{nombre_usuario}}\r\n{{/Header}}\r\n\r\n{{>Body}}\r\n<h2 style=\"color: #345C72; margin-bottom: 20px;\">Tu contraseña ha sido cambiada exitosamente</h2>\r\n\r\n<p>Hola {{nombre_usuario}}, te informamos que tu contraseña ha sido actualizada correctamente en nuestra plataforma.\r\n</p>\r\n\r\n<p>Los detalles del cambio son los siguientes:</p>\r\n\r\n<h3 style=\"color: #345C72; margin-top: 30px;\">¿No fuiste tú?</h3>\r\n\r\n<p\r\n    style=\"color: #d9534f; background-color: #f2dede; padding: 15px; border-radius: 5px; border-left: 4px solid #d9534f;\">\r\n    <strong>Si no realizaste este cambio:</strong> Tu cuenta podría estar comprometida. Te recomendamos contactar\r\n    inmediatamente a nuestro equipo de soporte.\r\n</p>\r\n\r\n<h3 style=\"color: #345C72; margin-top: 30px;\">Recomendaciones de seguridad:</h3>\r\n\r\n<ul style=\"margin-left: 20px; line-height: 1.8;\">\r\n    <li>Utiliza contraseñas únicas y complejas</li>\r\n    <li>No compartas tus credenciales con terceros</li>\r\n</ul>\r\n\r\n<p style=\"font-style: italic; color: #666;\">Gracias por mantener tu cuenta segura.</p>\r\n{{/Body}}\r\n\r\n{{>Footer}}\r\n<p style=\"font-size: 12px; color: #888;\">\r\n    <strong>Nota importante:</strong> Este es un mensaje automático de seguridad. Si tienes dudas sobre la seguridad de\r\n    tu cuenta, contacta a nuestro equipo de soporte.\r\n</p>\r\n{{/Footer}}\r\n{{/Layout}}",
      "replaced_html": "<!DOCTYPE html>\r\n<html lang=\"es\">\r\n\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\r\n    <title>{{page_title}}</title>\r\n</head>\r\n\r\n\r\n<body>\r\n    <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\r\n        <tr>\r\n            <td align=\"center\" style=\"padding: 20px;\">\r\n                <table class=\"content\" width=\"600\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\"\r\n                    style=\"border-collapse: collapse; border: 1px solid #cccccc;\">\r\n                    \r\n<tr>\n    <td class=\"header\"\n        style=\"background-color: #345C72; padding: 40px; text-align: center; color: white; font-size: 24px;\">\n        \r\nCambio de contraseña - {{nombre_usuario}}\r\n\n    </td>\n</tr>\r\n\r\n<tr>\n    <td class=\"body\" style=\"padding: 40px; text-align: left; font-size: 16px; line-height: 1.6;\">\n        \r\n<h2 style=\"color: #345C72; margin-bottom: 20px;\">Tu contraseña ha sido cambiada exitosamente</h2>\r\n\r\n<p>Hola {{nombre_usuario}}, te informamos que tu contraseña ha sido actualizada correctamente en nuestra plataforma.\r\n</p>\r\n\r\n<p>Los detalles del cambio son los siguientes:</p>\r\n\r\n<h3 style=\"color: #345C72; margin-top: 30px;\">¿No fuiste tú?</h3>\r\n\r\n<p\r\n    style=\"color: #d9534f; background-color: #f2dede; padding: 15px; border-radius: 5px; border-left: 4px solid #d9534f;\">\r\n    <strong>Si no realizaste este cambio:</strong> Tu cuenta podría estar comprometida. Te recomendamos contactar\r\n    inmediatamente a nuestro equipo de soporte.\r\n</p>\r\n\r\n<h3 style=\"color: #345C72; margin-top: 30px;\">Recomendaciones de seguridad:</h3>\r\n\r\n<ul style=\"margin-left: 20px; line-height: 1.8;\">\r\n    <li>Utiliza contraseñas únicas y complejas</li>\r\n    <li>No compartas tus credenciales con terceros</li>\r\n</ul>\r\n\r\n<p style=\"font-style: italic; color: #666;\">Gracias por mantener tu cuenta segura.</p>\r\n\n    </td>\n</tr>\r\n\r\n<tr>\n    <td class=\"footer\"\n        style=\"background-color: #333333; padding: 40px; text-align: center; color: white; font-size: 14px;\">\n        \r\n<p style=\"font-size: 12px; color: #888;\">\r\n    <strong>Nota importante:</strong> Este es un mensaje automático de seguridad. Si tienes dudas sobre la seguridad de\r\n    tu cuenta, contacta a nuestro equipo de soporte.\r\n</p>\r\n\n    </td>\n</tr>\r\n\r\n                </table>\r\n            </td>\r\n        </tr>\r\n    </table>\r\n</body>\r\n\r\n</html>",
      "variables_accepted": ["nombre_usuario", "page_title"]
    }
  ]
}
```

#### Eliminar Template

`DELETE /api/template/{id}`

**Params path**

- `id`: ID del template

**Response**

`204 NO CONTENT`

Si se eliminó correctamente

`404 NOT FOUND`

```json
{
  "error": "Template not found"
}
```

Si el template no existe

## Interfaz asíncrona (RabbitMQ)

### Envío de Email con Template

Escucha mensajes en la cola `email-notifications` del exchange `notifications` (direct consummer)

**Tipo de mensaje**

`send-email`

**Body**

```json
{
  "type": "send-email",
  "message": {
    "to_email": "usuario@example.com",
    "subject": "Bienvenido a nuestra plataforma",
    "template_id": "6507f1f130c72319ebf28a8d",
    "variables": [
      {
        "name": "username",
        "value": "Juan Pérez"
      },
      {
        "name": "title",
        "value": "¡Bienvenido!"
      }
    ]
  }
}
```

### Mensajes de Logout de Auth por RabbitMQ

Escucha mensajes en el exchange `auth` (fanout consumer).

**Tipo de mensaje**

`logout`

**Body ejemplo**

```json
{
  "type": "logout",
  "message": "{tokenId}"
}
```