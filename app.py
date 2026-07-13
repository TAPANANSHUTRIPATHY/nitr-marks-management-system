import hmac
import hashlib
import base64
import json
import time
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
import database

app = Flask(__name__)

# Initialize database on startup
database.initialize_database()

# --- JWT Config ---
SECRET_KEY = "capes_nit_rourkela_super_secret_key_777"

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def create_jwt(payload: dict, expires_in: int = 86400) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = payload.copy()
    payload["exp"] = int(time.time()) + expires_in
    
    header_b64 = base64url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = base64url_encode(json.dumps(payload).encode('utf-8'))
    
    signature_base = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signature_base, hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode_jwt(token: str) -> dict | None:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts
        
        signature_base = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_signature = hmac.new(SECRET_KEY.encode('utf-8'), signature_base, hashlib.sha256).digest()
        expected_signature_b64 = base64url_encode(expected_signature)
        
        if not hmac.compare_digest(signature_b64, expected_signature_b64):
            return None
            
        payload = json.loads(base64url_decode(payload_b64).decode('utf-8'))
        if payload.get("exp", 0) < time.time():
            return None
            
        return payload
    except Exception:
        return None

# --- Auth Decorators ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({"message": "Authentication token missing!"}), 401
        
        user_data = decode_jwt(token)
        if not user_data:
            return jsonify({"message": "Token is invalid or expired!"}), 401
            
        return f(user_data, *args, **kwargs)
    return decorated

def roles_allowed(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(user_data, *args, **kwargs):
            if user_data.get('role') not in roles:
                return jsonify({"message": "Access Denied: Insufficient privileges!"}), 403
            return f(user_data, *args, **kwargs)
        return decorated
    return decorator

# --- Static Routes ---
@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# --- API Routes ---

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"message": "Username and password are required!"}), 400
        
    user = database.verify_user(username, password)
    if not user:
        return jsonify({"message": "Invalid username or password!"}), 401
        
    # Get extra details based on role
    role_details = database.get_user_role_details(user['id'], user['role'])
    
    # Store essential info in token payload
    token_payload = {
        "id": user['id'],
        "username": user['username'],
        "role": user['role'],
        "full_name": user['full_name'],
        "program_id": role_details.get('program_id'),
        "department": role_details.get('department'),
        "roll_number": role_details.get('roll_number')
    }
    
    token = create_jwt(token_payload)
    return jsonify({
        "token": token,
        "user": token_payload
    })

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_me(user_data):
    return jsonify(user_data)

@app.route('/api/analytics', methods=['GET'])
@token_required
@roles_allowed('Head of the Department', 'Coordinator')
def get_app_analytics(user_data):
    analytics = database.get_analytics()
    return jsonify(analytics)

@app.route('/api/students', methods=['GET'])
@token_required
@roles_allowed('Head of the Department', 'Coordinator')
def get_students_list(user_data):
    search = request.args.get('search')
    
    if user_data['role'] == 'Coordinator':
        # Coordinators only see students in their assigned program
        students = database.get_students(program_id=user_data['program_id'], search_query=search)
    else:
        # Super Admin can see all students
        program_filter = request.args.get('program_id')
        students = database.get_students(program_id=program_filter, search_query=search)
        
    return jsonify(students)

@app.route('/api/students', methods=['POST'])
@token_required
@roles_allowed('Head of the Department', 'Coordinator')
def create_student(user_data):
    data = request.get_json() or {}
    roll = data.get('roll_number')
    name = data.get('full_name')
    program = data.get('program_id')
    department = data.get('department')
    semester = data.get('semester')
    email = data.get('email')
    password = data.get('password')
    
    if not all([roll, name, program, department, semester, email, password]):
        return jsonify({"message": "All fields are required!"}), 400
        
    # Coordinator validation
    if user_data['role'] == 'Coordinator' and program != user_data['program_id']:
        return jsonify({"message": "You can only add students to your own program!"}), 403
        
    try:
        semester = int(semester)
        user_id = database.add_student(roll, name, program, department, semester, email, password)
        return jsonify({"message": "Student created successfully", "user_id": user_id}), 201
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        return jsonify({"message": f"Server Error: {str(e)}"}), 500

@app.route('/api/students/<roll_number>', methods=['DELETE'])
@token_required
@roles_allowed('Head of the Department', 'Coordinator')
def remove_student(user_data, roll_number):
    # If coordinator, check program permissions
    if user_data['role'] == 'Coordinator':
        students = database.get_students(program_id=user_data['program_id'])
        rolls = [s['roll_number'] for s in students]
        if roll_number not in rolls:
            return jsonify({"message": "Permission Denied: Student not in your program!"}), 403
            
    try:
        database.delete_student(roll_number)
        return jsonify({"message": f"Student {roll_number} deleted successfully"})
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        return jsonify({"message": f"Server Error: {str(e)}"}), 500

