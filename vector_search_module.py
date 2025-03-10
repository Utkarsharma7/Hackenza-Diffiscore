from langchain_community.vectorstores.faiss import FAISS
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import GoogleGenerativeAI
import google.generativeai as genai
import uuid
import os
from PIL import Image
import base64
from io import BytesIO

# Initialize embeddings model
embeddings = HuggingFaceEmbeddings(model_name="thenlper/gte-large")

# Configure Gemini API
genai.configure(api_key="AIzaSyBbSeyhlz5wHdogTYEe_sGG1k_6Vsa8KUo")  # Replace with actual key
llm = GoogleGenerativeAI(model="gemini-2.0-flash")

index_path = "faiss_index"

def refine_query_with_gemini(query_text):
    """Use Gemini LLM to rewrite the user's query for better search results"""
    response = llm.invoke(f"Rewrite the following query for better search results: {query_text}")
    return response

def initialize_vector_db(image_folder, tags):
    """Initialize the vector database with images and tags"""
    texts = list(tags.values())
    vector_db = FAISS.from_texts(texts=[texts[0]], embedding=embeddings)
    
    for img_name, tag in tags.items():
        image_path = os.path.join(image_folder, f"{img_name}.png")
        vector_db.add_texts(
            texts=[tag],
            metadatas=[{"tag": tag, "image_path": image_path}],
            ids=[str(uuid.uuid4())]
        )
    
    vector_db.save_local(index_path)
    return vector_db

def load_vector_db():
    if os.path.exists(index_path):
        return FAISS.load_local(index_path, embeddings=embeddings, allow_dangerous_deserialization=True)
    else:
        raise FileNotFoundError(f"FAISS index not found at '{index_path}'")

def retrieve_similar_images(query_text, vector_db, top_k=2):
    """Retrieve similar images based on query text using Gemini LLM"""
    reformulated_query = refine_query_with_gemini(query_text)
    print(f"Original Query: {query_text} | Reformulated Query: {reformulated_query}")
    
    query_vector = embeddings.embed_documents([reformulated_query])[0]
    results = vector_db.similarity_search_by_vector(query_vector, k=top_k)
    
    retrieved_data = []
    for result in results:
        metadata = result.metadata
        image_path = metadata.get('image_path', 'N/A')
        tag = metadata.get('tag', 'N/A')
        
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
