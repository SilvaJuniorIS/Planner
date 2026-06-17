from __future__ import annotations

import json
import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = Path(os.getenv("ATLASFLOW_DB", DATA_DIR / "atlasflow.sqlite3"))

STATUSES = {"entrada", "analisar", "criar", "revisar", "devolver", "concluido"}
PRIORITIES = {"normal", "urgente"}


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = ""
    department: str = ""
    role: str = "Operador"


class User(UserCreate):
    id: str
    created_at: str


class ProcessBase(BaseModel):
    number: str = ""
    year: str = ""
    subject: str = Field(..., min_length=1)
    secretary: str = ""
    owner: str = ""
    priority: str = "normal"
    arrival_date: str = ""
    from_sector: str = ""
    purpose: str = ""
    deadline: str = ""
    status: str = "entrada"
    exit_date: str = ""
    to_sector: str = ""
    exit_purpose: str = ""
    docs: list[str] = Field(default_factory=list)
    notes: str = ""


class ProcessCreate(ProcessBase):
    pass


class ProcessUpdate(ProcessBase):
    pass


class Process(ProcessBase):
    id: str
    user_id: str
    created_at: str
    updated_at: str


class MovementCreate(BaseModel):
    date: str = ""
    status: str = "entrada"
    to: str = ""
    purpose: str = ""
    notes: str = ""


class HistoryItem(MovementCreate):
    id: str
    process_id: str
    user_id: str
    action: str
    created_at: str


class ProcessWithHistory(Process):
    history: list[HistoryItem] = Field(default_factory=list)


