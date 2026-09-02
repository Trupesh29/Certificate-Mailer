import os
import re
from core.pdf_engine import generate_certificate
from core.csv_parser import process_csv

def generate_batch(template_path: str, csv_path: str, output_dir: str, field_mappings: list):
    """
    field_mappings is a list of dicts specifying how to map a CSV column to a PDF field.
    Example mapping for 'name':
    {
        "csv_column": "name",
        "x": 300,
        "y": 500,
        "max_width": 400,
        "font_size": 36,
        "color": "#000000",
        "alignment": "center"
    }
    """
    valid_rows, invalid_rows = process_csv(csv_path)
    
    os.makedirs(output_dir, exist_ok=True)
    generated_files = []
    
    for row in valid_rows:
        text_fields = []
        for mapping in field_mappings:
            col = mapping.get("csv_column")
            if col and col in row:
                field = mapping.copy()
                field["text"] = str(row[col])
                text_fields.append(field)
                
        # Generate safe filename
        safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', row['name'])
        safe_email = re.sub(r'[^a-zA-Z0-9_\-@\.]', '_', row['email'])
        filename = f"{safe_name}_{safe_email}.pdf"
        output_path = os.path.join(output_dir, filename)
        
        generate_certificate(template_path, output_path, text_fields)
        row['certificate_path'] = output_path
        generated_files.append(row)
        
    return {
        "total_processed": len(valid_rows) + len(invalid_rows),
        "successful": len(generated_files),
        "failed": len(invalid_rows),
        "valid_rows": generated_files,
        "invalid_rows": invalid_rows
    }
