from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import os
import shutil
import json
from core.database import get_db
from core.models import Template, Batch, StudentCertificate
from core.csv_parser import process_csv
from core.tasks import process_batch_background

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/templates")
async def upload_template(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    template = Template(
        file_path=file_path,
        original_filename=file.filename,
        # Default field for testing if frontend visual editor isn't ready
        field_positions=[{
            "csv_column": "name",
            "x": 300,
            "y": 500,
            "max_width": 400,
            "font_size": 36,
            "color": "#000000",
            "alignment": "center"
        }]
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return {"template_id": template.id, "filename": template.original_filename}

@router.post("/batches")
async def create_batch(
    template_id: int = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    # Verify template exists
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalars().first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    csv_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(csv_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        valid_rows, invalid_rows = process_csv(csv_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    batch = Batch(
        template_id=template_id,
        name=file.filename,
        total_rows=len(valid_rows) + len(invalid_rows),
        valid_rows=len(valid_rows),
        invalid_rows=len(invalid_rows)
    )
    db.add(batch)
    await db.commit()
    await db.refresh(batch)
    
    # Store student rows
    for row in valid_rows:
        custom_fields = {k: v for k, v in row.items() if k not in ['name', 'email']}
        cert = StudentCertificate(
            batch_id=batch.id,
            name=row['name'],
            email=row['email'],
            custom_fields=custom_fields
        )
        db.add(cert)
        
    for row in invalid_rows:
        custom_fields = {k: v for k, v in row.items() if k not in ['name', 'email', 'failure_reason']}
        cert = StudentCertificate(
            batch_id=batch.id,
            name=row.get('name', 'Unknown'),
            email=row.get('email', 'Unknown'),
            custom_fields=custom_fields,
            send_status="failed",
            failure_reason=row.get('failure_reason')
        )
        db.add(cert)
        
    await db.commit()
    return {"batch_id": batch.id, "valid_rows": batch.valid_rows, "invalid_rows": batch.invalid_rows}

@router.post("/batches/{batch_id}/send")
async def send_batch(batch_id: int, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Batch).where(Batch.id == batch_id))
    batch = result.scalars().first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    if batch.status == "processing":
        raise HTTPException(status_code=400, detail="Batch is already processing")
        
    background_tasks.add_task(process_batch_background, batch_id)
    return {"message": "Batch processing started in background"}

@router.get("/batches/{batch_id}/status")
async def get_batch_status(batch_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Batch).where(Batch.id == batch_id))
    batch = result.scalars().first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    # Get stats
    res_certs = await db.execute(select(StudentCertificate).where(StudentCertificate.batch_id == batch_id))
    certs = res_certs.scalars().all()
    
    sent = sum(1 for c in certs if c.send_status == "sent")
    failed = sum(1 for c in certs if c.send_status == "failed")
    pending = sum(1 for c in certs if c.send_status == "pending")
    
    return {
        "status": batch.status,
        "sent": sent,
        "failed": failed,
        "pending": pending,
        "total": batch.total_rows
    }
