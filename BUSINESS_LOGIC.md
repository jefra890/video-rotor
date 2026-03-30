# BUSINESS_LOGIC.md - Video Rotor

> Generado por SaaS Factory | Fecha: 2026-03-26

## 1. Problema de Negocio

**Dolor:** Las televisiones montadas en vertical para publicidad necesitan contenido en formato vertical (9:16). Con imagenes es facil rotarlas, pero con videos no hay forma sencilla de convertirlos, gestionarlos y distribuirlos a multiples pantallas.

**Costo actual:** Tiempo manual para convertir videos, ir fisicamente a cada TV a cambiar USB, sin forma de gestionar remotamente que contenido se muestra en cada pantalla.

## 2. Solucion

**Propuesta de valor:** Un panel web de senalizacion digital que convierte videos a formato vertical y los distribuye remotamente a Raspberry Pis conectadas a TVs.

**Flujo principal (Happy Path):**
1. Usuario sube video/imagen al panel web
2. El sistema convierte/recorta automaticamente a formato vertical (9:16) con ffmpeg
3. Usuario asigna contenido a playlists y las asigna a dispositivos (TVs)
4. El contenido se envia a las Raspberry Pis que lo reproducen en loop

## 3. Usuario Objetivo

**Rol:** Dueno de negocio / Encargado de marketing que gestiona publicidad en pantallas verticales en establecimientos.
**Contexto:** Persona que graba sus propios videos y necesita una forma simple de ponerlos en sus TVs sin ir fisicamente a cada una.

## 4. Arquitectura de Datos

**Input:**
- Videos (MP4, MOV, AVI) subidos por el usuario
- Imagenes (JPG, PNG, WEBP) subidas por el usuario
- Configuracion de playlists (orden, duracion, horarios)
- Registro de dispositivos Raspberry Pi

**Output:**
- Videos convertidos a formato vertical (9:16)
- Streaming/descarga de contenido a Raspberry Pis
- Dashboard de estado de dispositivos (online/offline)
- Preview de como se ve el contenido en vertical

**Storage (Supabase tables sugeridas):**
- `profiles`: Perfil del usuario
- `media`: Videos e imagenes subidos (metadata + URL en Supabase Storage)
- `playlists`: Listas de reproduccion con orden y configuracion
- `playlist_items`: Items dentro de cada playlist (media + orden + duracion)
- `devices`: Raspberry Pis registradas (nombre, ubicacion, estado, ultimo ping)
- `device_assignments`: Que playlist esta asignada a que dispositivo

## 5. KPI de Exito

**Metrica principal:** Subir un video, que se convierta a vertical automaticamente, y poder asignarlo a una TV desde el panel sin tocar fisicamente el dispositivo.

## 6. Especificacion Tecnica (Para el Agente)

### Features a Implementar (Feature-First)

```
src/features/
├── auth/           # Autenticacion Email/Password (Supabase)
├── dashboard/      # Vista general: resumen de TVs, contenido, estado
├── media/          # Subir, convertir y gestionar videos/imagenes
├── playlists/      # Crear y gestionar listas de reproduccion
├── devices/        # Registrar y monitorear Raspberry Pis
└── player/         # Preview de como se ve el contenido en vertical
```

### Stack Confirmado
- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind 4
- **Backend:** Supabase (Auth + Database + Storage)
- **Video Processing:** ffmpeg (server-side via API routes)
- **Comunicacion:** WebSocket/MQTT para Raspberry Pi (fase futura)
- **Validacion:** Zod
- **State:** Zustand
- **MCPs:** Next.js DevTools + Playwright + Supabase

### Proximos Pasos
1. [ ] Configurar Supabase (tablas, RLS, storage buckets)
2. [ ] Implementar Auth (login, signup, proteccion de rutas)
3. [ ] Feature: Media (subir, listar, preview, conversion vertical)
4. [ ] Feature: Playlists (crear, editar, ordenar items)
5. [ ] Feature: Devices (registrar, estado, asignar playlist)
6. [ ] Feature: Dashboard (resumen general)
7. [ ] Feature: Player preview (simulador de TV vertical)
8. [ ] Testing E2E
9. [ ] Deploy Vercel
