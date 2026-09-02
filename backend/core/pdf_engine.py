import io
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
import os

def get_text_width(text, font_name, font_size):
    try:
        return pdfmetrics.stringWidth(text, font_name, font_size)
    except KeyError:
        return pdfmetrics.stringWidth(text, "Helvetica", font_size)

def generate_certificate(template_path: str, output_path: str, text_fields: list):
    """
    text_fields is a list of dicts:
    {
        "text": "Student Name",
        "x": 100,
        "y": 100,
        "max_width": 300, # optional
        "font_name": "Helvetica", # optional
        "font_size": 24,
        "color": "#000000", # optional
        "alignment": "left" # "left", "center", "right"
    }
    """
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # 1. Create a temporary PDF for the overlay
    packet = io.BytesIO()
    can = canvas.Canvas(packet)
    
    for field in text_fields:
        text = field.get("text", "")
        x = field.get("x", 0)
        y = field.get("y", 0)
        font_name = field.get("font_name", "Helvetica")
        font_size = field.get("font_size", 24)
        max_width = field.get("max_width", None)
        color = field.get("color", "#000000")
        alignment = field.get("alignment", "left")

        # Auto-shrink logic
        if max_width:
            while get_text_width(text, font_name, font_size) > max_width and font_size > 6:
                font_size -= 1
        
        can.setFont(font_name, font_size)
        can.setFillColor(HexColor(color))

        if alignment == "center":
            can.drawCentredString(x, y, text)
        elif alignment == "right":
            can.drawRightString(x, y, text)
        else:
            can.drawString(x, y, text)

    can.save()
    packet.seek(0)
    
    # 2. Merge with the template
    new_pdf = PdfReader(packet)
    with open(template_path, "rb") as template_file:
        existing_pdf = PdfReader(template_file)
        output = PdfWriter()
        
        for page_num in range(len(existing_pdf.pages)):
            page = existing_pdf.pages[page_num]
            if page_num == 0 and len(new_pdf.pages) > 0:
                # Merge the text overlay onto the first page
                page.merge_page(new_pdf.pages[0])
            output.add_page(page)
            
        with open(output_path, "wb") as outputStream:
            output.write(outputStream)

    return output_path
