import React, { useState } from 'react';
import { X, Code, Copy, Check, Smartphone, Layers, Server } from 'lucide-react';

interface KmpArchitectureModalProps {
  onClose: () => void;
}

export const KmpArchitectureModal: React.FC<KmpArchitectureModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'models' | 'repository' | 'gradle' | 'build'>('models');
  const [copied, setCopied] = useState(false);

  const kotlinModelsCode = `// shared/src/commonMain/kotlin/org/congregacion/predicacion/domain/model/Models.kt
package org.congregacion.predicacion.domain.model

import kotlinx.serialization.Serializable

enum class UserRole {
    COORDINADOR,
    SUPERINTENDENTE_DE_SERVICIO,
    ASISTENTE_SUPERINTENDENTE_SERVICIO,
    PUBLICADOR
}

enum class TerritoryStatus {
    DISPONIBLE,
    ASIGNADO,
    EN_PROCESO,
    COMPLETADO,
    INACTIVO
}

@Serializable
data class LatLngCoord(
    val latitude: Double,
    val longitude: Double
)

@Serializable
data class User(
    val id: String,
    val congregationId: String,
    val firstName: String,
    val lastName: String,
    val fullName: String,
    val email: String,
    val role: UserRole,
    val canLeadPreaching: Boolean,
    val canPublicPreaching: Boolean,
    val active: Boolean
)

@Serializable
data class Congregation(
    val id: String,
    val name: String,
    val circuit: String = "",
    val timezone: String = "America/El_Salvador",
    val createdAt: String
)

@Serializable
data class Territory(
    val id: String,
    val congregationId: String,
    val number: String,
    val name: String = "",
    val description: String = "",
    val status: TerritoryStatus = TerritoryStatus.DISPONIBLE,
    val polygon: List<LatLngCoord> = emptyList(),
    val active: Boolean = true,
    val observations: String = "",
    val lastAssignedDate: String? = null,
    val lastAssignedTo: String? = null
)

@Serializable
data class WeeklyAssignment(
    val id: String,
    val congregationId: String,
    val date: String, // YYYY-MM-DD
    val time: String, // HH:mm
    val placeId: String,
    val placeName: String,
    val leaderId: String,
    val leaderName: String,
    val territoryId: String,
    val territoryNumber: String,
    val notes: String = "",
    val hasConflict: Boolean = false
)

@Serializable
data class PublicPreachingAssignment(
    val id: String,
    val congregationId: String,
    val placeId: String,
    val placeName: String,
    val date: String,
    val time: String,
    val participants: List<ParticipantInfo>,
    val notes: String = ""
)

@Serializable
data class ParticipantInfo(
    val userId: String,
    val userName: String,
    val isFixed: Boolean = false
)`;

  const kotlinRepoCode = `// shared/src/commonMain/kotlin/org/congregacion/predicacion/domain/repository/PreachingRepository.kt
package org.congregacion.predicacion.domain.repository

import kotlinx.coroutines.flow.Flow
import org.congregacion.predicacion.domain.model.*

interface PreachingRepository {
    fun getWeeklyAssignments(congregationId: String): Flow<List<WeeklyAssignment>>
    suspend fun saveWeeklyAssignment(assignment: WeeklyAssignment): Result<Unit>
    suspend fun deleteWeeklyAssignment(assignmentId: String): Result<Unit>

    fun getTerritories(congregationId: String): Flow<List<Territory>>
    suspend fun saveTerritory(territory: Territory): Result<Unit>

    fun getPublicPreachingAssignments(congregationId: String): Flow<List<PublicPreachingAssignment>>
    suspend fun savePublicPreachingAssignment(assignment: PublicPreachingAssignment): Result<Unit>

    fun getEligibleLeaders(congregationId: String): Flow<List<User>>
    fun getEligiblePublicPublishers(congregationId: String): Flow<List<User>>
}`;

  const gradleCode = `// composeApp/build.gradle.kts (Kotlin Multiplatform + Compose Multiplatform)
plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)
    alias(libs.plugins.kotlinSerialization)
    alias(libs.plugins.googleServices)
}

kotlin {
    androidTarget {
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
        }
    }
    
    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64()
    ).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "ComposeApp"
            isStatic = true
        }
    }
    
    sourceSets {
        commonMain.dependencies {
            implementation(compose.runtime)
            implementation(compose.foundation)
            implementation(compose.material3)
            implementation(compose.ui)
            implementation(compose.components.resources)
            
            // Firebase Kotlin SDK (Multiplatform)
            implementation("dev.gitlive:firebase-firestore:2.1.0")
            implementation("dev.gitlive:firebase-auth:2.1.0")
            
            // Coroutines & Serialization
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.1")
            implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
            
            // Navigation
            implementation("org.jetbrains.androidx.navigation:navigation-compose:2.8.0-alpha10")
        }
    }
}`;

  const buildInstructions = `# Instrucciones de Compilación y Configuración (Android & iOS)

## 1. Requisitos Previos
- Android Studio Ladybug (o superior) con Kotlin 2.0+
- JDK 17
- Para iOS: macOS con Xcode 15+ y CocoaPods o SPM

## 2. Configurar Firebase en Android
1. Crear proyecto en Firebase Console (o usar effortless-citadel-dsmzh).
2. Descargar 'google-services.json' y colocarlo en 'composeApp/'.
3. Las reglas de seguridad ya desplegadas en 'firestore.rules' protegen el acceso.

## 3. Configurar Firebase en iOS
1. Registrar la App iOS en Firebase Console con el Bundle ID correspondiente.
2. Descargar 'GoogleService-Info.plist' y añadirlo al proyecto Xcode en 'iosApp/'.

## 4. Generar APK para pruebas en Android
$ ./gradlew :composeApp:assembleDebug
(El APK generado se encuentra en 'composeApp/build/outputs/apk/debug/')

## 5. Generar AAB firmado para Google Play
$ ./gradlew :composeApp:bundleRelease

## 6. Compilar para iOS
Abrir 'iosApp/iosApp.xcworkspace' en Xcode y seleccionar el simulador o dispositivo físico iPhone.`;

  const getActiveCode = () => {
    switch (activeTab) {
      case 'models':
        return kotlinModelsCode;
      case 'repository':
        return kotlinRepoCode;
      case 'gradle':
        return gradleCode;
      case 'build':
        return buildInstructions;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-800 space-y-4 max-h-[90vh] flex flex-col">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base text-white">Arquitectura Kotlin Multiplatform (KMP)</h3>
              <p className="text-xs text-slate-400">Modelos y módulos listos para Android Studio y Xcode</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de código */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex gap-1.5 text-xs">
            <button
              onClick={() => setActiveTab('models')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'models' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Models.kt
            </button>
            <button
              onClick={() => setActiveTab('repository')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'repository' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Repository.kt
            </button>
            <button
              onClick={() => setActiveTab('gradle')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'gradle' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              build.gradle.kts
            </button>
            <button
              onClick={() => setActiveTab('build')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'build' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Instrucciones Build
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>

        {/* Bloque de código */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed text-slate-300">
          <pre>{getActiveCode()}</pre>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
