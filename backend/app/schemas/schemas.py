"""
Pydantic Schemas for Request & Response Validation
Karachi WasteWatch AI (Section 11 + Authentication & Roles)
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field, EmailStr


# -----------------------------------------------------------------------------
# AUTH & USER SCHEMAS
# -----------------------------------------------------------------------------
class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email_or_id: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    citizen_id: Optional[str] = None
    admin_id: Optional[str] = None
    role: str
    phone: Optional[str] = None
    complaint_count: int = 0
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# -----------------------------------------------------------------------------
# REPORT & DETECTION SCHEMAS
# -----------------------------------------------------------------------------
class DetectionItem(BaseModel):
    class_id: int
    class_name: str
    confidence: float
    bbox: List[float]
    area_ratio: float


class AIDetectionOut(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    total_detections: int
    waste_coverage_pct: float
    detections: List[Dict[str, Any]]
    model_version: str


class SeverityOut(BaseModel):
    level: str
    score: float
    reason: str


class ReportBase(BaseModel):
    district: str
    area: Optional[str] = None
    latitude: float
    longitude: float
    description: Optional[str] = None


class ReportCreate(ReportBase):
    pass


class ReportEdit(BaseModel):
    district: Optional[str] = None
    area: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ReportOut(ReportBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    report_id: Optional[str] = None
    report_code: str
    citizen_id: Optional[int] = None
    status: str
    photo_path: str
    is_duplicate: bool
    image_hash: Optional[str] = None
    fraud_status: Optional[str] = "Authentic"
    authenticity_score: Optional[int] = 100
    hazard_level: Optional[str] = "SAFE / LOW"
    hazard_type: Optional[str] = None
    estimated_volume_m3: Optional[float] = 0.0
    estimated_tonnage: Optional[float] = 0.0
    recommended_vehicle: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class AssignmentCreate(BaseModel):
    assigned_team: str
    worker_notes: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str  # Pending, Verified, Assigned, In Progress, Resolved, Rejected
    notes: Optional[str] = None


class VerificationCreate(BaseModel):
    notes: Optional[str] = None


class AnalyticsSummary(BaseModel):
    total_reports: int
    pending_reports: int
    verified_reports: int
    assigned_reports: int
    resolved_reports: int
    rejected_reports: int
    high_severity_count: int
    avg_resolution_hours: float


# -----------------------------------------------------------------------------
# CHATBOT / RAG SCHEMAS
# -----------------------------------------------------------------------------
class ChatQuery(BaseModel):
    question: str


class ChatSource(BaseModel):
    title: str
    category: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[ChatSource] = []
    confidence: float = 0.0