@app.route('/api/subjects', methods=['GET'])
@token_required
def get_subjects_list(user_data):
    program_filter = request.args.get('program_id')
    subjects = database.get_subjects(program_id=program_filter)
    return jsonify(subjects)

@app.route('/api/marks', methods=['GET'])
@token_required
@roles_allowed('Head of the Department', 'Coordinator')
def get_marks_list(user_data):
    search = request.args.get('search')
    if user_data['role'] == 'Coordinator':
        # Return marks for coordinator's assigned subjects
        marks = database.get_coordinator_students_marks(user_data['id'], search_query=search)
        return jsonify(marks)
    else:
        # Super Admin sees marks of all students
        program_filter = request.args.get('program_id')
        students = database.get_students(program_id=program_filter, search_query=search)
        
        all_marks = []
        for s in students:
            report = database.get_student_report_card(s['roll_number'])
            if report:
                for m in report['marks']:
                    all_marks.append({
                        "roll_number": s['roll_number'],
                        "full_name": s['full_name'],
                        "department": s['department'],
                        "semester": s['semester'],
                        "subject_code": m['subject_code'],
                        "subject_name": m['subject_name'],
                        "pre_mid_marks": m['pre_mid_marks'],
                        "post_mid_marks": m['post_mid_marks'],
                        "total_marks": m['total_marks'],
                        "grade": m['grade'],
                        "session": m['session']
                    })
        return jsonify(all_marks)

@app.route('/api/marks', methods=['POST'])
@token_required
@roles_allowed('Head of the Department', 'Coordinator')
def save_student_marks(user_data):
    data = request.get_json() or {}
    roll = data.get('student_roll')
    subject = data.get('subject_code')
    session = data.get('session', '2025-2026')
    semester = data.get('semester')
    pre_mid = data.get('pre_mid_marks')
    post_mid = data.get('post_mid_marks')
    
    if roll is None or subject is None or semester is None or pre_mid is None or post_mid is None:
        return jsonify({"message": "Missing required fields!"}), 400
        
    try:
        semester = int(semester)
        pre_mid = float(pre_mid)
        post_mid = float(post_mid)
        
        result = database.save_marks(roll, subject, session, semester, pre_mid, post_mid, user_data['id'])
        return jsonify({"message": "Marks saved successfully!", "data": result})
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except PermissionError as pe:
        return jsonify({"message": str(pe)}), 403
    except Exception as e:
        return jsonify({"message": f"Server Error: {str(e)}"}), 500

@app.route('/api/marks/report', methods=['GET'])
@token_required
def get_report_card(user_data):
    roll = request.args.get('roll_number')
    
    # If Student role, force reading their own report card
    if user_data['role'] == 'Student':
        roll = user_data['roll_number']
        
    if not roll:
        return jsonify({"message": "Roll number is required!"}), 400
        
    # Security check for coordinators
    if user_data['role'] == 'Coordinator':
        students = database.get_students(program_id=user_data['program_id'])
        rolls = [s['roll_number'] for s in students]
        if roll not in rolls:
            return jsonify({"message": "Access Denied: Student is not in your department program!"}), 403
            
    report = database.get_student_report_card(roll)
    if not report:
        return jsonify({"message": "Student report card not found!"}), 404
        
    return jsonify(report)

@app.route('/api/coordinators', methods=['GET'])
@token_required
@roles_allowed('Head of the Department')
def get_coords_list(user_data):
    coords = database.get_coordinators()
    return jsonify(coords)

@app.route('/api/coordinators', methods=['POST'])
@token_required
@roles_allowed('Head of the Department')
def create_coord(user_data):
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    name = data.get('full_name')
    program = data.get('program_id')
    department = data.get('department')
    
    if not all([username, password, name, program, department]):
        return jsonify({"message": "All fields are required!"}), 400
        
    try:
        user_id = database.add_coordinator(username, password, name, program, department)
        return jsonify({"message": "Coordinator created successfully", "user_id": user_id}), 201
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        return jsonify({"message": f"Server Error: {str(e)}"}), 500

@app.route('/api/coordinators/<int:coord_id>', methods=['DELETE'])
@token_required
@roles_allowed('Head of the Department')
def remove_coord(user_data, coord_id):
    try:
        database.delete_coordinator(coord_id)
        return jsonify({"message": "Coordinator deleted successfully"})
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        return jsonify({"message": f"Server Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
