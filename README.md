# Organizador de la Predicación Congregacional

Sistema de gestión y organización interna de la predicación de congregación (Android, iOS y Web/PWA), diseñado bajo principios de máxima sencillez, bajo consumo de recursos y costo cero.

---

## 1. Arquitectura del Sistema

### 1.1. Estrategia Multiplataforma (Kotlin Multiplatform / Compose Multiplatform)
Para cumplir con el requerimiento de compartir la máxima cantidad de código entre Android e iOS sin duplicar aplicaciones:
- **`shared/commonMain`**: Contiene los modelos de dominio (`User`, `Territory`, `WeeklyAssignment`, `PublicPreachingAssignment`, etc.), repositorios, interfaces de casos de uso y serializadores Kotlinx.
- **`composeApp/commonMain`**: Vistas construidas en **Compose Multiplatform (Jetpack Compose para Android e iOS)** con tema Material Design 3, navegación y ViewModels con `StateFlow`.
- **`composeApp/androidMain`**: Configuración nativa de Android, servicios Firebase Android y `PdfDocument`.
- **`composeApp/iosMain`**: Configuración nativa de iOS (CocoaPods/SPM para Firebase iOS SDK, `UIGraphicsPDFRenderer`).
- **Aplicación Web / PWA (AI Studio Runtime)**: Interfaz complementaria React + TypeScript + Tailwind CSS con exactamente la misma estructura de datos, permitiendo acceso inmediato en navegadores y teléfonos móviles sin necesidad de instalar archivos externos.

---

## 2. Estructura Exacta de Firestore

Todas las entidades administrativas incluyen `congregationId` para garantizar aislamiento estricto:

```text
/congregations/{congregationId}
    - id: string
    - name: string
    - circuit: string
    - timezone: string ("America/El_Salvador")
    - createdAt: timestamp

/users/{userId}
    - id: string (auth.uid)
    - congregationId: string
    - firstName: string
    - lastName: string
    - fullName: string
    - email: string
    - role: "COORDINADOR" | "SUPERINTENDENTE_DE_SERVICIO" | "ASISTENTE_SUPERINTENDENTE_SERVICIO" | "PUBLICADOR"
    - canLeadPreaching: boolean
    - canPublicPreaching: boolean
    - active: boolean
    - createdAt: timestamp

/preachingPlaces/{placeId}
    - id: string
    - congregationId: string
    - name: string
    - address: string
    - latitude: number
    - longitude: number
    - description: string
    - active: boolean

/territories/{territoryId}
    - id: string
    - congregationId: string
    - number: string
    - name: string
    - description: string
    - status: "DISPONIBLE" | "ASIGNADO" | "EN_PROCESO" | "COMPLETADO" | "INACTIVO"
    - polygon: [{ latitude, longitude }, ...]
    - active: boolean
    - observations: string
    - lastAssignedDate: string
    - lastAssignedTo: string

/weeklyAssignments/{assignmentId}
    - id: string
    - congregationId: string
    - date: string (YYYY-MM-DD)
    - time: string (HH:mm)
    - placeId: string
    - placeName: string
    - leaderId: string
    - leaderName: string
    - territoryId: string
    - territoryNumber: string
    - notes: string
    - hasConflict: boolean
    - createdAt: timestamp

/publicPreachingPlaces/{placeId}
    - id: string
    - congregationId: string
    - name: string
    - address: string
    - latitude: number
    - longitude: number
    - day: string
    - time: string
    - duration: string
    - active: boolean
    - fixedMemberIds: string[] (Hermanos fijos)

/publicPreachingAssignments/{assignmentId}
    - id: string
    - congregationId: string
    - placeId: string
    - placeName: string
    - date: string
    - time: string
    - participants: [{ userId, userName, isFixed }] (mín 2, máx 3)
    - notes: string

/notificationPreferences/{userId}
    - userId: string
    - congregationId: string
    - remind7DaysBefore: boolean
    - remind2DaysBefore: boolean
    - remindSameDay7AM: boolean

/auditLogs/{logId}
    - id: string
    - congregationId: string
    - userId: string
    - userName: string
    - action: string
    - targetEntity: string
    - targetId: string
    - timestamp: timestamp
```

