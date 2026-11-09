# William – Chinese tutor (HSK 1)

William the cat teaches Chinese (HSK 1) to English speakers, lesson by lesson, from a course map
made from *HSK Standard Course 1*. Pick a lesson: a lesson card shows the new words and grammar,
William introduces it, practises with you and ends with a 5-question quiz. Get 5/5 and he does a flip.

## Run it (GitHub Codespaces)
1. Add your model key as a Codespaces secret named `LLM_API_KEY` (GitHub → Settings → Codespaces → Secrets)
   and give this repository access to it. A Groq key (`gsk_…`) works as it is.
2. In the Codespace terminal:
   ```
   pip install -r requirements.txt
   uvicorn app:app --reload --port 8000
   ```
3. Open port 8000 from the **Ports** tab.

## How it is built
- `app.py` – the server: loads every course in `course/`, builds William's instructions, talks to the model.
- `static/` – the page: `index.html`, `style.css`, `chat.js`.
- `course/hsk1.json` – the course. Any file in `course/` in the same format becomes a course in the menu.

Never commit the textbook PDFs or a `.env` file with your key.
