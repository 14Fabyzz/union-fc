"""
Script de migración: jugadores_sub12_sub13.xlsx → MongoDB
Estructura del Excel:
  - Una hoja por categoría (Sub-12, Sub-13, …)
  - Fila 0: título decorativo  → se omite
  - Fila 1: encabezados reales → N° Camiseta | Nombre Completo | N° Identificación
  - Fila 2+: datos de jugadores

Uso:
    pip install pandas openpyxl pymongo
    python migrate.py
"""

import sys
import pandas as pd
from pymongo import MongoClient, errors
from datetime import datetime

# ── Configuración ──────────────────────────────────────────────────────────────
MONGO_URI   = "mongodb://localhost:27017"
DATABASE    = "escuela_futbol"
COLLECTION  = "estudiantes"
EXCEL_FILE  = "jugadores_sub12_sub13.xlsx"
# ───────────────────────────────────────────────────────────────────────────────


def leer_todas_las_hojas(path: str) -> list[dict]:
    """Lee cada hoja del Excel y devuelve una lista plana de jugadores."""
    try:
        xl = pd.ExcelFile(path, engine="openpyxl")
    except FileNotFoundError:
        print(f"[ERROR] No se encontró el archivo: {path}")
        sys.exit(1)

    jugadores = []

    for sheet in xl.sheet_names:
        # header=1 → usa la fila 1 (índice) como encabezados, descarta la fila 0 (título)
        df = pd.read_excel(path, sheet_name=sheet, header=1, dtype=str, engine="openpyxl")

        # Normalizar nombres de columna: quitar espacios y caracteres raros
        df.columns = [
            c.strip()
             .lower()
             .replace("°", "")
             .replace("n ", "n")   # "n° camiseta" → "ncamiseta"
             .replace(" ", "_")
            for c in df.columns
        ]

        # Detectar columnas de nombre e identificación de forma flexible
        col_nombre = next(
            (c for c in df.columns if "nombre" in c or "jugador" in c or "completo" in c),
            None
        )
        col_ident = next(
            (c for c in df.columns if "identif" in c or "cedula" in c or "documento" in c),
            None
        )

        if not col_nombre or not col_ident:
            print(f"  [WARN] Hoja '{sheet}': no se encontraron columnas esperadas. "
                  f"Columnas disponibles: {list(df.columns)} — se omite.")
            continue

        # Limpiar filas vacías
        df = df.dropna(subset=[col_nombre, col_ident])
        df[col_nombre] = df[col_nombre].str.strip().str.title()
        df[col_ident]  = df[col_ident].str.strip().str.split(".").str[0]  # quita decimales si los hay

        categoria = sheet.strip()  # "Sub-12", "Sub-13", …

        for _, row in df.iterrows():
            nombre = row[col_nombre]
            ident  = row[col_ident]
            if not nombre or not ident:
                continue
            jugadores.append({
                "identificacion": ident,
                "nombre":         nombre,
                "categoria":      categoria,
                "activo":         True,
                "mesesPagados":   [],
                "creadoEn":       datetime.utcnow(),
            })

        print(f"  [OK] Hoja '{sheet}': {len(df)} jugadores leídos.")

    print(f"\n[INFO] Total jugadores a insertar: {len(jugadores)}")
    return jugadores


def insertar_en_mongo(docs: list[dict]) -> None:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    try:
        client.admin.command("ping")
        print(f"[INFO] Conectado a MongoDB en {MONGO_URI}")
    except errors.ServerSelectionTimeoutError:
        print(f"[ERROR] No se pudo conectar a MongoDB en {MONGO_URI}")
        client.close()
        sys.exit(1)

    col = client[DATABASE][COLLECTION]

    # Índice único idempotente
    col.create_index("identificacion", unique=True)

    insertados = duplicados = errores = 0

    for doc in docs:
        try:
            col.insert_one(doc)
            insertados += 1
            print(f"  [+] {doc['categoria']:8s}  {doc['nombre']}")
        except errors.DuplicateKeyError:
            duplicados += 1
            print(f"  [~] DUPLICADO: {doc['identificacion']} – {doc['nombre']}")
        except Exception as e:
            errores += 1
            print(f"  [!] ERROR: {doc['identificacion']}: {e}")

    client.close()

    print(f"\n  Insertados : {insertados}")
    print(f"  Duplicados : {duplicados}")
    print(f"  Errores    : {errores}")


if __name__ == "__main__":
    print("=" * 55)
    print("  MIGRACION: jugadores_sub12_sub13.xlsx -> MongoDB")
    print("=" * 55)
    docs = leer_todas_las_hojas(EXCEL_FILE)
    if not docs:
        print("[WARN] No hay datos para insertar. Verifica el archivo.")
        sys.exit(0)
    insertar_en_mongo(docs)
    print("\n[OK] Migración completada.\n")
