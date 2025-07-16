import os
import json
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from datetime import datetime
import time

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static')
CORS(app)

# Initialize Gemini API
gemini_api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=gemini_api_key)

# Set up the model with supported version
generation_config = {
    "temperature": 0.7,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
}

safety_settings = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
]

# ✅ Updated Gemini model
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    safety_settings=safety_settings
)

# ✅ Shopify product fetch function
def get_shopify_products():
    headers = {
        "X-Shopify-Access-Token": os.getenv("SHOPIFY_ACCESS_TOKEN"),
        "Content-Type": "application/json"
    }

    url = f"https://{os.getenv('SHOPIFY_SHOP_URL')}/admin/api/2024-07/products.json"

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            products = response.json().get("products", [])
            return [
                {
                    "title": product["title"],
                    "price": product["variants"][0]["price"]
                }
                for product in products
            ]
        else:
            print("Shopify API Error:", response.text)
            return []
    except Exception as e:
        print("Exception in get_shopify_products:", str(e))
        return []

@app.route('/')
def home():
    return send_from_directory('static', 'index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        if not gemini_api_key:
            return jsonify({
                'type': 'error',
                'message': 'API key not configured'
            }), 500

        data = request.json
        if not data or 'message' not in data:
            return jsonify({
                'type': 'error',
                'message': 'No message provided'
            }), 400

        user_message = data.get('message', '')
        chat_history = data.get('history', [])

        # ✅ Replace hardcoded product logic
        if any(keyword in user_message.lower() for keyword in ['product', 'item', 'price', 'stock', 'available']):
            real_products = get_shopify_products()
            if not real_products:
                return jsonify({
                    'type': 'error',
                    'message': 'Unable to fetch product data at the moment.'
                }), 500

            return jsonify({
                'type': 'product',
                'message': "Here are some products from our store:",
                'products': real_products
            })

        if any(keyword in user_message.lower() for keyword in ['order', 'tracking', 'shipping', 'delivery']):
            return jsonify({
                'type': 'order_request',
                'message': "To check your order status, please provide your order number."
            })

        # Gemini prompt-based response
        try:
            prompt_parts = [
                "You are a helpful e-commerce customer service assistant. Be friendly, concise, and professional. If you're not sure about something, ask for clarification. Focus on helping customers with their shopping experience.\n\n"
            ]

            for msg in chat_history[-5:]:  # Last 5 messages
                role = "User" if msg['type'] == 'user' else "Assistant"
                prompt_parts.append(f"{role}: {msg['message']}\n")

            prompt_parts.append(f"User: {user_message}\nAssistant: ")

            response = model.generate_content(prompt_parts)

            if response.prompt_feedback and response.prompt_feedback.block_reason:
                return jsonify({
                    'type': 'error',
                    'message': "I apologize, but I cannot provide a response to that query. Please try rephrasing your question."
                }), 400

            return jsonify({
                'type': 'chat',
                'message': response.text
            })

        except Exception as gemini_error:
            print(f"Gemini API Error: {str(gemini_error)}")
            return jsonify({
                'type': 'error',
                'message': "I'm having trouble generating a response. Please try again in a moment."
            }), 500

    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({
            'type': 'error',
            'message': "Sorry, something went wrong. Please try again later."
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
