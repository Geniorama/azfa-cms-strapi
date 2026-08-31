# Plan de sustitución de los plugins de terceros

**Fecha:** 31 de agosto de 2026
**Contexto:** punto 14 del mantenimiento de agosto. Ver `INFORME_MANTENIMIENTO_2026-08.md`
en el repositorio `azfa-web`.

---

## Conclusión primero: no hay urgencia

El informe de mantenimiento afirmaba que estos dos plugins mantenían abiertas las
vulnerabilidades de `react-router` 6 y bloqueaban la subida a React 19. **Al verificar la
cadena de dependencias, resultó falso.** Ambas cosas vienen del propio Strapi:

```
npm ls react-router-dom
├─┬ @strapi/plugin-cloud@5.52.2
│ └─┬ @strapi/admin@5.52.2
│   └── react-router-dom@6.30.6
└─┬ @strapi/strapi@5.52.2
  ├─┬ @strapi/content-manager@5.52.2   └── react-router-dom@6.30.6
  ├─┬ @strapi/content-releases@5.52.2  └── react-router-dom@6.30.6
  └─┬ @strapi/content-type-builder@…   └── react-router-dom@6.30.6

npm ls react
└─┬ @strapi/admin@5.52.2 → react@18.3.1
```

Los dos plugins declaran `react ^18.3.1` y `react-router-dom ^6.x` como *peers*, pero
quien resuelve esas versiones es el panel de administración de Strapi. **Quitar los
plugins no cerraría ninguna vulnerabilidad ni permitiría subir a React 19**: eso depende
de que Strapi migre su admin, río arriba.

Lo que sí queda como argumento, más estrecho: son dependencias de terceros **sin
mantenimiento** —última publicación en enero de 2025 y octubre de 2024— que corren dentro
del panel. Es riesgo de abandono y de cadena de suministro, no de CVE conocida. Y el día
que Strapi sí migre a React 19, entonces sí serían el bloqueo.

**Recomendación:** no es trabajo urgente. Merece la pena porque **cuesta muy poco**, como
se ve abajo, no porque haya un riesgo abierto.

---

## Dónde se usan

### `strapi-plugin-country-select` — 5 content types

| Content type | Campo | Notas |
|---|---|---|
| `affiliate` | `country` | |
| `incentive` | `country` | |
| `map-country` | `country` | |
| `real-state-offer` | `country` | |
| `team-member` | `country` | `required: true` |

### `strapi-plugin-multi-select` — 2 content types, 3 campos

| Content type | Campo | Opciones |
|---|---|---|
| `ads-manager` | `position` | 3 |
| `real-state-offer` | `offerType` | 2 — Venta, Arriendo |
| `real-state-offer` | `propertyUse` | 4 — Data Center, Logística, Manufactura, Servicio |

---

## Por qué la sustitución es barata: no hay migración de datos

Lo comprobé contra la base de datos de producción. **Los dos custom fields guardan en
columnas nativas, con el formato que ya usaría su reemplazo.**

`country` es un `character varying` en las cinco tablas, y guarda directamente el código
ISO-3166 alfa-2:

```
 table_name        |     data_type          country
-------------------+-------------------     -------
 affiliates        | character varying      GT
 incentives        | character varying      BR
 map_countries     | character varying      PA
 real_state_offers | character varying      HT
 team_members      | character varying      PE
```

Los multi-select guardan un array JSON en texto:

```
      offer_type       |               property_use
-----------------------+------------------------------------------
 ["arriendo"]          | ["logistica", "manufactura", "servicio"]
 ["venta", "arriendo"] | ["manufactura", "logistica", "servicio"]
```

Es decir: cambiar el tipo del campo en el esquema **no exige tocar ni una fila**.

---

## El plan

### 1. `country-select` → `enumeration` nativo

Hay **23 países distintos** en uso en toda la base de datos, no doscientos. Una
`enumeration` nativa con esos códigos —más los del ámbito de AZFA que aún no aparezcan—
mantiene el desplegable para quien edita y elimina la dependencia.

```json
"country": {
  "type": "enumeration",
  "enum": ["AR", "BO", "BR", "CL", "CO", "CR", "DO", "EC", "ES", "GT", "HN", "HT", ...]
}
```

**Cuidado con un detalle:** los valores de la enumeración tienen que cubrir *exactamente*
todo lo que ya existe en las columnas, o Strapi fallará al validar cualquier registro
antiguo que se abra y se guarde. La consulta para obtener la lista real:

```sql
SELECT DISTINCT country FROM (
  SELECT country FROM affiliates    UNION SELECT country FROM incentives
  UNION SELECT country FROM map_countries UNION SELECT country FROM real_state_offers
  UNION SELECT country FROM team_members
) t WHERE country IS NOT NULL ORDER BY 1;
```

**El frontend no se entera:** `src/utils/countryMapping.ts` en `azfa-web` ya traduce
código ↔ nombre, y seguiría recibiendo el mismo código.

### 2. `multi-select` → `json` nativo

La columna ya guarda un array JSON, así que el cambio de tipo es transparente.

**En `real-state-offer` no hay impacto para quien edita.** Esos dos campos no se tocan
desde el panel de Strapi: los escribe el formulario del portal de afiliados
(`AgregarInmuebleView`, `EditarInmuebleView` → `POST /api/createRealStateOffer`, que envía
`offerType` y `propertyUse` como arrays). El panel es solo lectura en la práctica.

**En `ads-manager.position` sí lo hay:** es un campo que se edita a mano y pasaría de tres
casillas a escribir JSON. Con tres opciones y un uso esporádico es asumible, pero si
molesta hay dos salidas nativas: tres booleanos, o un componente repetible con una
`enumeration` dentro.

### 3. Orden sugerido

1. Sustituir en un entorno de pruebas con copia de la base de datos de producción — el
   respaldo verificado está en `backups/20260831-post/`.
2. Abrir y guardar un registro de cada content type afectado, que es donde saldría un
   valor fuera de la enumeración.
3. Comprobar en el frontend: mapa de países, directorio de afiliados, incentivos, equipo
   y el buscador de oferta inmobiliaria (que filtra por `offerType` y `propertyUse`).
4. Desinstalar ambos plugins y verificar que `strapi build` sigue completando.

---

## Lo que hay que vigilar de verdad

No son estos plugins, sino **Strapi**. Las 25 vulnerabilidades que quedan tras la
actualización a 5.52.2 son transitivas de `@strapi/*`, y solo se cierran cuando Strapi
publique versiones con las dependencias al día. Conviene revisar `npm audit` en cada
mantenimiento mensual y anotar si alguna pasa de *moderate* a algo peor.
