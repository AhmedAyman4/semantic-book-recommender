# Book Recommender

- A simple book recommender project with a Python backend and a Next.js frontend.
- This project creates a semantic book recommendation system using various LLM techniques and technologies. Users can discover books through natural language queries, filter by fiction/non-fiction categories, and sort by emotional tone.

## Deployments

- API (Hugging Face Space): [https://ahmed-ayman-book-recommender-backend.hf.space/docs](https://ahmed-ayman-book-recommender-backend.hf.space/docs)
- Gradio Demo (Hugging Face Space): [https://huggingface.co/spaces/ahmed-ayman/book-recommender](https://huggingface.co/spaces/ahmed-ayman/book-recommender)
- Frontend (Vercel): [https://semantic-book-recommender-three.vercel.app/](https://semantic-book-recommender-three.vercel.app/)

## Repository structure

- `backend/`: Python API, data files, and notebooks.
- `frontend/`: Next.js app for the user interface.

## Quick start

Backend (Windows):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
python backend/main.py
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Data

Dataset files are under `backend/data/`.

## Notes

- See `backend/notebooks/` for exploratory work and models.
- Adjust Python/Node versions as needed (recommended: Python 3.10+, Node 16+).
