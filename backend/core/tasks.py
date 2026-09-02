import asyncio
import os
import uuid
import datetime
from sqlalchemy.future import select
from core.database import AsyncSessionLocal
from core.models import Batch, StudentCertificate, Template
from core.batch_generator import generate_batch
from core.mailer import send_certificate_email
from core.pdf_engine import generate_certificate
import re

async def process_batch_background(batch_id: int):
    """
    Background task to process a batch: generate PDFs and send emails.
    """
    async with AsyncSessionLocal() as session:
        # Fetch batch
        result = await session.execute(select(Batch).where(Batch.id == batch_id))
        batch = result.scalars().first()
        if not batch:
            return
            
        result = await session.execute(select(Template).where(Template.id == batch.template_id))
        template = result.scalars().first()
        if not template:
            return

        batch.status = "processing"
        await session.commit()
        
        # Fetch pending certificates
        result = await session.execute(
            select(StudentCertificate)
            .where(StudentCertificate.batch_id == batch_id)
            .where(StudentCertificate.send_status == "pending")
        )
        certificates = result.scalars().all()
        
        output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "generated", str(batch_id))
        os.makedirs(output_dir, exist_ok=True)
        
        field_mappings = template.field_positions or []
        
        for cert in certificates:
            try:
                # 1. Generate PDF
                text_fields = []
                for mapping in field_mappings:
                    col = mapping.get("csv_column")
                    if col:
                        # try to get from custom_fields or standard fields
                        val = ""
                        if col == "name":
                            val = cert.name
                        elif col == "email":
                            val = cert.email
                        elif cert.custom_fields and col in cert.custom_fields:
                            val = cert.custom_fields[col]
                            
                        field = mapping.copy()
                        field["text"] = str(val)
                        text_fields.append(field)
                
                safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', cert.name)
                filename = f"{safe_name}_{cert.id}.pdf"
                output_path = os.path.join(output_dir, filename)
                
                cert.certificate_path = output_path
                if not cert.certificate_id:
                    cert.certificate_id = str(uuid.uuid4())
                    
                # We need to run synchronous generate_certificate in a thread, but for now we'll just call it
                # In a heavy production app, use loop.run_in_executor
                verify_url = f"http://localhost:5173/verify/{cert.certificate_id}"
                generate_certificate(
                    template.file_path, 
                    output_path, 
                    text_fields,
                    qr_data=verify_url,
                    qr_position={"x": 650, "y": 50, "size": 100}
                )
                    
                # 2. Send Email
                # Hardcoded template for now. Could be fetched from database later.
                subject = "Your Certificate is Ready!"
                body = "Hi {name},\n\nPlease find your generated certificate attached.\n\nBest,\nAdmin Team"
                
                # Combine standard and custom fields for placeholder replacement
                data_dict = {"name": cert.name, "email": cert.email}
                if cert.custom_fields:
                    data_dict.update(cert.custom_fields)
                    
                success, msg = send_certificate_email(
                    cert.email, subject, body, data_dict, output_path
                )
                
                if success:
                    cert.send_status = "sent"
                    cert.sent_at = datetime.datetime.utcnow()
                else:
                    cert.send_status = "failed"
                    cert.failure_reason = msg
                    
            except Exception as e:
                cert.send_status = "failed"
                cert.failure_reason = str(e)
                
            await session.commit()
            await asyncio.sleep(1) # Artificial delay to simulate rate-limiting
            
        batch.status = "completed"
        batch.completed_at = datetime.datetime.utcnow()
        await session.commit()
