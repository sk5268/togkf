import os
import json
import sys

# Define paths relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
GALLERY_DIR = os.path.join(PROJECT_ROOT, 'togkf-gallery')
OUTPUT_FILE = os.path.join(PROJECT_ROOT, 'js/gallery-data.js')

def generate_gallery_data():
    if not os.path.exists(GALLERY_DIR):
        print(f"Gallery directory not found: {GALLERY_DIR}")
        sys.exit(1)

    events = []
    
    # Valid image extensions
    valid_extensions = {'.jpg', '.jpeg', '.png', '.webp'}

    try:
        # List all items in gallery directory
        items = os.listdir(GALLERY_DIR)
        
        # Sort items to ensure consistent order
        items.sort()

        for item_name in items:
            item_path = os.path.join(GALLERY_DIR, item_name)
            
            # Check if it's a directory and not hidden (e.g. .git)
            if os.path.isdir(item_path) and not item_name.startswith('.'):
                event_name = item_name
                event_photos = []
                
                # List files in event directory
                files = os.listdir(item_path)
                files.sort()
                
                for file_name in files:
                    ext = os.path.splitext(file_name)[1].lower()
                    if ext in valid_extensions:
                        event_photos.append(file_name)
                
                if event_photos:
                    events.append({
                        "name": event_name,
                        "folder": event_name,
                        "photos": event_photos
                    })

        # Serialize to JSON
        json_data = json.dumps(events, indent=2)
        js_content = f"window.galleryData = {json_data};"

        with open(OUTPUT_FILE, 'w') as f:
            f.write(js_content)
            
        print(f"Successfully generated gallery data with {len(events)} events.")

    except Exception as e:
        print(f"Error generating gallery data: {e}")
        sys.exit(1)

if __name__ == "__main__":
    generate_gallery_data()
