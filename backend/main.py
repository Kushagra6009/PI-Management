from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from database import engine, Base, get_db
from models import Course, PI, Mentor, Batch, Student, MentorHistory
from auth import verify_password, create_access_token, get_current_pi

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PI Management System API",
    description="Backend API for Program In-charge (PI) Academic Administration System",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    token: str
    name: str

class MentorChangeRequest(BaseModel):
    new_mentor_id: int
    reason: str = Field(..., min_length=1, description="Reason for mentor change is required")

# --- Routes ---

@app.post("/auth/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    pi = db.query(PI).filter(PI.email == request.email).first()
    if not pi or not verify_password(request.password, pi.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_access_token(data={"sub": pi.email})
    return {"token": token, "name": pi.name}

@app.get("/dashboard")
def get_dashboard(current_pi: PI = Depends(get_current_pi), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == current_pi.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Assigned course not found")

    # Course-isolated batch count
    batches = db.query(Batch).filter(Batch.course_id == current_pi.course_id).all()
    batch_ids = [b.id for b in batches]

    # Total student count across PI's course batches
    total_students = db.query(func.count(Student.id)).filter(Student.batch_id.in_(batch_ids)).scalar() if batch_ids else 0

    # Total mentors count for PI's course
    total_mentors = db.query(func.count(Mentor.id)).filter(Mentor.course_id == current_pi.course_id).scalar()

    batch_list = []
    for b in batches:
        student_count = db.query(func.count(Student.id)).filter(Student.batch_id == b.id).scalar()
        batch_list.append({
            "id": b.id,
            "label": b.label,
            "mentor_id": b.mentor_id,
            "mentor_name": b.mentor.name if b.mentor else None,
            "student_count": student_count
        })

    return {
        "course": course.name,
        "pi_name": current_pi.name,
        "totals": {
            "batches": len(batches),
            "students": total_students,
            "mentors": total_mentors
        },
        "batches": batch_list
    }

@app.get("/batches/{id}/students")
def get_batch_students(
    id: int,
    search: Optional[str] = Query(None),
    current_pi: PI = Depends(get_current_pi),
    db: Session = Depends(get_db)
):
    # Enforce course-level isolation
    batch = db.query(Batch).filter(Batch.id == id, Batch.course_id == current_pi.course_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found in your assigned course")

    query = db.query(Student).filter(Student.batch_id == batch.id)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Student.name.ilike(search_term),
                Student.roll_no.ilike(search_term)
            )
        )

    students = query.order_by(Student.roll_no.asc()).all()

    student_list = [
        {
            "id": s.id,
            "name": s.name,
            "roll_no": s.roll_no,
            "email": s.email,
            "contact": s.contact
        }
        for s in students
    ]

    return {
        "batch_id": batch.id,
        "batch_label": batch.label,
        "course_name": current_pi.course.name,
        "mentor": {
            "id": batch.mentor.id,
            "name": batch.mentor.name,
            "email": batch.mentor.email
        } if batch.mentor else None,
        "students": student_list
    }

@app.get("/students/{id}")
def get_student_profile(
    id: int,
    current_pi: PI = Depends(get_current_pi),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Verify course ownership
    if student.batch.course_id != current_pi.course_id:
        raise HTTPException(status_code=404, detail="Student not found in your assigned course")

    batch = student.batch
    return {
        "id": student.id,
        "name": student.name,
        "roll_no": student.roll_no,
        "email": student.email,
        "contact": student.contact,
        "batch_id": batch.id,
        "batch_label": batch.label,
        "course_name": batch.course.name,
        "mentor_id": batch.mentor_id,
        "mentor_name": batch.mentor.name if batch.mentor else None
    }

@app.get("/mentors")
def get_mentors(current_pi: PI = Depends(get_current_pi), db: Session = Depends(get_db)):
    mentors = db.query(Mentor).filter(Mentor.course_id == current_pi.course_id).order_by(Mentor.name.asc()).all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "email": m.email
        }
        for m in mentors
    ]

@app.put("/batches/{id}/mentor")
def update_batch_mentor(
    id: int,
    request: MentorChangeRequest,
    current_pi: PI = Depends(get_current_pi),
    db: Session = Depends(get_db)
):
    if not request.reason or not request.reason.strip():
        raise HTTPException(status_code=400, detail="Reason for mentor change is required")

    # 1. Verify batch belongs to PI's course
    batch = db.query(Batch).filter(Batch.id == id, Batch.course_id == current_pi.course_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found in your assigned course")

    # 2. Verify new mentor exists and belongs to PI's course
    new_mentor = db.query(Mentor).filter(
        Mentor.id == request.new_mentor_id,
        Mentor.course_id == current_pi.course_id
    ).first()
    if not new_mentor:
        raise HTTPException(status_code=400, detail="Selected mentor is invalid or does not belong to your course")

    old_mentor_id = batch.mentor_id

    # Transactional execution: update mentor & insert history atomically
    try:
        batch.mentor_id = new_mentor.id

        history_entry = MentorHistory(
            batch_id=batch.id,
            old_mentor_id=old_mentor_id,
            new_mentor_id=new_mentor.id,
            reason=request.reason.strip(),
            changed_by_pi_id=current_pi.id
        )
        db.add(history_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update mentor assignment: {str(e)}")

    return {
        "message": "Mentor updated successfully",
        "batch_id": batch.id,
        "new_mentor_name": new_mentor.name
    }

@app.get("/batches/{id}/mentor-history")
def get_batch_mentor_history(
    id: int,
    current_pi: PI = Depends(get_current_pi),
    db: Session = Depends(get_db)
):
    # Verify batch belongs to PI's course
    batch = db.query(Batch).filter(Batch.id == id, Batch.course_id == current_pi.course_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found in your assigned course")

    history = db.query(MentorHistory).filter(
        MentorHistory.batch_id == batch.id
    ).order_by(MentorHistory.changed_at.desc()).all()

    result = []
    for h in history:
        result.append({
            "id": h.id,
            "batch_id": h.batch_id,
            "batch_label": batch.label,
            "old_mentor_id": h.old_mentor_id,
            "old_mentor_name": h.old_mentor.name if h.old_mentor else "None",
            "new_mentor_id": h.new_mentor_id,
            "new_mentor_name": h.new_mentor.name if h.new_mentor else "Unknown",
            "reason": h.reason,
            "changed_by_pi_id": h.changed_by_pi_id,
            "changed_by_pi_name": h.changed_by_pi.name if h.changed_by_pi else "Unknown",
            "changed_at": h.changed_at.isoformat()
        })

    return result
