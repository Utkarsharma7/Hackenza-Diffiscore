# vector_search.py
from langchain_community.vectorstores.faiss import FAISS
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
import uuid
import os
from PIL import Image
import base64
from io import BytesIO

# Initialize embeddings model
embeddings = HuggingFaceEmbeddings(model_name="thenlper/gte-large")

# Path to save/load the FAISS index
index_path = "faiss_index"

def initialize_vector_db(image_folder, tags):
    """Initialize the vector database with images and tags"""
    # Create vector database
    texts = list(tags.values())
    vector_db = FAISS.from_texts(texts=[texts[0]], embedding=embeddings)
    
    # Add all tags and images to the vector database
    for img_name, tag in tags.items():
        image_path = os.path.join(image_folder, f"{img_name}.png")
        vector_db.add_texts(
            texts=[tag],
            metadatas=[{"tag": tag, "image_path": image_path}],
            ids=[str(uuid.uuid4())]
        )
    
    # Save the vector database
    vector_db.save_local(index_path)
    
    return vector_db

def load_vector_db():
    """Load the vector database from disk"""
    if os.path.exists(index_path):
        return FAISS.load_local(index_path, embeddings=embeddings, allow_dangerous_deserialization=True)
    else:
        raise FileNotFoundError(f"FAISS index not found at '{index_path}'")

def retrieve_similar_images(query_text, vector_db, top_k=2):
    """Retrieve similar images based on query text"""
    query_vector = embeddings.embed_documents([query_text])[0]
    results = vector_db.similarity_search_by_vector(query_vector, k=top_k)
    
    retrieved_data = []
    for result in results:
        metadata = result.metadata
        image_path = metadata.get('image_path', 'N/A')
        tag = metadata.get('tag', 'N/A')
        
        # Add image data as base64 if file exists
        image_data = None
        try:
            if os.path.exists(image_path):
                with Image.open(image_path) as img:
                    buffer = BytesIO()
                    img.save(buffer, format="PNG")
                    image_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
        except Exception as e:
            print(f"Error loading image {image_path}: {e}")
        
        retrieved_data.append({
            "tag": tag,
            "image_path": image_path,
            "image_data": image_data
        })
    
    return retrieved_data

# Example usage (can be removed when making an API)
if __name__ == "__main__":
    # Example data - replace with your actual data
    image_folder = "./images"  # Update with your path
    tags = {
        "q1": "sick",
        "q2": "painted",
        "q3": "divisible",
        "q4": "sum",
        "q5": "election",
    }
    
    # Check if index exists, otherwise initialize
    if not os.path.exists(index_path):
        vector_db = initialize_vector_db(image_folder, tags)
        print("Vector database initialized and saved.")
    else:
        vector_db = load_vector_db()
        print("Vector database loaded from disk.")
    
    # Test search
    query = "numeric"
    results = retrieve_similar_images(query, vector_db)
    print(f"Found {len(results)} results for query '{query}'")
