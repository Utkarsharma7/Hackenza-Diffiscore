from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
from PIL import Image
from io import BytesIO

# Import functions from vector_search_module.py
from vector_search_module import load_vector_db, initialize_vector_db, retrieve_similar_images

app = Flask(__name__)
CORS(app)

vector_db = None
index_path = "faiss_index"

@app.route('/api/initialize', methods=['POST'])
def initialize_db():
    global vector_db
    try:
        data = request.json
        image_folder = data.get('image_folder')
        tags = data.get('tags')
        
        if not image_folder or not tags:
            return jsonify({"error": "Missing required parameters: image_folder or tags"}), 400
        
        if not os.path.exists(image_folder):
            os.makedirs(image_folder)
            print(f"Created image folder: {image_folder}")
        
        vector_db = initialize_vector_db(image_folder, tags)
        return jsonify({"status": "success", "message": "Vector database initialized successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/search', methods=['POST'])
def search():
    global vector_db
    try:
        data = request.json
        query_text = data.get('query')
        top_k = data.get('top_k', 2)
        
        if not query_text:
            return jsonify({"error": "Missing required parameter: query"}), 400
        
        if vector_db is None:
            try:
                vector_db = load_vector_db()
            except FileNotFoundError:
                return jsonify({"error": "Vector database not initialized. Call /api/initialize first"}), 400
        
        # Use DeepSeek-enhanced search
        results = retrieve_similar_images(query_text, vector_db, top_k)
        return jsonify({"query": query_text, "results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/status', methods=['GET'])
def status():
    global vector_db
    return jsonify({"status": "ready" if vector_db is not None else "not_initialized"})

if __name__ == '__main__':
    try:
        vector_db = load_vector_db()
        print("Vector database loaded successfully on startup")
    except Exception as e:
        print(f"Warning: Could not load vector database: {e}")
        print("You'll need to initialize the database through the API")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
