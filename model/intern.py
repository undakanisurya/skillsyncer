import streamlit as st
import requests
import os
import json
import random
from datetime import datetime
import os

# -----------------------------
# Gemini API configuration
# -----------------------------
API_KEY = "AIzaSyCT6r_c00Nleqv8irOk-qS2UBlpAvNvS3A"
MODEL = "gemini-2.5-flash"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

# -----------------------------
# Helper function
# -----------------------------
def generate_gemini_response(prompt, temperature=0.7, max_tokens=1024):
    if not API_KEY:
        return "Missing API key. Set st.secrets['GEMINI_API_KEY'] or the GEMINI_API_KEY env var."

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": prompt}]}
        ],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens,
            "responseMimeType": "application/json"
        }
    }
    params = {"key": API_KEY}

    try:
        response = requests.post(
            ENDPOINT,
            headers=headers,
            params=params,
            json=payload,
            timeout=60,
        )
        if response.status_code == 200:
            data = response.json()
            return (
                data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
            )
        else:
            return f"Error {response.status_code}: {response.text}"
    except Exception as e:
        return f"Exception during request: {str(e)}"

"""
Question generation helpers
"""
def _extract_longest_balanced_json(text: str):
    """Return the longest balanced JSON object substring from text, or None."""
    if not isinstance(text, str):
        return None
    depth = 0
    start_idx = None
    best = None
    for i, ch in enumerate(text):
        if ch == '{':
            if depth == 0:
                start_idx = i
            depth += 1
        elif ch == '}':
            if depth > 0:
                depth -= 1
                if depth == 0 and start_idx is not None:
                    span = (start_idx, i + 1)
                    if best is None or (span[1] - span[0]) > (best[1] - best[0]):
                        best = span
    if best is None:
        return None
    return text[best[0]:best[1]]
def generate_internship_questions(topic: str, temperature: float = 0.4, max_tokens: int = 1536):
    """Ask Gemini to create an MCQ, a one-word question, and a coding question.

    Returns a tuple: (parsed_dict_or_None, raw_text)
    """
    instruction = (
        "You are an assessment generator. Create three interview questions for the given internship topic.\n"
        "Return ONLY valid JSON (no markdown, no prose). Match exactly this schema: \n"
        "{\n"
        "  \"mcq\": {\n"
        "    \"question\": string,\n"
        "    \"options\": [string, string, string, string],\n"
        "    \"answer_index\": integer\n"
        "  },\n"
        "  \"one_word\": {\n"
        "    \"question\": string,\n"
        "    \"answer\": string\n"
        "  },\n"
        "  \"coding\": {\n"
        "    \"question\": string,\n"
        "    \"starter_code\": string\n"
        "  }\n"
        "}\n"
        f"Topic: {topic}"
    )

    raw = generate_gemini_response(instruction, temperature=temperature, max_tokens=max_tokens)
    if isinstance(raw, dict):
        return raw, json.dumps(raw)
    if not isinstance(raw, str):
        return None, str(raw)
    try:
        parsed = json.loads(raw)
        return parsed, raw
    except Exception:
        # Retry with a stricter instruction
        strict_instruction = (
            instruction +
            "\nReturn ONLY valid JSON. Do not include any explanations, markdown, or code fences."
        )
        raw_retry = generate_gemini_response(strict_instruction, temperature=temperature, max_tokens=max_tokens)
        if isinstance(raw_retry, dict):
            return raw_retry, json.dumps(raw_retry)
        if isinstance(raw_retry, str):
            try:
                parsed = json.loads(raw_retry)
                return parsed, raw_retry
            except Exception:
                extracted = _extract_longest_balanced_json(raw_retry)
                if extracted:
                    try:
                        parsed = json.loads(extracted)
                        return parsed, raw_retry
                    except Exception:
                        pass
        # As a last resort, try to extract the largest balanced JSON object from the first response
        try:
            extracted = _extract_longest_balanced_json(raw)
            if extracted:
                parsed = json.loads(extracted)
                return parsed, raw
        except Exception:
            pass
        return None, raw