---

## 3. Matriz de Roles y Permisos (ABAC)

| Capacidad | COORDINADOR | SUPERINTENDENTE SERVICIO | ASISTENTE SUP. | PUBLICADOR |
|---|:---:|:---:|:---:|:---:|
| Ver su próxima asignación | ✅ | ✅ | ✅ | ✅ |
| Consultar programa semanal | ✅ | ✅ | ✅ | ✅ |
| Consultar asignaciones públicas | ✅ | ✅ | ✅ | ✅ |
| Crear/Editar programa semanal | ✅ | ✅ | ✅ | ❌ |
| Asignar encargados (`canLeadPreaching=true`) | ✅ | ✅ | ✅ | ❌ |
| Administrar territorios y polígonos | ✅ | ✅ | ✅ | ❌ |
| Administrar lugares de salida | ✅ | ✅ | ✅ | ❌ |
| Administrar predicación pública | ✅ | ✅ | ✅ | ❌ |
| Generar e imprimir PDFs | ✅ | ✅ | ✅ | ❌ |
| Administrar hermanos y otorgar privilegios | ✅ | ❌ | ❌ | ❌ |
| Cambiar roles de otros usuarios | ✅ | ❌ | ❌ | ❌ |
| Modificar su propio rol | ❌ (Bloqueado) | ❌ (Bloqueado) | ❌ (Bloqueado) | ❌ (Bloqueado) |
| Ajustes de congregación y zona horaria | ✅ | ❌ | ❌ | ❌ |
| Exportar copia de seguridad (JSON) | ✅ | ❌ | ❌ | ❌ |

---

## 4. Análisis de Costos y Nivel Gratuito (Spark Plan)

Este proyecto está diseñado para funcionar al **100% de costo cero** para cualquier congregación:

1. **Firebase Authentication**: Nivel gratuito de hasta 50,000 usuarios activos mensuales con Email/Password y Google Sign-In. (Una congregación típica tiene entre 50 y 150 publicadores, lo que representa < 0.3% del límite gratuito).
2. **Cloud Firestore (Spark Plan)**:
   - 50,000 lecturas diarias gratuitas.
   - 20,000 escrituras diarias gratuitas.
   - 1 GB de almacenamiento gratuito.
   - La aplicación guarda polígonos como arreglos numéricos compactos y utiliza caché offline, por lo que una congregación típica no superará las 200 a 400 operaciones diarias (< 1% de la cuota gratuita).
3. **Firebase Cloud Messaging (FCM)**: Completamente gratuito sin límite de envío para notificaciones push en Android e iOS.
4. **Google Maps SDK**: En aplicaciones nativas (Android e iOS), el uso del SDK de mapas móvil (visualización de mapas vectoriales y dibujo de polígonos) es **gratuito e ilimitado** sin cobro por carga de mapas nativos.
5. **Generación de PDF**: Se ejecuta enteramente en el dispositivo cliente (`android.graphics.pdf.PdfDocument` en Android, `UIGraphicsPDFRenderer` en iOS y `jspdf` en Web), eliminando cualquier costo de servidor.
6. **Sin servidores dedicados**: No requiere VPS, micro-instancias ni suscripciones mensuales.

---

## 5. Viabilidad Técnica en Android e iOS con Kotlin Multiplatform

1. **Compose Multiplatform**: Totalmente estable para iOS desde la versión 1.6 de Jetbrains Compose. El 95% de la interfaz de usuario se comparte.
2. **Firebase en KMP**: Se utiliza la librería oficial o `dev.gitlive:firebase-firestore` / `firebase-auth`, que envuelve los SDKs nativos de Google en Android y CocoaPods en iOS.
3. **Notificaciones por Zona Horaria**: En el dispositivo local se puede registrar una alarma exacta con `WorkManager` (Android) y `UNCalendarNotificationTrigger` (iOS) configuradas con la zona `America/El_Salvador` a las 7:00 AM, evitando la necesidad de invocar Cloud Functions de pago.
