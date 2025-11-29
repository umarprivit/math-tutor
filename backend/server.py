import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import pytesseract
import io
from pyngrok import ngrok
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

# ==========================================
# CONFIGURATION
# ==========================================
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "AIzaSyDK1K9_YenlisM8IPj_5wvy-I_GmTT5kS8")
NGROK_AUTH_TOKEN = os.getenv("NGROK_AUTH_TOKEN", "2jWXaOrBQ0bThNhjrUBmV4ne5th_5yDbwL2aDoPe9Bf3R9fvM")

if GOOGLE_API_KEY == "YOUR_GEMINI_API_KEY":
    print("WARNING: GOOGLE_API_KEY is not set. Please set it in .env or environment variables.")

if NGROK_AUTH_TOKEN == "YOUR_NGROK_AUTH_TOKEN":
    print("WARNING: NGROK_AUTH_TOKEN is not set. Please set it in .env or environment variables.")

os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
genai.configure(api_key=GOOGLE_API_KEY)

# Authenticate ngrok
if NGROK_AUTH_TOKEN != "YOUR_NGROK_AUTH_TOKEN":
    ngrok.set_auth_token(NGROK_AUTH_TOKEN)

# ==========================================
# FLASK APP SETUP
# ==========================================
app = Flask(__name__)
# Enable CORS for all domains, allowing all headers (including ngrok)
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": "*", "methods": ["GET", "POST", "OPTIONS"]}})

# Add additional CORS headers via after_request for maximum compatibility
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = '*'
    response.headers['Access-Control-Max-Age'] = '3600'
    return response

# Log all incoming requests
@app.before_request
def log_request():
    print(f"\n{'='*50}")
    print(f"Incoming {request.method} request to {request.path}")
    print(f"Headers: {dict(request.headers)}")
    if request.method == 'POST':
        if request.is_json:
            print(f"JSON Body: {request.json}")
        elif request.files:
            print(f"Files: {list(request.files.keys())}")
        elif request.form:
            print(f"Form Data: {dict(request.form)}")
    print(f"{'='*50}\n")

# GLOBAL MEMORY STORAGE
# Format: { 'user_1': [msg1, msg2], 'user_2': [] }
USER_SESSIONS = {}

# Initialize Models
sanitizer_model = genai.GenerativeModel('gemini-2.5-flash')
solver_model = genai.GenerativeModel('gemini-2.5-flash')
verifier_model = genai.GenerativeModel('gemini-2.5-flash')
tutor_model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})

# ==========================================
# PIPELINE LOGIC
# ==========================================
def safe_generate(model, prompt_parts):
    """Safely generate content, handling blocked/empty responses."""
    try:
        response = model.generate_content(prompt_parts)
        if response.candidates and response.candidates[0].content.parts:
            return response.text
        else:
            print(f"Warning: Model returned empty response. Finish Reason: {response.candidates[0].finish_reason}")
            return ""
    except Exception as e:
        print(f"Generation Error: {e}")
        return ""

def format_history(history):
    """Format history list into a readable string with role labels."""
    if not history:
        return "No previous history."
    
    # Keep last 40 messages for context (20 exchanges)
    recent_history = history[-40:] if len(history) > 40 else history
    
    formatted = ""
    for i, msg in enumerate(recent_history):
        role = msg.get('role', 'unknown').upper()
        content = msg.get('content', '')
        # Add message number for better tracking
        formatted += f"[Message {i+1}] {role}: {content}\n\n"
    
    return formatted.strip()