def generate_mixed_question_set(
    topic: str,
    total_count: int = 8,
    coding_count: int = 2,
    debug_count: int = 1,
    temperature: float = 0.4,
    max_tokens: int = 2048,
):
    """Generate exactly 8 mixed-type questions with distribution constraints.

    - Exactly total_count questions (default 8)
    - Exactly coding_count coding questions (default 2)
    - Exactly debug_count debugging questions (default 1)
    - Remaining are MCQ or one_word in any mix

    Returns (parsed_dict_or_None, raw_text). On success, dict has shape:
    { "topic": str, "count": int, "questions": [
        { "type": "mcq|one_word|coding|debug", "question": str,
          "options"?: [str, str, str, str], "answer_index"?: int, "answer"?: str,
          "starter_code"?: str, "buggy_code"?: str, "fix"?: str }
      ] }
    """
    count = int(total_count)
    required_coding = int(coding_count)
    required_debug = int(debug_count)

    schema = (
        "{\n"
        "  \"topic\": string,\n"
        "  \"count\": integer,\n"
        "  \"questions\": [\n"
        "    {\n"
        "      \"type\": \"mcq|one_word|coding|debug\",\n"
        "      \"question\": string,\n"
        "      \"options\": [string, string, string, string]? ,\n"
        "      \"answer_index\": integer? ,\n"
        "      \"answer\": string? ,\n"
        "      \"starter_code\": string? ,\n"
        "      \"buggy_code\": string? ,\n"
        "      \"fix\": string?\n"
        "    }\n"
        "  ]\n"
        "}"
    )

    remaining = max(0, count - required_coding - required_debug)
    instruction = (
        "You are an assessment generator. Create a mixed set of concise interview questions for the given internship topic.\n"
        f"Output exactly {count} questions in total.\n"
        f"Exactly {required_coding} questions must have type=\"coding\".\n"
        f"Exactly {required_debug} question must have type=\"debug\".\n"
        f"The remaining {remaining} questions must be either type=\"mcq\" or type=\"one_word\" in any mix.\n"
        "Provide answers for every question. Keep any code under 200 characters.\n"
        "Return ONLY valid JSON (no markdown, no prose) matching this schema exactly: \n"
        + schema + "\n"
        f"Topic: {topic}"
    )

    raw = generate_gemini_response(instruction, temperature=temperature, max_tokens=max_tokens)
    if isinstance(raw, dict):
        return raw, json.dumps(raw)
    if not isinstance(raw, str):
        return None, str(raw)
    try:
        parsed = json.loads(raw)
        return parsed, raw
    except Exception:
        # Try to salvage using balanced JSON extraction
        extracted = _extract_longest_balanced_json(raw)
        if extracted:
            try:
                parsed = json.loads(extracted)
                return parsed, raw
            except Exception:
                pass
        # Retry once with stricter instruction
        strict = (
            instruction
            + "\nReturn ONLY JSON. No explanations, no code fences."
            + "\nIMPORTANT: The distribution MUST be exact as specified."
        )
        raw_retry = generate_gemini_response(strict, temperature=temperature, max_tokens=max_tokens)
        if isinstance(raw_retry, dict):
            return raw_retry, json.dumps(raw_retry)
        if isinstance(raw_retry, str):
            try:
                parsed = json.loads(raw_retry)
                return parsed, raw_retry
            except Exception:
                extracted = _extract_longest_balanced_json(raw_retry)
                if extracted:
                    try:
                        parsed = json.loads(extracted)
                        return parsed, raw_retry
                    except Exception:
                        pass
        return None, raw

def _validate_distribution(data: dict, total_count: int, coding_count: int, debug_count: int) -> bool:
    try:
        questions = data.get("questions", [])
        if len(questions) != total_count:
            return False
        type_counts = {"coding": 0, "debug": 0, "mcq": 0, "one_word": 0}
        for q in questions:
            t = str(q.get("type", "")).lower()
            if t in type_counts:
                type_counts[t] += 1
        if type_counts["coding"] != coding_count:
            return False
        if type_counts["debug"] != debug_count:
            return False
        if (type_counts["mcq"] + type_counts["one_word"]) != (total_count - coding_count - debug_count):
            return False
        return True
    except Exception:
        return False


