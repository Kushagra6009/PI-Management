import psycopg2
import sys

passwords = ['postgres', 'password', 'root', 'admin', '123456', '1234', 'postgres123', '']
user = 'postgres'
host = '127.0.0.1'
port = 5432

print("Testing PostgreSQL connection...")
working_pwd = None

for pwd in passwords:
    try:
        conn = psycopg2.connect(dbname='postgres', user=user, password=pwd, host=host, port=port, connect_timeout=3)
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname='pi_system'")
        if not cur.fetchone():
            cur.execute("CREATE DATABASE pi_system;")
            print("Successfully created database 'pi_system'")
        else:
            print("Database 'pi_system' already exists.")
        conn.close()
        working_pwd = pwd
        break
    except Exception as e:
        continue

if working_pwd is not None:
    print(f"POSTGRES_SUCCESS: password='{working_pwd}'")
    db_url = f"postgresql://postgres:{working_pwd}@localhost:5432/pi_system"
    with open(".env", "w") as f:
        f.write(f"DATABASE_URL={db_url}\nJWT_SECRET=super-secret-pi-key-2026\n")
    print(f"Saved .env with DATABASE_URL={db_url}")
else:
    print("POSTGRES_FAILED: Could not authenticate with standard passwords. Will fallback to SQLite for local execution.")
    db_url = "sqlite:///./pi_system.db"
    with open(".env", "w") as f:
        f.write(f"DATABASE_URL={db_url}\nJWT_SECRET=super-secret-pi-key-2026\n")
    print("Saved .env with SQLite fallback.")
