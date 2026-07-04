import sys
import os
import threading
import uvicorn
import webview
import time
import requests
import base64
from main import app

# Redirect stdout and stderr to a log file
if getattr(sys, 'frozen', False):
    log_dir = os.path.join(os.path.expanduser("~"), ".fornax_crm")
    os.makedirs(log_dir, exist_ok=True)
    log_path = os.path.join(log_dir, 'fornax_log.txt')
else:
    log_path = os.path.join(os.getcwd(), 'fornax_log.txt')
sys.stdout = open(log_path, 'a', buffering=1)
sys.stderr = sys.stdout

def start_server():
    # Run the Uvicorn server on localhost
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

def wait_for_server():
    # Wait for the server to be ready before showing the window contents
    url = "http://127.0.0.1:8000"
    while True:
        try:
            res = requests.get(url)
            if res.status_code == 200:
                break
        except requests.exceptions.ConnectionError:
            pass
        time.sleep(0.5)

class Api:
    def save_pdf(self, filename, b64_data):
        import webview
        window = webview.windows[0]
        result = window.create_file_dialog(
            webview.SAVE_DIALOG, 
            directory='', 
            save_filename=filename
        )
        if result:
            if isinstance(result, tuple) or isinstance(result, list):
                result = result[0]
            with open(result, 'wb') as f:
                f.write(base64.b64decode(b64_data))
            return True
        return False

    def save_csv(self, filename, csv_data):
        import webview
        window = webview.windows[0]
        result = window.create_file_dialog(
            webview.SAVE_DIALOG, 
            directory='', 
            save_filename=filename
        )
        if result:
            if isinstance(result, tuple) or isinstance(result, list):
                result = result[0]
            with open(result, 'w', encoding='utf-8-sig') as f:
                f.write(csv_data)
            return True
        return False

if __name__ == '__main__':
    # Start FastAPI server in a background thread
    t = threading.Thread(target=start_server)
    t.daemon = True
    t.start()

    api = Api()

    # Create native window
    window = webview.create_window('Fornax - CRM Inteligente', 'http://127.0.0.1:8000', js_api=api, width=1280, height=800, min_size=(1024, 768))
    
    # Start the webview GUI
    # webview.start() blocks until the window is closed
    webview.start(private_mode=False)
