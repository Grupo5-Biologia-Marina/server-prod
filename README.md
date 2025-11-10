# 🌊 Proyecto Backend - Biología Marina

Este proyecto es la **API** del sistema de **Biología Marina**, gestionando publicaciones, usuarios y descubrimientos del océano.  
Está desarrollado con **Node.js**, **TypeScript**, **Express** y **Sequelize** para conectarse a **TiDB Cloud** (antes Railway).  
Es una adaptación del repositorio original *https://github.com/Grupo5-Biologia-Marina/server*.  
Permite almacenar posts, categorías, imágenes y likes, con autenticación segura mediante JWT y envío de notificaciones por correo electrónico.  

---

## 🚀 Tecnologías principales

- **Lenguaje:** TypeScript  
- **Framework:** Express  
- **Base de datos:** TiDB Cloud (MySQL compatible, con SSL)  
- **ORM:** Sequelize  
- **Autenticación y seguridad:** Bcrypt, JWT, Validator  
- **Subida de archivos y almacenamiento:** Multer, Cloudinary  
- **Correo electrónico:** Nodemailer  
- **Desarrollo y utilidades:** ts-node, ts-node-dev, ESLint, UUID, Dotenv   

---

## ⭐ Funcionalidades

### 🧱 Base de datos relacional
- Conexión a TiDB Cloud mediante Sequelize, con SSL y configuración segura.  
- Tablas: `Users`, `Posts`, `Categories`, `Post_Images`, `Likes`, `Post_Categories`.  
- Migraciones y seeders preparados para inicializar el sistema.  

### 🔐 Autenticación y roles
- Registro, login y logout con JWT.  
- Roles: `user` (básico) y `admin` (gestión total de posts y categorías).  
- Middlewares de autorización para proteger rutas.  

### 🗂️ Gestión de categorías
- Clasificación de posts por categorías temáticas.  
- Relación N:M entre posts y categorías (`Post_Categories`).  

### ❤️ Likes
- Usuarios pueden dar o quitar “me gusta” en publicaciones.  
- Tabla intermedia `Likes` gestionada desde `LikeController`.  

### 🖼️ Imágenes
- Integración con Cloudinary para subir imágenes.  
- Metadatos opcionales: créditos, descripción.  

### 📧 Notificaciones
- Correo de bienvenida automático al registrarse.  
- Configurable mediante variables de entorno.  

### 🔄 Backup
- Ruta `/backup` para generar un JSON de toda la base de datos.  

---

## 📂 Estructura del proyecto

```
server/
├── src/
├ ├──server.ts                               # Punto de entrada del servidor
│ ├── controllers/                          # Controladores de la lógica de negocio
│ │   ├── AuthController.ts  
│ │   ├── CategoryController.ts  
│ │   ├── LikeController.ts  
│ │   ├── PostController.ts  
│ │   ├── PostImagesController.ts  
│ │   └── UserController.ts        
│ ├── database/                             # Configuración y conexión DB
│ │   ├── config.js 
│ │   └── db_connection.ts
│ ├── middlewares/                          # Middlewares (auth, validaciones, etc.)
│ │   ├── authMiddleware.ts 
│ │   ├── roleMiddleware.ts 
│ │   └── validationMiddleware.ts
│ ├── migrations/                           # Migraciones de Sequelize
│ │   ├── 001-create-users.js
│ │   ├── 002-create-posts.js 
│ │   ├── 003-create-categories.js
│ │   ├── 004-create-post-categories.js
│ │   ├── 005-create-post-image.js
│ │   └── 006-create-likes.js
│ ├── models/                               # Modelos Sequelize (Users, Posts, Categories…)
│ │   ├── CategoryModel.ts
│ │   ├── LikeModel.ts 
│ │   ├── PostImageModel.ts
│ │   ├── PostModel.ts
│ │   └── UserModel.ts
│ ├── routes/                               # Definición de rutas
│ │   ├── authRoutes.ts
│ │   ├── backupRoutes.ts
│ │   ├── likeRoutes.ts
│ │   ├── postImagesRoutes.ts 
│ │   ├── postRoutes.ts
│ │   └── userRoutes.ts
│ ├── seeders/                              # Seeders de Sequelize
│ │   ├── 001-admin-user.js
│ │   ├── 002-categories.js 
│ │   ├── 003-admin-posts.js
│ │   ├── 004-admin-posts-categories.js
│ │   ├── 005-admin-posts-img.js
│ │   └── 006-admin-likes.js
│ ├── types/                                # Definiciones TS (DTOs, interfaces, etc.)
│ │   ├── auth.ts
│ │   ├── category.ts
│ │   └── posts.ts
│ ├── utils/                                # Configuración de Cloudinary y Nodemailer
│ │   ├── cloudinary.ts
│ │   └── mailer.ts 
│ ├── validators/                           # Validadores
│ │   ├── authValidations.ts
│ │   └── postValidations.ts 
│ └── app.ts                                # Configuración de Express
├── .env                                    # Credenciales
├── .env.example                            # Modelo de .env
├── .gitignore                              # Archivos que no se suben a GitHub
├── .sequelizerc                            # Configuración Sequelize
├── docker-compose.yml                      # Configuración Docker
├── backup_local.sql                        # Dump copia de seguridad de la base de datos
├── package-lock.json                       # Dependencias
├── package.json                            # Dependencias
├── README.md                               # Documentación
└── tsconfig.json                           # Configuración TypeScript

```
---

