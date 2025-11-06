# E-commerce Microservices

Este proyecto contiene múltiples microservicios para un sistema de e-commerce.

## Servicios

### 1. ecommerce_auth_node

Servicio de autenticación y gestión de usuarios, fue modificado para poder agregar el campo email en el usuario y además envía notificaciones al actualizar contraseña, registrarse y deshabilitar un usuario.

### 2. ecommerce_cart_node

Servicio de gestión del carrito de compras, fue modificado para poder enviar un email al realizar una orden de compra.

### 3. notifications-email

Servicio de gestión y envío de notificaciones por email.

## Requisitos Previos

- Node.js (v14 o superior)
- npm
- Docker y Docker Compose

## Instalación

Instalar las dependencias de cada servicio:

```bash
# Auth Service
cd ecommerce_auth_node
npm install

# Cart Service
cd ../ecommerce_cart_node
npm install

# Notifications Email Service
cd ../notifications-email
npm install
```

## Ejecución de Servicios

### Servicios en Docker

Los servicios restantes (base de datos, RabbitMQ, etc.) deben ejecutarse en Docker

### Auth Service

```bash
cd ecommerce_auth_node
npm run watch
```

### Cart Service

```bash
cd ecommerce_cart_node
npm run watch
```

### Notifications Email Service

```bash
cd notifications-email
npm run dev
```

## Estructura del Proyecto

```
.
├── ecommerce_auth_node/       # Servicio de autenticación
├── ecommerce_cart_node/       # Servicio de carrito
└── notifications-email/       # Servicio de notificaciones email
```

## Notas

- Asegurarse de tener configurados los archivos `.env` en cada servicio antes de ejecutarlos.
- Los demás servicios de infraestructura deben estar corriendo en Docker antes de iniciar los servicios.
