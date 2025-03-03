# --- Translation Instructions ---

# This backend service is built using FastAPI and Hugging Face’s M2M-100 model, which supports multiple languages.
# It can be used to translate text from one language to another.

# Step-by-Step Instructions for Your Machines:

# 1. Install Python and Pip:
#    Ensure you have Python 3.7 or newer installed. You can check this by running:
#    python --version

# 2. Install Required Libraries:
#    You need to install the required libraries for the project. Open a terminal or command prompt and run:
#    pip install fastapi uvicorn transformers pydantic

# 3. Download the Code:
#    Make sure you have cloned the repository or have the `translate.py` file available on your local machine.
#    You can download the file from the GitHub repository.

# 4. Running the Server:
#    In the terminal, navigate to the folder where `translate.py` is saved. Start the FastAPI server using:
#    uvicorn translate:app --reload

#    The server should now be running, and you should see output similar to:
#    INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)

#    The server will be available on `http://127.0.0.1:8000`, but for local testing, you'll need to make HTTP requests
#    (like POST) using tools like `curl`.

# 5.  Testing the API with curl:
#    You can use `curl` in your terminal to test the backend translation feature. Use the following command:
#
#    curl -X 'POST' \
#      'http://127.0.0.1:8000/translate/' \ 
#      -H 'Content-Type: application/json' \
#      -d '{
#      "text": "Hello, how are you?",
#      "src_lang": "en",
#      "tgt_lang": "fr"
#    }'
#
#    This will send the translation request to the backend server, and the response will be the translated text.
#    You should get a response like:
#    ```json
#    {
#      "translated_text": "Bonjour, comment ça va ?"
#    }
#    ```

# --- Explanation of the Code ---
#
# - FastAPI: We use FastAPI to handle HTTP requests and route them. It's a fast and modern web framework for building APIs.
# - Transformers Library: This is from Hugging Face and is used to load the pre-trained translation model (`facebook/m2m100_418M`),
#   which supports many languages.
# - Pydantic: It's used for request validation. We define a `TranslationRequest` model to ensure that the inputs (text, source language,
#   and target language) are correctly formatted.
# - Model: The model (`facebook/m2m100_418M`) translates text between languages. It is loaded at the start of the server,
#   and every time a translation is requested, we use it to generate the translated text.

# --- Testing and Verifying ---
# Once your server is running, you can test it using `curl` in the terminal with the above command.
# If everything is working as expected, you’ll see the translated text in the response.

# --- Important Notes ---
# - Dependencies: Make sure to have Python 3.7+ and install the required dependencies (`fastapi`, `uvicorn`, `transformers`, `pydantic`).
# - Port: The server runs on `http://127.0.0.1:8000`. Make sure that port is not blocked on your machine.
# - Different Languages: The model supports a wide range of languages. Feel free to try others by changing the `src_lang` and `tgt_lang` in your requests.

# If you encounter any issues or need further help, feel free to ask! I'll try my best to assist you.

# --- Code Starts Here ---

from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import json

# Load the multilingual model
MODEL_NAME = "facebook/m2m100_418M"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

# Supported Languages (ISO Codes)
LANGUAGE_CODES = {
    "English": "en",
    "French": "fr",
    "Spanish": "es",
    "German": "de",
    "Hindi": "hi",
    "Chinese": "zh",
    "Arabic": "ar",
    "Italian": "it",
    "Portuguese": "pt",
    "Russian": "ru"
}

# FastAPI instance
app = FastAPI()

# Define request model for translation
class TranslationRequest(BaseModel):
    text: str
    src_lang: str
    tgt_lang: str

# Translation function
def translate_text(text, src_lang="en", tgt_lang="fr"):
    """Translates text from src_lang to tgt_lang using M2M-100 model."""
    if src_lang == tgt_lang:
        return text  # No need to translate

    tokenizer.src_lang = src_lang
    encoded = tokenizer(text, return_tensors="pt", padding=True)
    generated_tokens = model.generate(**encoded, forced_bos_token_id=tokenizer.get_lang_id(tgt_lang))
    return tokenizer.decode(generated_tokens[0], skip_special_tokens=True)

@app.post("/translate/")
async def translate(request: TranslationRequest):
    translated_text = translate_text(request.text, src_lang=request.src_lang, tgt_lang=request.tgt_lang)
    return {"translated_text": translated_text}
