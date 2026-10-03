from database import engine, SessionLocal, Base
from models import Course, PI, Mentor, Batch, Student, MentorHistory
from auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Course).first():
            print("Database already contains data. Skipping seed.")
            return

        print("Seeding database...")

        # 1. Create Courses
        course_mca = Course(name="Master of Computer Applications")
        course_btech = Course(name="Bachelor of Technology in CS")
        db.add_all([course_mca, course_btech])
        db.commit()
        db.refresh(course_mca)
        db.refresh(course_btech)

        # 2. Create PIs
        pi_mca = PI(
            name="Program In-charge",
            email="pi@example.com",
            password_hash=hash_password("your-password"),
            course_id=course_mca.id
        )
        pi_btech = PI(
            name="Dr. Grace Hopper",
            email="pi.cs@example.com",
            password_hash=hash_password("password123"),
            course_id=course_btech.id
        )
        db.add_all([pi_mca, pi_btech])
        db.commit()

        # 3. Create Mentors for MCA
        mentor1 = Mentor(name="Dr. Sarah Jenkins", email="sarah.j@university.edu", course_id=course_mca.id)
        mentor2 = Mentor(name="Prof. Robert Smith", email="robert.s@university.edu", course_id=course_mca.id)
        mentor3 = Mentor(name="Dr. Emily Davis", email="emily.d@university.edu", course_id=course_mca.id)
        mentor4 = Mentor(name="Prof. Michael Brown", email="michael.b@university.edu", course_id=course_mca.id)
        mentor5 = Mentor(name="Dr. David Wilson", email="david.w@university.edu", course_id=course_mca.id)

        # Mentors for B.Tech CS
        mentor_bt1 = Mentor(name="Dr. James Miller", email="james.m@university.edu", course_id=course_btech.id)
        mentor_bt2 = Mentor(name="Prof. Lisa Taylor", email="lisa.t@university.edu", course_id=course_btech.id)

        db.add_all([mentor1, mentor2, mentor3, mentor4, mentor5, mentor_bt1, mentor_bt2])
        db.commit()

        # 4. Create Batches
        batch1 = Batch(label="2022-2027", course_id=course_mca.id, mentor_id=mentor1.id)
        batch2 = Batch(label="2023-2028", course_id=course_mca.id, mentor_id=mentor2.id)
        batch3 = Batch(label="2021-2025", course_id=course_btech.id, mentor_id=mentor_bt1.id)

        db.add_all([batch1, batch2, batch3])
        db.commit()

        # 5. Create Students for Batch 1 (50 students)
        students_b1 = []
        first_names = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Sam", "Dakota", "Reese", "Quinn"]
        last_names = ["Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson"]

        for i in range(1, 51):
            fn = first_names[(i - 1) % len(first_names)]
            ln = last_names[(i // len(first_names)) % len(last_names)]
            name = f"{fn} {ln} {i}"
            roll_no = f"MCA2022{i:03d}"
            email = f"student{i}@mca2022.edu"
            contact = f"+1-555-0{i:03d}"
            students_b1.append(Student(name=name, roll_no=roll_no, email=email, contact=contact, batch_id=batch1.id))

        # Students for Batch 2 (50 students)
        students_b2 = []
        for i in range(1, 51):
            fn = first_names[(i + 2) % len(first_names)]
            ln = last_names[(i + 1) % len(last_names)]
            name = f"{fn} {ln} {i}"
            roll_no = f"MCA2023{i:03d}"
            email = f"student{i}@mca2023.edu"
            contact = f"+1-555-1{i:03d}"
            students_b2.append(Student(name=name, roll_no=roll_no, email=email, contact=contact, batch_id=batch2.id))

        # Students for Batch 3 (30 students)
        students_b3 = []
        for i in range(1, 31):
            name = f"CS Student {i}"
            roll_no = f"CS2021{i:03d}"
            email = f"student{i}@cs2021.edu"
            contact = f"+1-555-2{i:03d}"
            students_b3.append(Student(name=name, roll_no=roll_no, email=email, contact=contact, batch_id=batch3.id))

        db.add_all(students_b1 + students_b2 + students_b3)
        db.commit()

        # Initial Mentor History record
        history1 = MentorHistory(
            batch_id=batch1.id,
            old_mentor_id=mentor5.id,
            new_mentor_id=mentor1.id,
            reason="Faculty reassignment for the upcoming academic session",
            changed_by_pi_id=pi_mca.id
        )
        db.add(history1)
        db.commit()

        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
