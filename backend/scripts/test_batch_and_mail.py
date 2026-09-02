import sys
import os
import csv
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.batch_generator import generate_batch
from core.mailer import send_certificate_email
from scripts.test_pdf_engine import create_blank_template

def run_test():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    uploads_dir = os.path.join(data_dir, "uploads")
    generated_dir = os.path.join(data_dir, "generated")
    
    os.makedirs(uploads_dir, exist_ok=True)
    
    # 1. Ensure template exists
    template_path = os.path.join(uploads_dir, "test_template.pdf")
    if not os.path.exists(template_path):
        create_blank_template(template_path)
        
    # 2. Create mock CSV
    csv_path = os.path.join(uploads_dir, "test_students.csv")
    with open(csv_path, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['name', 'email', 'course'])
        writer.writerow(['Alice Smith', 'alice@example.com', 'Python Basics'])
        writer.writerow(['Bob Jones', 'bob@example.com', 'Advanced React'])
        writer.writerow(['Invalid User', 'not_an_email', 'Hacking']) # Should fail
        writer.writerow(['', 'empty@example.com', 'Nothing']) # Should fail

    print(f"Created mock CSV at {csv_path}")

    # 3. Define field mappings
    field_mappings = [
        {
            "csv_column": "name",
            "x": 300,
            "y": 500,
            "max_width": 400,
            "font_size": 36,
            "color": "#0000FF",
            "alignment": "center"
        }
    ]

    # 4. Generate Batch
    print("Generating batch...")
    results = generate_batch(template_path, csv_path, generated_dir, field_mappings)
    
    print("\n--- Batch Results ---")
    print(f"Total processed: {results['total_processed']}")
    print(f"Successful: {results['successful']}")
    print(f"Failed: {results['failed']}")
    
    for fail in results['invalid_rows']:
        print(f"  Fail: {fail.get('name', 'Unknown')} - {fail.get('email', 'Unknown')} -> {fail['failure_reason']}")

    # 5. Test Mailer (Optional, needs real SMTP server to actually send, but we test the logic here)
    print("\n--- Testing Mailer ---")
    
    # Check if SMTP is configured, else use a dummy host that will likely fail gracefully
    load_dotenv(os.path.join(base_dir, ".env"))
    
    if results['valid_rows']:
        test_row = results['valid_rows'][0]
        print(f"Attempting to send email to {test_row['email']}...")
        
        subject_template = "Your Certificate for {course} is here!"
        body_template = "Hi {name},\n\nCongratulations on completing {course}!\nPlease find your certificate attached.\n\nBest,\nAdmin"
        
        success, msg = send_certificate_email(
            to_email=test_row['email'],
            subject_template=subject_template,
            body_template=body_template,
            data_dict=test_row,
            attachment_path=test_row['certificate_path']
        )
        print(f"Mail result: {success} - {msg}")
        
if __name__ == "__main__":
    run_test()
