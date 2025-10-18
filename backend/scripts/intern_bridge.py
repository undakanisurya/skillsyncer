import json
import sys
import os

# Bridge script that imports model/intern.py and calls generate_mixed_question_set

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
MODEL_DIR = os.path.join(PROJECT_ROOT, 'model')
if MODEL_DIR not in sys.path:
    sys.path.insert(0, MODEL_DIR)

try:
    import intern as intern_model
except Exception as e:
    sys.stderr.write(f"Failed to import intern.py: {str(e)}\n")
    sys.exit(1)

def main():
    title = sys.argv[1] if len(sys.argv) > 1 else 'Internship'
    total = int(sys.argv[2]) if len(sys.argv) > 2 else 8
    coding = int(sys.argv[3]) if len(sys.argv) > 3 else 2
    debug = int(sys.argv[4]) if len(sys.argv) > 4 else 1

    data, raw = intern_model.generate_mixed_question_set(
        topic=title,
        total_count=total,
        coding_count=1,
        debug_count=1,
    )
    if data is None:
        # fall back to raw text as error
        sys.stderr.write("intern.py returned no data\n")
        sys.exit(2)

    # Normalize to array of questions expected by Node
    out = []
    for q in data.get('questions', []):
        t = (q.get('type') or '').lower()
        if t == 'mcq':
            out.append({
                'type': 'mcq',
                'q': q.get('question', ''),
                'options': q.get('options', []),
                'answerKey': None if q.get('answer_index') is None else (q.get('options', [None])[q.get('answer_index')] if isinstance(q.get('answer_index'), int) and 0 <= q.get('answer_index') < len(q.get('options', [])) else None)
            })
        elif t == 'one_word' or t == 'oneword':
            out.append({
                'type': 'oneword',
                'q': q.get('question', ''),
                'answerKey': q.get('answer', '')
            })
        elif t == 'coding':
            out.append({
                'type': 'code',
                'q': q.get('question', ''),
                'language': 'python',
                'starterCode': q.get('starter_code', ''),
                'testCases': []
            })
        elif t == 'debug':
            # Represent as text with buggy code context
            buggy = q.get('buggy_code', '')
            prompt = q.get('question', '')
            merged = (prompt + "\n\nBuggy code:\n" + buggy).strip()
            out.append({
                'type': 'text',
                'q': merged
            })
        else:
            # default to text
            out.append({
                'type': 'text',
                'q': q.get('question', '')
            })

    print(json.dumps(out))

if __name__ == '__main__':
    main()


