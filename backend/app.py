# ==============================================================================
# Imports
# ==============================================================================
import os
import numpy as np
import pandas as pd
from dotenv import load_dotenv

import gradio as gr

# LangChain components for document loading, splitting, embeddings, and vector store
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_chroma import Chroma

# ==============================================================================
# Environment Setup
# ==============================================================================
# Load environment variables from .env file
load_dotenv()
# HF_TOKEN = os.getenv('HF_TOKEN')

# ==============================================================================
# Data Loading & Vector Store Initialization
# ==============================================================================

# Load book metadata from CSV
books = pd.read_csv("data/books_with_emotions.csv")

# Process thumbnail URLs: append resize parameters or use default image if missing
books["large_thumbnail"] = books["thumbnail"] + "&fife=w800"
books["large_thumbnail"] = np.where(
    books["large_thumbnail"].isna(),
    "data/cover-not-found.jpg",
    books["large_thumbnail"],
)

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

# ==============================================================================
# Core Recommendation Logic
# ==============================================================================

def retrieve_semantic_recommendations(
        query: str,
        category: str = None,
        tone: str = None,
        initial_top_k: int = 50,
        final_top_k: int = 16,
) -> pd.DataFrame:
    """
    Retrieve book recommendations based on semantic similarity, category, and emotional tone.
    
    Args:
        query: The user's search description.
        category: Optional book category filter.
        tone: Optional emotional tone filter.
        initial_top_k: Number of initial semantic matches to retrieve.
        final_top_k: Number of final results to return after filtering.
        
    Returns:
        A DataFrame containing the filtered and sorted book recommendations.
    """
    # Perform semantic search to find relevant document chunks
    recs = db_books.similarity_search(query, k=initial_top_k)
    
    # Extract book IDs from the retrieved document content
    # Assumes the first element in the page content is the book ID
    books_list = [int(rec.page_content.strip('"').split()[0]) for rec in recs]
    
    # Filter the main books DataFrame based on retrieved IDs
    book_recs = books[books["isbn13"].isin(books_list)].head(initial_top_k)

    # Filter by category if specified
    if category != "All":
        book_recs = book_recs[book_recs["simple_categories"] == category].head(final_top_k)
    else:
        book_recs = book_recs.head(final_top_k)

    # Sort by specific emotion score if a tone is specified
    if tone == "Happy":
        book_recs.sort_values(by="joy", ascending=False, inplace=True)
    elif tone == "Surprising":
        book_recs.sort_values(by="surprise", ascending=False, inplace=True)
    elif tone == "Angry":
        book_recs.sort_values(by="anger", ascending=False, inplace=True)
    elif tone == "Suspenseful":
        book_recs.sort_values(by="fear", ascending=False, inplace=True)
    elif tone == "Sad":
        book_recs.sort_values(by="sadness", ascending=False, inplace=True)

    return book_recs


# ==============================================================================
# UI Formatting Logic
# ==============================================================================

def recommend_books(
        query: str,
        category: str,
        tone: str
):
    """
    Format book recommendations for the Gradio Gallery output.
    
    Args:
        query: User search query.
        category: Selected category filter.
        tone: Selected tone filter.
        
    Returns:
        A list of tuples containing (image_url, caption) for the Gallery.
    """
    # Get filtered recommendations
    recommendations = retrieve_semantic_recommendations(query, category, tone)
    results = []

    for _, row in recommendations.iterrows():
        # Truncate description to first 30 words for display
        description = row["description"]
        truncated_desc_split = description.split()
        truncated_description = " ".join(truncated_desc_split[:30]) + "..."

        # Format authors list (handle single, double, or multiple authors)
        authors_split = row["authors"].split(";")
        if len(authors_split) == 2:
            authors_str = f"{authors_split[0]} and {authors_split[1]}"
        elif len(authors_split) > 2:
            authors_str = f"{', '.join(authors_split[:-1])}, and {authors_split[-1]}"
        else:
            authors_str = row["authors"]

        # Create caption string
        caption = f"{row['title']} by {authors_str}: {truncated_description}"
        
        # Append image and caption to results
        results.append((row["large_thumbnail"], caption))
        
    return results

# ==============================================================================
# Gradio Interface Definition
# ==============================================================================

# Prepare dropdown options based on available data
categories = ["All"] + sorted(books["simple_categories"].unique())
tones = ["All"] + ["Happy", "Surprising", "Angry", "Suspenseful", "Sad"]

# Define the Gradio Blocks interface
with gr.Blocks(theme=gr.themes.Glass()) as dashboard:
    gr.Markdown("# Semantic Book Recommender")

    with gr.Row():
        user_query = gr.Textbox(
            label="Please enter a description of a book:",
            placeholder="e.g., A story about forgiveness"
        )
        category_dropdown = gr.Dropdown(
            choices=categories, 
            label="Select a category:", 
            value="All"
        )
        tone_dropdown = gr.Dropdown(
            choices=tones, 
            label="Select an emotional tone:", 
            value="All"
        )
        submit_button = gr.Button("Find recommendations")

    gr.Markdown("## Recommendations")
    output = gr.Gallery(
        label="Recommended books", 
        columns=8, 
        rows=2
    )

    # Connect button click to recommendation function
    submit_button.click(
        fn=recommend_books,
        inputs=[user_query, category_dropdown, tone_dropdown],
        outputs=output
    )

# ==============================================================================
# Main Execution
# ==============================================================================

if __name__ == "__main__":
    dashboard.launch()