## 🗄️ Modelo de datos

<img src="src/assets/database-schema.png" alt="Esquema de la base de datos" width="600"/>

### Users
| Field      | Type               | Extra           | Null   |
|------------|--------------------|-----------------|--------|
| id         | int unsigned (PK)  | auto_increment  |no      |
| username   | varchar(50)        | único           |no      |
| firstname  | varchar(50)        |                 |yes     |
| lastname   | varchar(50)        |                 |yes     |
| email      | varchar(100)       | único           |no      |
| password   | varchar(255)       |                 |no      |
| role       | enum(user, admin)  | default: user   |no      |
| img        | varchar(500)       |                 |yes     |
| createdAt  | datetime           |                 |no      |
| updatedAt  | datetime           |                 |no      |

### Posts
| Field      | Type               | Extra           | Null   |
|------------|--------------------|-----------------|--------|
| id         | int unsigned (PK)  | auto_increment  |no      |
| userId     | int unsigned (FK)  | ref: users.id   |no      |
| title      | varchar(255)       |                 |no      |
| content    | text               |                 |no      |
| credits    | varchar(500)       |                 |yes     |
| createdAt  | datetime           |                 |no      |
| updatedAt  | datetime           |                 |no      |

### Likes (tabla intermedia)
| Field       | Type              | Extra               | Null   |
|-------------|-------------------|---------------------|--------|
| postId      | int unsigned (FK) | ref: posts.id       |no      |
| userId      | int unsigned (FK) | ref: user.id        |no      |

### Categories
| Field      | Type               | Extra           | Null   |
|------------|--------------------|-----------------|--------|
| id         | int unsigned (PK)  | auto_increment  |no      |
| name       | varchar(100)       | unique          |no      |
| description| varchar(255)       |                 |yes     |
| img        | varchar(500)       |                 |yes     |

### Post_Categories (tabla intermedia)
| Field       | Type              | Extra               | Null   |
|-------------|-------------------|---------------------|--------|
| postId      | int unsigned (FK) | ref: posts.id       |no      |
| categoryId  | int unsigned (FK) | ref: categories.id  |no      |

### Post_Images
| Field      | Type               | Extra              | Null   |
|------------|--------------------|--------------------|--------|
| id         | int unsigned (PK)  | auto_increment     |no      |
| postId     | int unsigned (FK)  | ref: categories.id |no      |
| url        | varchar(500)       |                    |no      |
| caption    | varchar(500)       |                    |yes     |
| credit     | varchar(500)       |                    |yes     |
| createdAt  | datetime           |                    |no      |
| updatedAt  | datetime           |                    |no      |


---

## 📌 Endpoints principales

### Auth
- `POST /auth/register` → registrar un nuevo usuario.  
- `POST /auth/login` → autenticar usuario y devolver token.  
- `POST /auth/logout` → cierra sesión.  

