# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

# Use the hardcoded API key method for simplicity
# IMPORTANT: You must create a .env file and add your GOOGLE_API_KEY to it.
# Example: GOOGLE_API_KEY='your-key-here'
# The code below loads this key.

# We will use a library to load the key from a file
from dotenv import load_dotenv
load_dotenv() # This loads the variables from .env

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY")) # Paste your key here

app = Flask(__name__)
CORS(app)

# Set up the model
generation_config = {
  "temperature": 0.9,
  "top_p": 1,
  "top_k": 1,
  "max_output_tokens": 2048,
}

# IMPORTANT: Use a model that supports multi-turn chat
model = genai.GenerativeModel(model_name="gemini-1.5-flash-latest",
                              generation_config=generation_config)

@app.route('/ask', methods=['POST'])
def ask():
    # Get the entire chat history from the frontend
    chat_history = request.json['history']
    
    # The last message in the history is the new user prompt
    user_message = chat_history[-1]['parts'][0]['text']

    try:
        # Start a chat session and send the history
        chat_session = model.start_chat(history=chat_history[:-1]) # History without the last user message
        
        response = chat_session.send_message(user_message)
        ai_message = response.text
        return jsonify({'reply': ai_message})

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({'error': 'Sorry, an unexpected error occurred with the AI service.'}), 500

if __name__ == '__main__':
    app.run(debug=True)