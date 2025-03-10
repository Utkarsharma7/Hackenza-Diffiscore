import google.generativeai as genai
from PIL import Image
import base64
from io import BytesIO

# Configure Gemini API
genai.configure(api_key="your_gemini_api_key")  # Replace with your actual key

# Load image
image_path = "test_image.jpg"  # Replace with your image file
image = Image.open(image_path)

# Convert image to bytes
buffer = BytesIO()
image.save(buffer, format="JPEG")
image_bytes = buffer.getvalue()

# Initialize the model (ensure it's a multimodal-supported model)
model = genai.GenerativeModel("models/gemini-1.5-pro-latest")  

# Send text + image prompt
response = model.generate_content(
    ["Describe the content of this image in detail.", image_bytes]
)

print("✅ Gemini's Response:")
print(response.text)
