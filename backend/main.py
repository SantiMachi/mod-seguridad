from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, conint
from typing import List
from datetime import datetime
import json
import os

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # O especifica ["http://127.0.0.1:5500"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "activos.json"

# Modelo del Activo
class Activo(BaseModel):
    id: int
    nombre: str
    tipo: str
    responsable: str
    ubicacion: str
    confidencialidad: conint(ge=1, le=3)
    integridad: conint(ge=1, le=3)
    disponibilidad: conint(ge=1, le=3)
    clasificacion: float = None  # Se calcula automáticamente
    fecha_registro: str = None   # Se asigna automáticamente

# Cargar datos desde archivo JSON
def cargar_activos() -> List[dict]:
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

# Guardar datos al archivo JSON
def guardar_activos(activos: List[dict]):
    with open(DATA_FILE, "w") as f:
        json.dump(activos, f, indent=4)

# Cálculo de la clasificación según fórmula: C * 0.4 + I * 0.3 + D * 0.3
def calcular_clasificacion(c: int, i: int, d: int) -> float:
    return round((c * 0.4) + (i * 0.3) + (d * 0.3), 2)

# Ruta GET: Obtener todos los activos
@app.get("/activos", response_model=List[Activo])
def listar_activos():
    return cargar_activos()

# Ruta POST: Crear nuevo activo
@app.post("/activos", response_model=Activo)
def crear_activo(activo: Activo):
    activos = cargar_activos()

    if any(a["id"] == activo.id for a in activos):
        raise HTTPException(status_code=400, detail="El id ya existe")

    activo.clasificacion = calcular_clasificacion(
        activo.confidencialidad,
        activo.integridad,
        activo.disponibilidad
    )
    activo.fecha_registro = datetime.now().isoformat()

    activos.append(activo.dict())
    guardar_activos(activos)
    return activo
