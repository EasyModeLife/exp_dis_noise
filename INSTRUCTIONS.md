# Instrucciones del Experimento de Discriminación Auditiva con Ruido

## Descripción General

Este experimento evalúa la capacidad de discriminación auditiva de palabras en presencia de ruido blanco a diferentes niveles de intensidad. El experimento utiliza 6 listas de palabras con diferentes longitudes silábicas y 6 niveles de ruido.

## Listas de Palabras

### Lista 1 (3 sílabas)
1. Obstante
2. Brújula
3. Guitarra
4. Comida
5. Fábula
6. Rúbrica
7. Cebolla
8. Crónica
9. Escuela
10. Familia
11. Vértigo
12. Mochila
13. Cuchara
14. Botella
15. Séquito

### Lista 2 (3 sílabas)
1. Palabra
2. Número
3. Mercado
4. Ventana
5. Insignia
6. Enigma
7. Diluvio
8. Mañana
9. Camisa
10. Plátano
11. Amigo
12. Trabajo
13. Dinero
14. Zapato
15. Naranja

### Lista 1 (4 sílabas)
1. Restaurante
2. Bolígrafo
3. Efímero
4. Importante
5. Mandíbula
6. Obelisco
7. Monasterio
8. Presidente
9. Carpintero
10. Calendario
11. Secretaria
12. Periscopio
13. Cucaracha
14. Kilómetro
15. Semáforo

### Lista 2 (4 sílabas)
1. Teléfono
2. Bicicleta
3. Simpático
4. Pentagrama
5. Mariposa
6. Diferente
7. Elefante
8. Termómetro
9. Necesario
10. Chocolate
11. Catapulta
12. Eucalipto
13. Compañero
14. Televisión
15. Murciélago

### Lista 1 (5 sílabas)
1. Especialista
2. Universidad
3. Laboratorio
4. Categórico
5. Caleidoscopio
6. Felicidades
7. Oportunidad
8. Estacionamiento
9. Computadora
10. Estetoscopio
11. Melancólico
12. Inverosímil
13. Aristocracia
14. Helicóptero
15. Comunicación

### Lista 2 (5 sílabas)
1. Investigación
2. Estrafalario
3. Especulación
4. Inteligente
5. Idiosincrasia
6. Electricidad
7. Matemáticas
8. Hipopótamo
9. Administración
10. Agradecimiento
11. Antibiótico
12. Efervescencia
13. Temperatura
14. Necesidades
15. Experiencia

## Niveles de Ruido

Cada lista de palabras debe mezclarse con ruido blanco a los siguientes niveles de volumen (calculados como porcentaje del volumen de las palabras):

1. **Nivel 1**: 112.2018% - Ruido más alto que las palabras
2. **Nivel 2**: 100% - Ruido igual al volumen de las palabras
3. **Nivel 3**: 89.1255% - Ruido ligeramente menor que las palabras
4. **Nivel 4**: 84.1395% - Ruido moderadamente menor que las palabras
5. **Nivel 5**: 79.4328% - Ruido notablemente menor que las palabras
6. **Nivel 6**: 70.7946% - Ruido significativamente menor que las palabras

## Combinaciones de Audio

**Total de combinaciones**: 6 listas × 6 niveles de ruido = **36 combinaciones**

- Lista 1 (3 sílabas) × 6 niveles de ruido = 6 audios
- Lista 2 (3 sílabas) × 6 niveles de ruido = 6 audios
- Lista 1 (4 sílabas) × 6 niveles de ruido = 6 audios
- Lista 2 (4 sílabas) × 6 niveles de ruido = 6 audios
- Lista 1 (5 sílabas) × 6 niveles de ruido = 6 audios
- Lista 2 (5 sílabas) × 6 niveles de ruido = 6 audios

## Funcionamiento del Experimento

### Flujo de Trabajo por Palabra

Para cada una de las 15 palabras de una lista:

1. **Selección de Audio**: El usuario selecciona uno de los 36 audios disponibles (combinación de lista y nivel de ruido)

2. **Reproducción**: El usuario presiona el botón "Reproducir Palabra"
   - Se reproduce la palabra actual con ruido blanco superpuesto al nivel seleccionado
   - El temporizador inicia **inmediatamente** al comenzar la reproducción
   - El ruido blanco se genera dinámicamente y se reproduce simultáneamente con el audio de la palabra

3. **Detención**: El usuario presiona el botón "Detener Temporizador"
   - El temporizador se detiene
   - La reproducción del audio se detiene (si aún está reproduciéndose)
   - El tiempo transcurrido se almacena
   - **Nota importante**: El usuario puede detener el audio antes de que termine si reconoce la palabra anticipadamente

4. **Progreso**: El sistema avanza automáticamente a la siguiente palabra

5. **Repetición**: Los pasos 2-4 se repiten para las 15 palabras de la lista

### Resultados

Al finalizar las 15 palabras:
- Se muestran los tiempos individuales de cada palabra
- Se calcula y muestra el tiempo total acumulado
- Se ofrece la opción de reiniciar el experimento

## Especificaciones Técnicas

### Generación de Audio
- **Audio de palabras**: Generado con ElevenLabs
- **Ruido blanco**: Generado dinámicamente mediante Web Audio API
- **Formato**: Los audios de palabras deben estar en formato MP3
- **Mezcla**: El ruido se superpone al audio de palabras en tiempo real, no está pre-mezclado

### Estructura de Archivos de Audio
```
/public/audio/words/
├── lista1-3sil/
│   ├── palabra01.mp3
│   ├── palabra02.mp3
│   └── ... (15 palabras)
├── lista2-3sil/
│   └── ... (15 palabras)
├── lista1-4sil/
│   └── ... (15 palabras)
├── lista2-4sil/
│   └── ... (15 palabras)
├── lista1-5sil/
│   └── ... (15 palabras)
└── lista2-5sil/
    └── ... (15 palabras)
```

## Métricas Recolectadas

- Tiempo de respuesta individual para cada palabra (en milisegundos)
- Tiempo total acumulado para las 15 palabras
- Lista y nivel de ruido utilizados