def run_pipeline(image=None, user_text=None, history=None):
    pipeline_log = {}
    history = history or []
    history_text = format_history(history)

    # --- STAGE 1 & 2: Context Awareness & Extraction ---
    sanitizer_prompt = """
    Your goal is to identify the MAIN MATH PROBLEM being discussed in this conversation.
    
    CRITICAL: Read the FULL conversation history carefully to understand the context.
    
    Instructions:
    1. If there's an image, extract the math problem from it
    2. Check the conversation history for the original problem if the user is just answering/asking questions
    3. Look at the user's current message
    
    Common scenarios:
    - User uploads image with problem → Extract problem from image
    - User types problem → Return that exact problem  
    - User asks "Is it 5?" or "What about 10?" → Find the ORIGINAL problem from history
    - User says "yes", "no", "what's next?" → Keep the current problem from history
    
    Extract ONLY the math problem statement (e.g., "Solve 2x+5=10" or "Calculate the area of a circle with radius 5").
    DO NOT include the user's answer attempts.
    """
    
    prompt_parts = [sanitizer_prompt]
    
    if history:
        prompt_parts.append(f"\nConversation History:\n{history_text}\n")

    if image:
        prompt_parts.append("\n[User Uploaded Image]\n")
        prompt_parts.append(image)
    
    if user_text:
        prompt_parts.append(f"\nUser Current Message: {user_text}\n")

    clean_problem = safe_generate(sanitizer_model, prompt_parts).strip()
    pipeline_log['stage_1_2_context_extraction'] = clean_problem

    if not clean_problem:
        return {
            "explanation": "I'm a bit lost. Could you remind me what math problem we're working on?",
            "encouragement": "Just type the problem again!",
            "debug_pipeline": pipeline_log
        }

    # --- STAGE 3: Dual-Model Verification ---
    # 3a. Solver
    solver_prompt = f"Solve this math problem step-by-step: {clean_problem}"
    initial_solution = safe_generate(solver_model, solver_prompt)
    pipeline_log['stage_3a_solution'] = initial_solution

    # 3b. Verifier
    verifier_prompt = f"""
    Review this solution for correctness. 
    Problem: {clean_problem}
    Solution: {initial_solution}
    
    If it is correct, say 'CORRECT'. 
    If it is incorrect, provide the corrected solution.
    """
    verification = safe_generate(verifier_model, verifier_prompt)
    pipeline_log['stage_3b_verification'] = verification

    ground_truth = initial_solution if "CORRECT" in verification else verification

    # --- STAGE 4: The Socratic Tutor ---
    tutor_prompt = f"""
    You are a Socratic Math Tutor with full memory of the conversation.
    
    CRITICAL CONTEXT - READ CAREFULLY:
    Current Math Problem: {clean_problem}
    Correct Solution (DO NOT REVEAL): {ground_truth}
    
    FULL Conversation History (Read all messages to understand context):
    {history_text}
    
    User's Latest Input: {user_text if user_text else '[Image Uploaded]'}
    
    INSTRUCTIONS:
    1. READ the full conversation history above to understand where the student is in their learning journey
    2. Remember what hints you've already given - don't repeat them
    3. Build upon previous exchanges - reference what the student has already tried
    4. NEVER reveal the answer directly
    5. If the student's answer is correct, congratulate them enthusiastically
    6. If wrong, provide a gentle hint based on their attempt
    7. Be encouraging and remember this is a continuous conversation
    
    Return JSON format: {{ "explanation": "Your contextual response referencing the conversation...", "encouragement": "Encouraging message..." }}
    """
    final_response = safe_generate(tutor_model, tutor_prompt)
    
    try:
        result = json.loads(final_response)
        result['debug_pipeline'] = pipeline_log
        return result
    except:
        return {
            "explanation": final_response,
            "encouragement": "Let's keep going!",
            "debug_pipeline": pipeline_log
        }

# ==========================================
# API ROUTES
# ==========================================
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    user_id = data.get('userId', 'default_user') # Get User ID
    
    # Initialize history if not present
    if user_id not in USER_SESSIONS:
        USER_SESSIONS[user_id] = []
    
    # Add user message to history
    USER_SESSIONS[user_id].append({'role': 'user', 'content': user_message})
    
    try:
        response = run_pipeline(user_text=user_message, history=USER_SESSIONS[user_id])
        
        # Add assistant response to history
        assistant_msg = f"{response.get('explanation', '')} {response.get('encouragement', '')}"
        USER_SESSIONS[user_id].append({'role': 'assistant', 'content': assistant_msg})
        
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    file = request.files['image']
    user_message = request.form.get('message', '')
    user_id = request.form.get('userId', 'default_user') # Get User ID
    
    if user_id not in USER_SESSIONS:
        USER_SESSIONS[user_id] = []
        
    # Add user interaction to history
    USER_SESSIONS[user_id].append({'role': 'user', 'content': f"[Image Uploaded] {user_message}"})
    
    try:
        image = Image.open(file.stream)
        response = run_pipeline(image=image, user_text=user_message, history=USER_SESSIONS[user_id])
        
        # Add assistant response to history
        assistant_msg = f"{response.get('explanation', '')} {response.get('encouragement', '')}"
        USER_SESSIONS[user_id].append({'role': 'assistant', 'content': assistant_msg})
        
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reset', methods=['POST'])
def reset_session():
    data = request.json
    user_id = data.get('userId', 'default_user')
    if user_id in USER_SESSIONS:
        USER_SESSIONS[user_id] = []
    return jsonify({"status": "success", "message": f"Memory cleared for {user_id}"})

# ==========================================
# RUN SERVER
# ==========================================
if __name__ == '__main__':
    # Open a tunnel to port 5000
    try:
        public_url = ngrok.connect(5000).public_url
        print(f"\n🚀 Public URL: {public_url}\n")
        print("Copy this URL and use it in your Frontend!\n")
    except Exception as e:
        print(f"Ngrok Error: {e}")
        print("Running without ngrok tunnel...")

    app.run(port=5000)
