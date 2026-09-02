import sys
import os

# Add the parent directory to the path so we can import backend.core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.pdf_engine import generate_certificate
from reportlab.pdfgen import canvas

def create_blank_template(path):
    """Creates a very basic blank PDF template for testing."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    c = canvas.Canvas(path)
    c.drawString(100, 750, "CERTIFICATE OF COMPLETION")
    c.drawString(100, 600, "This is to certify that")
    c.drawString(100, 400, "has completed the course.")
    # Draw a bounding box for the name to show the intended max_width area visually
    c.rect(100, 480, 400, 50)
    c.save()

if __name__ == "__main__":
    template_path = os.path.join(os.path.dirname(__file__), "..", "data", "uploads", "test_template.pdf")
    output_path = os.path.join(os.path.dirname(__file__), "..", "data", "generated", "test_output.pdf")
    
    if not os.path.exists(template_path):
        create_blank_template(template_path)
        print(f"Created blank template at {template_path}")
        
    fields = [
        {
            "text": "Johnathan Bartholomew Montgomery III",
            "x": 300, # Center of the 100-500 box
            "y": 500,
            "max_width": 400,
            "font_size": 36,
            "color": "#FF0000",
            "alignment": "center"
        }
    ]
    
    print(f"Generating certificate for {fields[0]['text']}...")
    result_path = generate_certificate(template_path, output_path, fields)
    print(f"Certificate generated at: {result_path}")
