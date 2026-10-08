# Especificación de Seguridad de Firestore (Security Spec)
Proyecto: Organizador de Predicación Congregacional

## 1. Invariantes de Datos y Principios Zero-Trust

1. **Aislamiento Multi-Congregación:** Ningún usuario puede leer ni escribir datos que pertenezcan a un `congregationId` distinto al suyo registrado en su documento `/users/{auth.uid}`.
2. **Jerarquía y Roles ABAC:**
   - **COORDINADOR:** Acceso total de administración de su congregación (usuarios, privilegios, territorios, lugares, programas, auditoría).
   - **SUPERINTENDENTE_DE_SERVICIO / ASISTENTE_SUPERINTENDENTE_SERVICIO:** Puede gestionar programas, lugares, territorios y predicación pública de su congregación.
   - **PUBLICADOR:** Solo puede consultar información de su congregación y sus asignaciones, y actualizar sus propias preferencias de notificación. No puede alterar usuarios, territorios ni programas.
3. **Inmutabilidad de Identidad y Roles Propios:** Un usuario NUNCA puede modificar su propio campo `role`, `congregationId`, `canLeadPreaching` o `canPublicPreaching`. Las auto-asignaciones de privilegios están estrictamente denegadas.
4. **Validación de Límites en Predicación Pública:** Toda asignación en `/publicPreachingAssignments` debe contener entre 2 y 3 participantes (`participants.size() >= 2 && participants.size() <= 3`).
5. **Inmutabilidad de Auditoría:** `/auditLogs` solo admite creación por usuarios autorizados y NUNCA permite `update` ni `delete`.

---

## 2. Los Doce Escenarios Críticos ("The Dirty Dozen Payloads")

1. **Ataque de Escalada de Rol:** Publicador intenta enviarse `role: "COORDINADOR"` en su propio documento `/users/{uid}`.
   -> *Resultado Esperado:* PERMISSION_DENIED.
2. **Ataque Cross-Tenant (Otra Congregación):** Usuario de Congregación A intenta leer `/territories/{id}` de Congregación B.
   -> *Resultado Esperado:* PERMISSION_DENIED.
3. **Escritura No Autenticada:** Cliente sin token `request.auth` intenta crear un `/weeklyAssignments`.
   -> *Resultado Esperado:* PERMISSION_DENIED.
4. **Manipulación de Registro de Auditoría:** Usuario intenta borrar un registro en `/auditLogs/{logId}`.
   -> *Resultado Esperado:* PERMISSION_DENIED.
5. **Alteración de Privilegios por Publicador:** Publicador intenta modificar `canLeadPreaching: true` para sí mismo.
   -> *Resultado Esperado:* PERMISSION_DENIED.
6. **Inyección de Identificador Malicioso:** Document ID con caracteres no permitidos o payload mayor a 128 bytes.
   -> *Resultado Esperado:* PERMISSION_DENIED.
7. **Exceso de Participantes en Exhibidor:** Creación de `publicPreachingAssignments` con 4 participantes.
   -> *Resultado Esperado:* PERMISSION_DENIED.
8. **Publicador intentando Crear Territorio:** Usuario con rol `PUBLICADOR` intenta escribir en `/territories/{id}`.
   -> *Resultado Esperado:* PERMISSION_DENIED.
9. **Lectura de Preferencias Ajenas:** Usuario intenta leer `/notificationPreferences/{otherUserId}`.
   -> *Resultado Esperado:* PERMISSION_DENIED.
10. **Modificación de Campos Inmutables:** Actualización que altera el campo `createdAt` o `congregationId`.
    -> *Resultado Esperado:* PERMISSION_DENIED.
11. **Shadow Update (Campos Ocultos):** Documento enviado con atributos no definidos en el esquema.
    -> *Resultado Esperado:* PERMISSION_DENIED.
12. **Sobrescritura de Congregación por Usuario No Coordinador:** Publicador intentando modificar datos de la congregación.
    -> *Resultado Esperado:* PERMISSION_DENIED.