app = FastAPI(
    title="AtlasFlow API",
    description="API para gestao de usuarios, processos administrativos e historico operacional.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@contextmanager
def db() -> Any:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def now() -> str:
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"


def new_id() -> str:
    return str(uuid.uuid4())


def validate_status(value: str) -> None:
    if value not in STATUSES:
        raise HTTPException(status_code=422, detail=f"Status invalido: {value}")


def validate_priority(value: str) -> None:
    if value not in PRIORITIES:
        raise HTTPException(status_code=422, detail=f"Prioridade invalida: {value}")


def row_to_user(row: sqlite3.Row) -> dict[str, Any]:
    return dict(row)


def row_to_process(row: sqlite3.Row) -> dict[str, Any]:
    item = dict(row)
    item["docs"] = json.loads(item.get("docs") or "[]")
    return item


def row_to_history(row: sqlite3.Row) -> dict[str, Any]:
    return dict(row)


def ensure_user(conn: sqlite3.Connection, user_id: str) -> sqlite3.Row:
    row = conn.execute("select * from users where id = ?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")
    return row


def ensure_process(conn: sqlite3.Connection, process_id: str) -> sqlite3.Row:
    row = conn.execute("select * from processes where id = ?", (process_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Processo nao encontrado")
    return row


def insert_history(
    conn: sqlite3.Connection,
    *,
    process_id: str,
    user_id: str,
    date: str,
    action: str,
    status_value: str,
    to: str,
    purpose: str,
    notes: str,
) -> None:
    conn.execute(
        """
        insert into history (id, process_id, user_id, date, action, status, to_sector, purpose, notes, created_at)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (new_id(), process_id, user_id, date or now()[:10], action, status_value, to, purpose, notes, now()),
    )


def init_db() -> None:
    with db() as conn:
        conn.executescript(
            """
            create table if not exists users (
                id text primary key,
                name text not null,
                email text not null default '',
                department text not null default '',
                role text not null default 'Operador',
                created_at text not null
            );

            create table if not exists processes (
                id text primary key,
                user_id text not null references users(id) on delete cascade,
                number text not null default '',
                year text not null default '',
                subject text not null,
                secretary text not null default '',
                owner text not null default '',
                priority text not null default 'normal',
                arrival_date text not null default '',
                from_sector text not null default '',
                purpose text not null default '',
                deadline text not null default '',
                status text not null default 'entrada',
                exit_date text not null default '',
                to_sector text not null default '',
                exit_purpose text not null default '',
                docs text not null default '[]',
                notes text not null default '',
                created_at text not null,
                updated_at text not null
            );

            create table if not exists history (
                id text primary key,
                process_id text not null references processes(id) on delete cascade,
                user_id text not null references users(id) on delete cascade,
                date text not null,
                action text not null,
                status text not null,
                to_sector text not null default '',
                purpose text not null default '',
                notes text not null default '',
                created_at text not null
            );
            """
        )

        count = conn.execute("select count(*) as total from users").fetchone()["total"]
        if count == 0:
            created = now()
            conn.executemany(
                "insert into users (id, name, email, department, role, created_at) values (?, ?, ?, ?, ?, ?)",
                [
                    ("user-compras", "Setor de Compras", "compras@prefeitura.local", "Compras", "Operador", created),
                    ("user-juridico", "Juridico Administrativo", "juridico@prefeitura.local", "Juridico", "Revisor", created),
                ],
            )


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "app": "AtlasFlow API"}


@app.get("/api/users", response_model=list[User])
def list_users() -> list[dict[str, Any]]:
    with db() as conn:
        return [row_to_user(row) for row in conn.execute("select * from users order by name").fetchall()]


@app.post("/api/users", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate) -> dict[str, Any]:
    user_id = new_id()
    with db() as conn:
        conn.execute(
            "insert into users (id, name, email, department, role, created_at) values (?, ?, ?, ?, ?, ?)",
            (user_id, payload.name.strip(), payload.email, payload.department, payload.role or "Operador", now()),
        )
        return row_to_user(conn.execute("select * from users where id = ?", (user_id,)).fetchone())


@app.get("/api/users/{user_id}", response_model=User)
def get_user(user_id: str) -> dict[str, Any]:
    with db() as conn:
        return row_to_user(ensure_user(conn, user_id))


@app.get("/api/users/{user_id}/processes", response_model=list[Process])
def list_user_processes(user_id: str) -> list[dict[str, Any]]:
    with db() as conn:
        ensure_user(conn, user_id)
        rows = conn.execute(
            "select * from processes where user_id = ? order by coalesce(nullif(deadline, ''), '9999-12-31'), created_at",
            (user_id,),
        ).fetchall()
        return [row_to_process(row) for row in rows]


@app.post("/api/users/{user_id}/processes", response_model=ProcessWithHistory, status_code=status.HTTP_201_CREATED)
def create_process(user_id: str, payload: ProcessCreate) -> dict[str, Any]:
    validate_status(payload.status)
    validate_priority(payload.priority)
    process_id = new_id()
    created = now()
    with db() as conn:
        ensure_user(conn, user_id)
        conn.execute(
            """
            insert into processes (
                id, user_id, number, year, subject, secretary, owner, priority, arrival_date,
                from_sector, purpose, deadline, status, exit_date, to_sector, exit_purpose,
                docs, notes, created_at, updated_at
            )
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                process_id,
                user_id,
                payload.number,
                payload.year,
                payload.subject,
                payload.secretary,
                payload.owner,
                payload.priority,
                payload.arrival_date,
                payload.from_sector,
                payload.purpose,
                payload.deadline,
                payload.status,
                payload.exit_date,
                payload.to_sector,
                payload.exit_purpose,
                json.dumps(payload.docs, ensure_ascii=False),
                payload.notes,
                created,
                created,
            ),
        )
        insert_history(
            conn,
            process_id=process_id,
            user_id=user_id,
            date=payload.arrival_date or created[:10],
            action="Entrada registrada",
            status_value=payload.status,
            to=payload.owner,
            purpose=payload.purpose or "Cadastro inicial",
            notes="Processo cadastrado na API AtlasFlow.",
        )
        return get_process_payload(conn, process_id)


@app.get("/api/processes/{process_id}", response_model=ProcessWithHistory)
def get_process(process_id: str) -> dict[str, Any]:
    with db() as conn:
        return get_process_payload(conn, process_id)


@app.put("/api/processes/{process_id}", response_model=ProcessWithHistory)
def update_process(process_id: str, payload: ProcessUpdate) -> dict[str, Any]:
    validate_status(payload.status)
    validate_priority(payload.priority)
    with db() as conn:
        old = ensure_process(conn, process_id)
        conn.execute(
            """
            update processes
               set number = ?, year = ?, subject = ?, secretary = ?, owner = ?, priority = ?,
                   arrival_date = ?, from_sector = ?, purpose = ?, deadline = ?, status = ?,
                   exit_date = ?, to_sector = ?, exit_purpose = ?, docs = ?, notes = ?, updated_at = ?
             where id = ?
            """,
            (
                payload.number,
                payload.year,
                payload.subject,
                payload.secretary,
                payload.owner,
                payload.priority,
                payload.arrival_date,
                payload.from_sector,
                payload.purpose,
                payload.deadline,
                payload.status,
                payload.exit_date,
                payload.to_sector,
                payload.exit_purpose,
                json.dumps(payload.docs, ensure_ascii=False),
                payload.notes,
                now(),
                process_id,
            ),
        )
        if old["status"] != payload.status:
            insert_history(
                conn,
                process_id=process_id,
                user_id=old["user_id"],
                date=now()[:10],
                action="Status alterado",
                status_value=payload.status,
                to=payload.to_sector,
                purpose=payload.exit_purpose or payload.purpose,
                notes="Alteracao feita pela edicao do cadastro.",
            )
        return get_process_payload(conn, process_id)


@app.delete("/api/processes/{process_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_process(process_id: str) -> None:
    with db() as conn:
        ensure_process(conn, process_id)
        conn.execute("delete from processes where id = ?", (process_id,))


@app.post("/api/processes/{process_id}/movements", response_model=ProcessWithHistory)
def move_process(process_id: str, payload: MovementCreate) -> dict[str, Any]:
    validate_status(payload.status)
    with db() as conn:
        process = ensure_process(conn, process_id)
        exit_date = payload.date if payload.status in {"devolver", "concluido"} else process["exit_date"]
        to_sector = payload.to if payload.status in {"devolver", "concluido"} else process["to_sector"]
        exit_purpose = payload.purpose if payload.status in {"devolver", "concluido"} else process["exit_purpose"]
        conn.execute(
            """
            update processes
               set status = ?, exit_date = ?, to_sector = ?, exit_purpose = ?, updated_at = ?
             where id = ?
            """,
            (payload.status, exit_date, to_sector, exit_purpose, now(), process_id),
        )
        insert_history(
            conn,
            process_id=process_id,
            user_id=process["user_id"],
            date=payload.date or now()[:10],
            action="Movimentacao registrada",
            status_value=payload.status,
            to=payload.to,
            purpose=payload.purpose,
            notes=payload.notes,
        )
        return get_process_payload(conn, process_id)


@app.get("/api/users/{user_id}/history", response_model=list[HistoryItem])
def list_user_history(user_id: str) -> list[dict[str, Any]]:
    with db() as conn:
        ensure_user(conn, user_id)
        rows = conn.execute(
            "select * from history where user_id = ? order by date desc, created_at desc",
            (user_id,),
        ).fetchall()
        return [row_to_history(row) for row in rows]


def get_process_payload(conn: sqlite3.Connection, process_id: str) -> dict[str, Any]:
    process = row_to_process(ensure_process(conn, process_id))
    history = conn.execute(
        "select * from history where process_id = ? order by date desc, created_at desc",
        (process_id,),
    ).fetchall()
    process["history"] = [row_to_history(row) for row in history]
    return process
