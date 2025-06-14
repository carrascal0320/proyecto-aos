
# 📘 Documentación de Servicios en Angular con Firebase

## Tabla de Contenidos
- [Introducción](#introducción)
- [AuditoriaService](#auditoriaservice)
- [AuthService](#authservice)
- [UsuarioService](#usuarioservice)
- [Conclusión](#conclusión)

---

## Introducción

Este conjunto de servicios en Angular proporciona una infraestructura robusta para la integración con Firebase. Incluye:
- **Autenticación personalizada y mediante proveedores externos.**
- **Registro de eventos de autenticación para auditoría.**
- **Gestión de usuarios en colecciones de Firestore.**

---

## AuditoriaService

📂 Archivo: `auditoria.service.ts`

### Funcionalidad

Este servicio gestiona la colección `auditoria` en Firestore, la cual se utiliza para registrar los eventos de autenticación de los usuarios (registro, inicio de sesión, proveedor externo).

### Métodos Clave

| Método | Descripción |
|--------|-------------|
| `registrarAutenticacion()` | Registra un evento de autenticación con información como correo, nombre, teléfono, método y fecha. |
| `getTodasEntradasAuditoria()` | Obtiene todas las entradas de auditoría, con opción de ordenamiento y filtrado por método. |
| `getAuditoriaPorFecha()` | Recupera registros de auditoría para una fecha específica. |
| `getAuditoriaPorEmail()` | Filtra eventos por correo electrónico. |
| `getAuditoriaPorEmailYFecha()` | Combinación de filtros por correo y fecha. |
| `getAuditoriaParcialEmailFrontend()` | Búsqueda parcial de email o nombre desde frontend (filtro en cliente). |
| `getUsuariosRegistrados()` | Extrae usuarios únicos registrados con su nombre y correo. |
| `getMetodosAutenticacion()` | Lista de métodos de autenticación usados en la app. |

### Importancia

Este servicio permite rastrear quién se autentica, cuándo y cómo, lo cual es esencial para:
- Auditorías de seguridad.
- Estadísticas de autenticación.
- Diagnóstico de problemas de acceso.

---

## AuthService

📂 Archivo: `auth.service.ts`

### Funcionalidad

Gestiona toda la lógica relacionada con la **autenticación de usuarios**, tanto personalizada (email y contraseña) como mediante **proveedores externos** (Google, Facebook, GitHub). Además, registra cada evento en la colección `auditoria` mediante el `AuditoriaService`.

### Métodos Clave

| Método | Descripción |
|--------|-------------|
| `register()` | Registra un nuevo usuario con correo/contraseña y guarda su perfil en Firestore (`userProfiles`). |
| `logIn()` | Inicia sesión con email y contraseña, recupera datos del perfil y registra el acceso. |
| `logInGoogle()`, `logInFacebook()`, `logInGitHub()` | Inician sesión con OAuth y registran los eventos en auditoría. |
| `logLogout()` | Cierra sesión actual. |
| `isAuthenticated()` | Verifica si hay un usuario autenticado. |
| `sendPasswordReset()` | Envía un correo para restablecer contraseña. |

### Funciones Internas

- `saveUserProfileToFirestore()`  
  Guarda datos del perfil del usuario autenticado en la colección `userProfiles`.

- `getUserProfileFromFirestore()`  
  Recupera datos del perfil del usuario autenticado desde Firestore.

### Importancia

Este servicio es el núcleo de autenticación en la aplicación. Garantiza:
- Seguridad en los accesos.
- Registro completo de actividades.
- Almacenamiento coherente de los perfiles de usuario.

---

## UsuarioService

📂 Archivo: `usuario.service.ts`

### Funcionalidad

Administra CRUD sobre la colección `usuarios` en Firestore. Esta colección contiene datos adicionales de los usuarios que pueden no estar en la autenticación.

### Métodos Clave

| Método | Descripción |
|--------|-------------|
| `getUsuarios()` | Obtiene todos los usuarios almacenados en la colección `usuarios`. |
| `agregarUsuario()` | Añade un nuevo documento de usuario. |
| `eliminarUsuario()` | Elimina un usuario según su ID. |
| `actualizarUsuario()` | Actualiza parcialmente la información de un usuario por ID. |

### Importancia

Este servicio separa la lógica de gestión de usuarios de la autenticación, permitiendo:
- Manipulación avanzada de los datos de usuario.
- Independencia respecto al proveedor de autenticación.
- Gestión administrativa de usuarios en la app.

---

## Conclusión

Estos servicios representan un diseño modular y limpio para trabajar con Firebase en Angular. Su combinación permite:

✅ Autenticación segura y versátil.  
✅ Registro detallado de accesos para auditoría.  
✅ Gestión flexible de perfiles de usuario.  
✅ Sincronización entre Firebase Auth y Firestore.

Este enfoque garantiza escalabilidad, trazabilidad y seguridad, fundamentales para aplicaciones modernas basadas en la nube.
