from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
import datetime
from core.database import Base

class Template(Base):
    __tablename__ = "templates"
    
    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    field_positions = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    batches = relationship("Batch", back_populates="template")

class Batch(Base):
    __tablename__ = "batches"
    
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False)
    name = Column(String, nullable=True)
    status = Column(String, default="pending") # pending, processing, completed
    total_rows = Column(Integer, default=0)
    valid_rows = Column(Integer, default=0)
    invalid_rows = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    template = relationship("Template", back_populates="batches")
    certificates = relationship("StudentCertificate", back_populates="batch")

class StudentCertificate(Base):
    __tablename__ = "student_certificates"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    custom_fields = Column(JSON, nullable=True)
    certificate_id = Column(String, unique=True, index=True, nullable=True) # For QR verification
    certificate_path = Column(String, nullable=True)
    send_status = Column(String, default="pending") # pending, sent, failed
    failure_reason = Column(String, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    
    batch = relationship("Batch", back_populates="certificates")
