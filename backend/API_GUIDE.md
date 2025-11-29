# Math Tutor Backend API Guide

This guide explains how to interact with the Flask backend API provided in `math_tutor_backend.ipynb`.

## Base URL
Since you are running on **Google Colab**, you will use the **Ngrok Public URL** provided at the end of the notebook execution.
Example: `https://1234-56-78-90.ngrok-free.app`

**Important**: This URL changes every time you restart the Colab runtime.

---

## Endpoints

### 1. Chat (Text Only)
Use this endpoint for text-based math questions.

- **URL**: `/api/chat`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "message": "Solve for x: 2x + 5 = 15"
  }
  ```

- **Success Response (200 OK)**:
  ```json
  {
    "explanation": "Let's look at the equation. What happens if you subtract 5 from both sides?",
    "encouragement": "You're doing great! Keep balancing the equation.",
    "debug_pipeline": { ... }
  }
  ```

- **Example `curl`**:
  ```bash
  curl -X POST http://localhost:5000/api/chat \
       -H "Content-Type: application/json" \
       -d '{"message": "What is the derivative of x^2?"}'
  ```

---

### 2. Analyze (Image + Text)
Use this endpoint when uploading an image of a math problem.

- **URL**: `/api/analyze`
- **Method**: `POST`
- **Headers**: `Content-Type: multipart/form-data`
- **Body**:
  - `image`: The image file (binary).
  - `message`: (Optional) Additional text context from the user.

- **Success Response (200 OK)**:
  ```json
  {
    "explanation": "I see a triangle. Since it's a right triangle, which theorem relates the sides?",
    "encouragement": "Good start! Think about Pythagoras.",
    "debug_pipeline": {
        "stage_1_ocr": "Raw text from image...",
        "stage_2_clean_problem": "Cleaned math problem...",
        ...
    }
  }
  ```

- **Example `curl`**:
  ```bash
  curl -X POST http://localhost:5000/api/analyze \
       -F "image=@/path/to/your/math_problem.jpg" \
       -F "message=Help me solve this"
  ```

---

## Response Structure
Both endpoints return a standard JSON object:

| Field | Type | Description |
|-------|------|-------------|
| `explanation` | String | The Socratic hint or guiding question. **It will NOT be the direct answer.** |
| `encouragement` | String | A short, positive phrase to motivate the student. |
| `debug_pipeline` | Object | (Optional) Internal logs showing the OCR text, cleaned problem, and verification steps. Useful for debugging. |
| `error` | String | (Error Case) Description of what went wrong. |
