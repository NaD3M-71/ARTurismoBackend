# ARTurismo — Backend

API REST para la plataforma de turismo ARTurismo. Gestiona ciudades, proveedores de servicios turísticos, autenticación de administradores, categorías, consultas y configuración general del sitio.

## Stack tecnológico

- **Node.js** + **Express**
- **MongoDB** (via Mongoose) — base de datos en la nube con MongoDB Atlas
- **JWT** — autenticación con tokens
- **bcrypt** — hasheo de contraseñas
- **Multer** + **nanoid** — upload y nombrado de imágenes
- **Nodemailer** — envío de emails a potenciales proveedores
- **dotenv** — gestión de variables de entorno
- **CORS** — configurado para el dominio del frontend

## Requisitos

- Node.js v18+
- Una base de datos MongoDB (local o Atlas)

## Instalación

```bash
npm install
```

## Variables de entorno

Crear un archivo `variables.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=5000

DB_CONNECTION=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/<nombre_db>

SECRETKEY=tu_clave_secreta_jwt

FRONTEND_URL=http://localhost:5173

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor con `node --watch` |
| `npm run server` | Inicia el servidor con `nodemon` (requiere nodemon global o como devDependency) |

## Endpoints de la API

### Generales
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | No | Health check |
| GET | `/busqueda` | No | Búsqueda unificada de ciudades y proveedores |

### Autenticación
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/login` | No | Login de administrador |
| POST | `/register` | Sí | Registro de nuevo usuario administrador |
| GET | `/usuarios` | Sí | Listar todos los usuarios |
| DELETE | `/usuarios/:usuarioId` | Sí | Eliminar usuario |

### Ciudades
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/ciudades` | No | Listar todas las ciudades |
| GET | `/ciudades/:ciudadId` | No | Obtener una ciudad |
| POST | `/ciudades/busqueda/:query` | No | Buscar ciudades por nombre |
| POST | `/ciudades` | Sí | Agregar ciudad (con imagen) |
| PUT | `/ciudades/:idCiudad` | Sí | Actualizar ciudad (con imagen) |
| DELETE | `/ciudades/:idCiudad` | Sí | Eliminar ciudad |

### Proveedores (Clientes)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/clientes` | No | Listar todos los proveedores |
| GET | `/clientes/:idCliente` | No | Obtener un proveedor |
| GET | `/clientes/ciudad/:ciudadNombre` | No | Proveedores por ciudad |
| POST | `/clientes` | Sí | Agregar proveedor (con imágenes) |
| PUT | `/clientes/:idCliente` | Sí | Actualizar proveedor |
| DELETE | `/clientes/:idCliente` | Sí | Eliminar proveedor |
| DELETE | `/clientes/:idCliente/imagen` | Sí | Eliminar imagen de un proveedor |

### Configuración
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/configuracion/banner` | No | Obtener banner principal |
| PUT | `/configuracion/banner` | Sí | Actualizar banner principal |

### Consultas
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/consultas` | No | Crear consulta (formulario público) |
| GET | `/consultas` | Sí | Listar todas las consultas |
| PUT | `/consultas/:id` | Sí | Actualizar estado de una consulta |
| DELETE | `/consultas/:id` | Sí | Eliminar consulta |
| POST | `/consultas/email` | Sí | Enviar email de respuesta al proveedor |

### Categorías
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/categorias` | No | Listar categorías |
| GET | `/categorias/grupos` | No | Listar grupos de categorías |
| POST | `/categorias` | Sí | Crear categoría |
| DELETE | `/categorias/:id` | Sí | Eliminar categoría |

> Las rutas marcadas con **Sí** en Auth requieren el header `Authorization: Bearer <token>`.

## Imágenes

Las imágenes subidas se almacenan en la carpeta `uploads/` y se sirven como archivos estáticos en la ruta `/uploads/<nombre_archivo>`.

## Estructura del proyecto

```
ARTurismoBackend/
├── controllers/
│   ├── autenticacionController.js
│   ├── busquedaController.js
│   ├── categoriasController.js
│   ├── ciudadesController.js
│   ├── clientesController.js
│   ├── configuracionController.js
│   └── consultasController.js
├── middleware/
│   └── auth.js              # Validación de JWT
├── models/
│   ├── Categorias.js
│   ├── Ciudades.js
│   ├── Clientes.js
│   ├── Configuracion.js
│   ├── Consultas.js
│   └── Usuarios.js
├── routes/
│   └── index.js             # Definición de todas las rutas
├── scripts/
│   └── seedAdmin.js         # Script para crear el primer admin
├── uploads/                 # Imágenes subidas (no versionar)
├── index.js                 # Punto de entrada del servidor
├── package.json
└── variables.env            # Variables de entorno (no versionar)
```
