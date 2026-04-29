# Semantic Book Recommender

This project creates a semantic book recommendation system using various LLM techniques and technologies. Users can discover books through natural language queries, filter by fiction/non-fiction categories, and sort by emotional tone.

## Deployments

- Backend Space (Hugging Face): [https://huggingface.co/spaces/ahmed-ayman/book-recommender-backend](https://huggingface.co/spaces/ahmed-ayman/book-recommender-backend)
- API Docs: [https://ahmed-ayman-book-recommender-backend.hf.space/docs](https://ahmed-ayman-book-recommender-backend.hf.space/docs)
- Gradio Demo (Hugging Face Space): [https://huggingface.co/spaces/ahmed-ayman/book-recommender](https://huggingface.co/spaces/ahmed-ayman/book-recommender)
- Frontend (Vercel): [https://semantic-book-recommender-three.vercel.app/](https://semantic-book-recommender-three.vercel.app/)

## Repository structure

```text
book-recommender/
├── backend/                    # Python FastAPI server & ML logic
│   ├── data/                   # Datasets (CSV, TXT) and assets
│   ├── notebooks/              # Exploratory Data Analysis & Model experiments
│   ├── main.py                 # Primary FastAPI application entry point
│   ├── app.py                  # Secondary/Legacy application script
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile              # Docker configuration for HF Spaces
├── frontend/                   # Next.js 15 + Tailwind CSS user interface
│   ├── app/                    # Next.js App Router (pages & layouts)
│   ├── components/             # Reusable React components
│   ├── types/                  # TypeScript interfaces and types
│   ├── public/                 # Static assets (images, icons)
│   └── package.json            # Node.js dependencies & scripts
└── README.md                   # Project documentation
```

- `backend/`: Handles semantic search using ChromaDB and HuggingFace embeddings.
- `frontend/`: Modern UI built with Next.js for book discovery and filtering.

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
