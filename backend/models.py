from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)

    pis = relationship("PI", back_populates="course", cascade="all, delete-orphan")
    batches = relationship("Batch", back_populates="course", cascade="all, delete-orphan")
    mentors = relationship("Mentor", back_populates="course", cascade="all, delete-orphan")

class PI(Base):
    __tablename__ = "pis"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)

    course = relationship("Course", back_populates="pis")

class Mentor(Base):
    __tablename__ = "mentors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)

    course = relationship("Course", back_populates="mentors")

class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(100), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), index=True, nullable=False)
    mentor_id = Column(Integer, ForeignKey("mentors.id"), nullable=True)

    course = relationship("Course", back_populates="batches")
    mentor = relationship("Mentor", foreign_keys=[mentor_id])
    students = relationship("Student", back_populates="batch", cascade="all, delete-orphan")
    history_records = relationship("MentorHistory", back_populates="batch", cascade="all, delete-orphan")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    roll_no = Column(String(100), index=True, nullable=False)
    email = Column(String(255), nullable=True)
    contact = Column(String(100), nullable=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), index=True, nullable=False)

    batch = relationship("Batch", back_populates="students")

class MentorHistory(Base):
    __tablename__ = "mentor_history"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), index=True, nullable=False)
    old_mentor_id = Column(Integer, ForeignKey("mentors.id"), nullable=True)
    new_mentor_id = Column(Integer, ForeignKey("mentors.id"), nullable=False)
    reason = Column(Text, nullable=False)
    changed_by_pi_id = Column(Integer, ForeignKey("pis.id"), nullable=False)
    changed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    batch = relationship("Batch", back_populates="history_records")
    old_mentor = relationship("Mentor", foreign_keys=[old_mentor_id])
    new_mentor = relationship("Mentor", foreign_keys=[new_mentor_id])
    changed_by_pi = relationship("PI", foreign_keys=[changed_by_pi_id])
