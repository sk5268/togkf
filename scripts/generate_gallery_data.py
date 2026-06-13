import os
import json
import sys
import re
from datetime import datetime

# Define paths relative to this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
GALLERY_DIR = os.path.join(PROJECT_ROOT, 'togkf-gallery')
OUTPUT_FILE = os.path.join(PROJECT_ROOT, 'js/gallery-data.js')

# Map of full month names (lowercased) to their numeric values
MONTH_MAP = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4,
    'may': 5, 'june': 6, 'july': 7, 'august': 8,
    'september': 9, 'october': 10, 'november': 11, 'december': 12
}


def parse_event_date(folder_name):
    """Parse the event date from a folder name.

    Folder names follow the pattern: 'EventName_MonthName_Year'
    where MonthName is a full month name (e.g. 'December') and Year
    is a 4-digit number. The parser is tolerant of extra whitespace
    or underscores between the month and year.
    """
    year_match = re.search(r'(\d{4})', folder_name)
    if not year_match:
        return None
    year = int(year_match.group(1))

    folder_lower = folder_name.lower()
    month = None
    for month_name, month_num in MONTH_MAP.items():
        if month_name in folder_lower:
            month = month_num
            break

    if month is None:
        return None

    try:
        return datetime(year, month, 1)
    except ValueError:
        return None


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

        for item_name in items:
            item_path = os.path.join(GALLERY_DIR, item_name)

            # Check if it's a directory and not hidden (e.g. .git)
            if os.path.isdir(item_path) and not item_name.startswith('.'):
                event_name = item_name
                event_photos = []

                # List files in event directory and sort ascending (1, 2, 3, ...)
                files = os.listdir(item_path)
                files.sort()

                for file_name in files:
                    ext = os.path.splitext(file_name)[1].lower()
                    if ext in valid_extensions:
                        event_photos.append(file_name)

                if event_photos:
                    event_date = parse_event_date(event_name)
                    events.append({
                        "name": event_name,
                        "folder": event_name,
                        "photos": event_photos,
                        "_date": event_date,  # internal, stripped before output
                    })

        # Sort events from latest to oldest. Folders without a parseable
        # date are appended at the end in their original (sorted) order.
        dated = [e for e in events if e["_date"] is not None]
        undated = [e for e in events if e["_date"] is None]
        dated.sort(key=lambda e: e["_date"], reverse=True)
        sorted_events = dated + undated

        # Strip the internal _date field
        for event in sorted_events:
            event.pop("_date", None)

        # Serialize to JSON
        json_data = json.dumps(sorted_events, indent=2)
        js_content = f"window.galleryData = {json_data};"

        with open(OUTPUT_FILE, 'w') as f:
            f.write(js_content)

        print(f"Successfully generated gallery data with {len(sorted_events)} events.")

    except Exception as e:
        print(f"Error generating gallery data: {e}")
        sys.exit(1)

if __name__ == "__main__":
    generate_gallery_data()
