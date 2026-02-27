# ==============================================================================
# Imports
# ==============================================================================
import os
import numpy as np
import pandas as pd
from dotenv import load_dotenv

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn

# LangChain components for document loading, splitting, embeddings, and vector store
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# ==============================================================================
# Environment Setup & App Initialization
# ==============================================================================
# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Semantic Book Recommender API",
    description="API for recommending books based on semantic search and emotional tone.",
    version="1.0.0"
)

# Configure CORS so the Next.js frontend can make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, change this to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# Data Loading & Vector Store Initialization
# (Runs once when the server starts)
# ==============================================================================

print("Loading datasets and initializing Vector Store...")

# Load book metadata from CSV
books = pd.read_csv("data/books_with_emotions.csv")

# Process thumbnail URLs: append resize parameters or use default image if missing
books["large_thumbnail"] = books["thumbnail"] + "&fife=w800"
books["large_thumbnail"] = np.where(
    books["large_thumbnail"].isna(),
    "data/cover-not-found.jpg",
    books["large_thumbnail"],
)

# Extract categories and tones for the frontend dropdowns
AVAILABLE_CATEGORIES = ["All"] + sorted(books["simple_categories"].unique().tolist())
AVAILABLE_TONES = ["All", "Happy", "Surprising", "Angry", "Suspenseful", "Sad"]

# Load text documents containing tagged descriptions for semantic search
raw_documents = TextLoader("data/tagged_description.txt", encoding="utf-8").load()

# Split documents into chunks for embedding
text_splitter = CharacterTextSplitter(separator="\n", chunk_size=500, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)

# Initialize Chroma vector store with HuggingFace embeddings
db_books = Chroma.from_documents(
    documents, 
    HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
)

print("Vector Store initialized successfully.")

# ==============================================================================
# Pydantic Models (Define API Response Structure)
# ==============================================================================

class BookResponse(BaseModel):
    id: int
    title: str
    authors: str
    description: str
    imageUrl: str

class MetadataResponse(BaseModel):
    categories: List[str]
    tones: List[str]

# ==============================================================================
# Core Recommendation Logic
# ==============================================================================

def retrieve_semantic_recommendations(
        query: str,
        category: str = "All",
        tone: str = "All",
        initial_top_k: int = 50,
        final_top_k: int = 16,
) -> pd.DataFrame:
    """
    Retrieve book recommendations based on semantic similarity, category, and emotional tone.
    """
    # Perform semantic search to find relevant document chunks
    recs = db_books.similarity_search(query, k=initial_top_k)
    
    # Extract book IDs from the retrieved document content
    # Assumes the first element in the page content is the book ID
    books_list = [int(rec.page_content.strip('"').split()[0]) for rec in recs]
    
    # Remove duplicate IDs while preserving semantic search ranking order
    unique_books_list = []
    seen = set()
    for b_id in books_list:
        if b_id not in seen:
            unique_books_list.append(b_id)
            seen.add(b_id)
    
    # Filter the main books DataFrame based on retrieved IDs
    book_recs = books[books["isbn13"].isin(unique_books_list)].copy()
    
    # Sort the DataFrame to match the semantic search ranking order
    book_recs['isbn13_cat'] = pd.Categorical(book_recs['isbn13'], categories=unique_books_list, ordered=True)
    book_recs = book_recs.sort_values('isbn13_cat').drop(columns=['isbn13_cat'])
    
    # Drop duplicates based on title (in case of multiple editions of the same book)
    book_recs = book_recs.drop_duplicates(subset=['title'])

    # Filter by category if specified
    if category != "All":
        book_recs = book_recs[book_recs["simple_categories"] == category]

    # Sort by specific emotion score if a tone is specified
    if tone == "Happy":
        book_recs = book_recs.sort_values(by="joy", ascending=False)
    elif tone == "Surprising":
        book_recs = book_recs.sort_values(by="surprise", ascending=False)
    elif tone == "Angry":
        book_recs = book_recs.sort_values(by="anger", ascending=False)
    elif tone == "Suspenseful":
        book_recs = book_recs.sort_values(by="fear", ascending=False)
    elif tone == "Sad":
        book_recs = book_recs.sort_values(by="sadness", ascending=False)

    return book_recs.head(final_top_k)

# ==============================================================================
# API Endpoints
# ==============================================================================

@app.get("/ping")
def ping():
    return {"status": "alive"}

@app.get("/api/metadata", response_model=MetadataResponse)
def get_metadata():
    """Returns available categories and tones for frontend dropdowns."""
    return {
        "categories": AVAILABLE_CATEGORIES,
        "tones": AVAILABLE_TONES
    }

@app.get("/api/recommend", response_model=List[BookResponse])
def get_recommendations(
    query: str = Query(..., description="The semantic search query for the book"),
    category: str = Query("All", description="The genre/category filter"),
    tone: str = Query("All", description="The emotional tone filter")
):
    """
    Returns a list of recommended books formatted for the Next.js frontend.
    """
    # Get filtered recommendations DataFrame
    recommendations_df = retrieve_semantic_recommendations(query, category, tone)
    
    results = []
    
    # Format the results to match the Next.js frontend expectations
    for _, row in recommendations_df.iterrows():
        # Truncate description to first ~30 words (optional, frontend also truncates using line-clamp)
        description = str(row.get("description", ""))
        truncated_desc_split = description.split()
        truncated_description = " ".join(truncated_desc_split[:30]) + "..." if len(truncated_desc_split) > 30 else description

        # Format authors list
        authors_raw = str(row.get("authors", ""))
        authors_split = authors_raw.split(";")
        if len(authors_split) == 2:
            authors_str = f"{authors_split[0]} and {authors_split[1]}"
        elif len(authors_split) > 2:
            authors_str = f"{', '.join(authors_split[:-1])}, and {authors_split[-1]}"
        else:
            authors_str = authors_raw

        # Build the final response object
        book_data = {
            "id": int(row.get("isbn13", np.random.randint(1000))), # Ensure ID is present
            "title": str(row.get("title", "Unknown Title")),
            "authors": authors_str,
            "description": truncated_description,
            "imageUrl": str(row.get("large_thumbnail", ""))
        }
        results.append(book_data)

    return results

# ==============================================================================
# Main Execution
# ==============================================================================

if __name__ == "__main__":
    # Run the server using uvicorn
    # Accessible locally at http://127.0.0.1:8000
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)