### Users
- `GET /users` (admin) → listar usuarios.  
- `GET /users/:id` → obtener usuario por id.  
- `PATCH /users/:id` → actualiza la información de un usuario.
- `PATCH /users/:id/role` (admin) → cambia el rol del usuario.

### Posts
- `GET /posts` → listar todos los posts.  
- `GET /posts/:id` → obtener post por id. 
- `GET /my-posts/`  -> obtiene posts por UserId 
- `POST /posts` (admin o user autentificado) → crear post.  
- `PATCH /posts/:id` (admin o user autentificado autor) → actualiza un post  
- `DELETE /posts/:id` (admin o user autentificado autor) → eliminar post.  

### Images
- `POST /:postId/images` → añadir una imagen a un post. 

### Likes
- `GET /posts/:id/likes` → recoge los likes.  
- `POST /posts/:id/likes` → dar o quitar like 

### Backup de la base de datos
- `GET /backup` → al ejecutarse se crea un archivo json con los datos que están almacenados en Railway .  

---

## 📥 Ejemplos de requests

### Registro
```
POST /auth/register
{
  "username": "Medusa",
  "firstname": "Ana",
  "lastname": "Sánchez",
  "email": "medusa@example.com",
  "password": "supersecret"
}
```

### Login
```
POST /auth/login
{
  "email": "ady@example.com",
  "password": "supersecret"
}
```

### Response
```
{
  "success": true,
  "token": "<JWT_TOKEN>"
}
```

### Crear post (admin)
```
POST /posts
Authorization: Bearer <JWT_TOKEN>
{
  "content": "Nuevo descubrimiento en aguas profundas",
  "categoryIds": [1, 2]
}
```
---
## 🌐 Documentación Postman

Consulta toda la documentación de la API haciendo clic en el logo:

<div align="center">
  <a href="https://documenter.getpostman.com/view/46421338/2sB3QQH77t">
    <img src="src/assets/postman.jpg" alt="Postman" width="120"/>
  </a>
</div>

---
## ⚙️ Instalación y uso

### Clonar el repo
```
git clone https://github.com/Grupo5-Biologia-Marina/server-prod.git
cd server-prod
```

### Instalar dependencias
```
npm install
```

### Configuración según entorno:

#### Local (TiDB Cloud)

1. Crear la base de datos y el usuario desde TiDB Cloud Console o Workbench:
    ```
    CREATE DATABASE server_prod_biologia_marina;
    ```

2. Sustituir el archivo `.env` compartido en Discord:
    ```
    DB_NAME=server_prod_biologia_marina
    DB_USER=appuser
    DB_PASSWORD=password
    DB_HOST=<host-tiDB>
    DB_PORT=4000
    DB_DIALECT=mysql
    JWT_SECRET=<tu_jwt_secret>
    
    CLOUDINARY_CLOUD_NAME=<cloud_name>
    CLOUDINARY_API_KEY=<api_key>
    CLOUDINARY_API_SECRET=<api_secret>

    EMAIL_USER=<email>
    EMAIL_APP_PASS=<email_app_pass>
    FRONTEND_URL=http://localhost:5173
    APP_PORT=4000
    ```

5. Iniciar el servidor:
    ```
    npx tsc
    node dist/server.js
    ```
---

#### Producción (TiDB Cloud)

1. Se ha creado el proyecto en TiDB Cloud y hemos obtenido las credenciales.

2. Rellenar `.env` con las credenciales del proyecto.

3. Importar la base de datos desde el dump `backup_local.sql`:
    ```bash
    mysql -h <host> -P <puerto> -u <usuario> -p <nombre_de_la_db> < backup_local.sql
    ```

4. Iniciar servidor apuntando a la base de datos de TiDB:
    ```
    npx ts-node server.ts
    ```
---
## 👩🏻‍💻​ Creadoras

[🚢 Aday 🦈](https://github.com/Aday25) • [Irina 🐙](https://github.com/irinatiron) • [Julia 🐠](https://github.com/juliazmor) • [Luisa 🐬](https://github.com/luisasilva99) • [Valentina 🐡](https://github.com/ValenMontilla7)


---

## 📌 Notas

- Por defecto, el primer usuario creado debería ser admin (configurable).
- Railway ofrece servicio gratuito 30 días por lo que hemos gestionado el traspaso a TiDB. 
