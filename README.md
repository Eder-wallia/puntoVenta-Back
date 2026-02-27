# 🏍️🚗 Backend API – Sistema de Gestión Taller Vehicular

API RESTful para la gestión de clientes, vehículos y presupuestos de servicios (motos y autos), incluyendo cálculo financiero automático y estructura preparada para sincronización offline.

---

# 🚀 Tecnologías

* Node.js
* Express
* MongoDB
* Mongoose
* JWT (Autenticación)
* Bcrypt (Encriptación)

---

# 🧠 Arquitectura

Arquitectura modular por dominio:

```
src/
 ├── config/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── services/
 ├── middlewares/
 ├── utils/
 └── app.js
```

Separación por responsabilidad:

* Routes → Endpoints
* Controllers → Lógica HTTP
* Services → Lógica de negocio
* Models → Esquemas MongoDB

---

# 📦 Entidades Principales

## 1️⃣ Cliente

```js
{
  _id: ObjectId,
  nombre: String,
  telefono: String,
  email: String,
  domicilio: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 2️⃣ Vehículo

```js
{
  _id: ObjectId,
  clienteId: ObjectId,
  tipo: "moto" | "carro",
  marca: String,
  modelo: String,
  color: String,
  placas: String,
  kilometraje: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 📌 Lista de marcas recomendada (puede ir en colección o constante)

Motos:

* Honda
* Yamaha
* Italika
* Suzuki
* Kawasaki
* Ducati
* BMW

Autos:

* Nissan
* Toyota
* Chevrolet
* Ford
* Mazda
* Volkswagen
* Hyundai

---

## 3️⃣ Presupuesto / Orden de Servicio

Documento principal que agrupa todo.

```js
{
  _id: ObjectId,
  clienteId: ObjectId,
  vehiculoId: ObjectId,

  servicios: [
    {
      descripcion: String,
      monto: Number
    }
  ],

  refacciones: [
    {
      nombre: String,
      cantidad: Number,
      costoUnitario: Number,
      total: Number
    }
  ],

  manoDeObra: [
    {
      descripcion: String,
      precio: Number
    }
  ],

  observacionesTecnicas: String,

  resumenFinanciero: {
    serviciosTotal: Number,
    refaccionesTotal: Number,
    manoDeObraTotal: Number,
    totalPresupuesto: Number,
    anticipo: Number,
    restantePorPagar: Number
  },

  estatus: "presupuesto" | "aprobado" | "en_proceso" | "terminado",

  createdAt: Date,
  updatedAt: Date
}
```

---

# 💰 Cálculo Automático Financiero

El backend calcula automáticamente:

```
serviciosTotal = suma(servicios.monto)
refaccionesTotal = suma(refacciones.total)
manoDeObraTotal = suma(manoDeObra.precio)

totalPresupuesto = serviciosTotal + refaccionesTotal + manoDeObraTotal

restantePorPagar = totalPresupuesto - anticipo
```

⚠️ El frontend NO debe enviar totales manualmente.

---

# 🔐 Autenticación

Endpoints protegidos con JWT.

Roles disponibles:

* admin
* usuario

Middleware:

```
authMiddleware
roleMiddleware
```

---

# 🌐 Endpoints Principales

## Clientes

POST /api/clientes
GET /api/clientes
GET /api/clientes/:id
PUT /api/clientes/:id
DELETE /api/clientes/:id

---

## Vehículos

POST /api/vehiculos
GET /api/vehiculos
GET /api/vehiculos/:id
PUT /api/vehiculos/:id
DELETE /api/vehiculos/:id

---

## Presupuestos

POST /api/presupuestos
GET /api/presupuestos
GET /api/presupuestos/:id
PUT /api/presupuestos/:id
DELETE /api/presupuestos/:id

---

## Acción especial

POST /api/presupuestos/:id/aprobar

Botón "Realizar servicios de presupuesto" cambia estatus a:

```
aprobado → en_proceso
```

---

# 📊 Índices recomendados

```
clientes.email (unique)
vehiculos.placas
presupuestos.clienteId
presupuestos.vehiculoId
presupuestos.estatus
```

---

# 🔄 Preparado para Offline

Campos recomendados:

```
version: Number
lastModifiedAt: Date
lastModifiedBy: ObjectId
```

Permite:

* Resolver conflictos
* Estrategia last-write-wins
* Auditoría

---

# 🛠️ Instalación

```
npm install
```

---

# ▶️ Ejecución

```
npm run dev
```

---

# 🔧 Variables de entorno

```
PORT=3000
MONGO_URI=mongodb+srv://...
JWT_SECRET=secret
```

---

# 📈 Escalabilidad

Preparado para:

* MongoDB Atlas
* Render / Railway
* Sincronización offline
* Generación de PDF desde frontend
* Multi sucursal (extensible)

---

# 🚀 Mejoras Futuras

* Historial de cambios (auditoría)
* Adjuntar imágenes
* Generar PDF desde backend
* Facturación
* Notificaciones
* Control de inventario
* Multi usuario con permisos avanzados
* Soft delete
* Logs de sincronización

---

# 📌 Estado del Proyecto

Sistema listo para producción pequeña (4 usuarios) con arquitectura escalable.
