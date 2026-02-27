# Book Recommender

A simple book recommender project with a Python backend and a Next.js frontend.

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