def save_questions_to_text_file(data: dict, directory: str = "generated") -> str:
    """Save questions and answers to a timestamped .txt file. Return file path."""
    try:
        os.makedirs(directory, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_topic = str(data.get("topic", "topic")).strip().replace(" ", "_")[:40]
        filename = f"questions_{safe_topic}_{timestamp}.txt" if safe_topic else f"questions_{timestamp}.txt"
        file_path = os.path.join(directory, filename)
        lines = []
        lines.append(f"Topic: {data.get('topic', '')}")
        lines.append(f"Count: {data.get('count', len(data.get('questions', [])))}")
        lines.append("")
        for i, q in enumerate(data.get("questions", []), 1):
            qtype = q.get("type", "")
            lines.append(f"Q{i} [{qtype}]: {q.get('question', '')}")
            if qtype == "mcq":
                opts = q.get("options", [])
                for idx, opt in enumerate(opts):
                    lines.append(f"  {idx+1}. {opt}")
                if isinstance(q.get("answer_index"), int) and 0 <= q["answer_index"] < len(opts):
                    lines.append(f"Answer: {q['answer_index']+1}")
            elif qtype == "one_word":
                if q.get("answer"):
                    lines.append(f"Answer: {q['answer']}")
            elif qtype == "coding":
                if q.get("starter_code"):
                    lines.append("Starter code:")
                    lines.append(q["starter_code"]) 
                if q.get("answer"):
                    lines.append(f"Answer: {q['answer']}")
            elif qtype == "debug":
                if q.get("buggy_code"):
                    lines.append("Buggy code:")
                    lines.append(q["buggy_code"]) 
                if q.get("fix"):
                    lines.append("Fix:")
                    lines.append(q["fix"]) 
            else:
                # fallback
                if q.get("answer"):
                    lines.append(f"Answer: {q['answer']}")
            lines.append("")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        return file_path
    except Exception:
        return ""


# -----------------------------
# Streamlit UI
# -----------------------------
st.title("Internship Question Generator")

topic = st.text_input("Enter the internship")
generate_clicked = st.button("Generate")

# Fixed distribution as requested: 8 total, 2 coding, 1 debug, rest MCQ/one_word
TOTAL_QUESTIONS = 8
CODING_QUESTIONS = 2
DEBUG_QUESTIONS = 1

if generate_clicked:
    if not topic.strip():
        st.warning("Please enter an internship topic first.")
    else:
        with st.spinner("Generating mixed question set..."):
            data, raw = generate_mixed_question_set(
                topic,
                total_count=TOTAL_QUESTIONS,
                coding_count=CODING_QUESTIONS,
                debug_count=DEBUG_QUESTIONS,
            )
        if data is None:
            st.error("Could not parse questions. Showing raw output:")
            st.code(raw, language="json")
        else:
            # Validate distribution and retry once if wrong
            if not _validate_distribution(data, TOTAL_QUESTIONS, CODING_QUESTIONS, DEBUG_QUESTIONS):
                strict_note = "\nDistribution incorrect. Regenerate with exact counts."
                data, raw = generate_mixed_question_set(
                    topic,
                    total_count=TOTAL_QUESTIONS,
                    coding_count=CODING_QUESTIONS,
                    debug_count=DEBUG_QUESTIONS,
                )
            st.success(f"Generated {data.get('count', len(data.get('questions', [])))} questions.")
            # Render questions
            for i, q in enumerate(data.get("questions", []), 1):
                qtype = q.get("type", "").lower()
                st.subheader(f"Q{i} [{qtype}]")
                st.markdown(q.get("question", ""))
                if qtype == "mcq":
                    options = q.get("options", [])
                    for idx, opt in enumerate(options):
                        st.markdown(f"{idx+1}. {opt}")
                    if isinstance(q.get("answer_index"), int) and 0 <= q["answer_index"] < len(options):
                        st.caption(f"Answer: {q['answer_index']+1}")
                elif qtype == "one_word":
                    if q.get("answer"):
                        st.caption(f"Answer: {q['answer']}")
                elif qtype == "coding":
                    starter = q.get("starter_code", "")
                    if starter:
                        st.code(starter, language="python")
                    if q.get("answer"):
                        st.caption(f"Answer: {q['answer']}")
                elif qtype == "debug":
                    buggy = q.get("buggy_code", "")
                    if buggy:
                        st.code(buggy, language="python")
                    if q.get("fix"):
                        st.caption("Fix:")
                        st.code(q["fix"], language="python")
                else:
                    if q.get("answer"):
                        st.caption(f"Answer: {q['answer']}")

            # Save to file
            saved_path = save_questions_to_text_file(data, directory="generated")
            if saved_path:
                st.success(f"Saved to: {saved_path}")
            else:
                st.warning("Could not save the questions to a file.")
