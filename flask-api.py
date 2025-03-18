from flask import Flask, request, jsonify
from flask_cors import CORS
import os
<<<<<<< HEAD
import json
import uuid
import base64
from PIL import Image
from werkzeug.utils import secure_filename
=======
import base64
from PIL import Image
from io import BytesIO
>>>>>>> AI

# Import functions from vector_search_module.py
from vector_search_module import load_vector_db, initialize_vector_db, retrieve_similar_images

app = Flask(__name__)
CORS(app)

vector_db = None
index_path = "faiss_index"

# Path to save/load the FAISS index (should match the one in vector_search_module.py)
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
        
        # Use Gemini-enhanced search
        results = retrieve_similar_images(query_text, vector_db, top_k)
        return jsonify({"query": query_text, "results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_image():
    """Upload an image with a tag to the database"""
    global vector_db
    
    try:
        # Check if database is initialized
        if vector_db is None:
            try:
                vector_db = load_vector_db()
            except FileNotFoundError:
                return jsonify({
                    "error": "Vector database not initialized. Call /api/initialize first"
                }), 400
        
        # Check if image and tag are provided
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        image_file = request.files['image']
        tag = request.form.get('tag')
        
        if not tag:
            return jsonify({"error": "No tag provided"}), 400
        
        if image_file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        # Create images directory if it doesn't exist
        image_folder = "./images"
        if not os.path.exists(image_folder):
            os.makedirs(image_folder)
        
        # Generate a unique filename
        filename = f"q{str(uuid.uuid4())[:8]}"
        file_extension = os.path.splitext(image_file.filename)[1].lower()
        if file_extension not in ['.png', '.jpg', '.jpeg']:
            return jsonify({"error": "Only PNG and JPG files are allowed"}), 400
        
        # Save image to disk
        image_path = os.path.join(image_folder, f"{filename}.png")
        
        # Convert to PNG if needed
        img = Image.open(image_file)
        img.save(image_path, format="PNG")
        
        # Add to vector database
        vector_db.add_texts(
            texts=[tag],
            metadatas=[{"tag": tag, "image_path": image_path}],
            ids=[str(uuid.uuid4())]
        )
        
        # Save the updated vector database
        vector_db.save_local(index_path)
        
        # Return success response with image details
        return jsonify({
            "status": "success",
            "message": "Image uploaded successfully",
            "filename": filename,
            "tag": tag,
            "image_path": image_path
        })
    
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
    
<<<<<<< HEAD
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
=======
    app.run(debug=True, host='0.0.0.0', port=5000)
>>>>>>> AI
