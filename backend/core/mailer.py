import os
import smtplib
from email.message import EmailMessage
import mimetypes
from dotenv import load_dotenv

load_dotenv()

def send_certificate_email(to_email: str, subject_template: str, body_template: str, data_dict: dict, attachment_path: str):
    """
    Sends an email with the generated certificate attached.
    Uses placeholders in subject and body. e.g. "Hello {name}"
    """
    smtp_host = os.environ.get("SMTP_HOST", "localhost")
    smtp_port = int(os.environ.get("SMTP_PORT", 1025)) # Default to maildev/mailhog port
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_pass = os.environ.get("SMTP_PASS", "")
    from_email = os.environ.get("FROM_EMAIL", "certificates@example.com")
    
    # Format templates
    try:
        subject = subject_template.format(**data_dict)
        body = body_template.format(**data_dict)
    except KeyError as e:
        return False, f"Missing placeholder data for {e}"
        
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email
    msg.set_content(body)
    
    # Attach the PDF
    if not os.path.exists(attachment_path):
        return False, f"Attachment not found: {attachment_path}"
        
    ctype, encoding = mimetypes.guess_type(attachment_path)
    if ctype is None or encoding is not None:
        ctype = 'application/octet-stream'
    maintype, subtype = ctype.split('/', 1)
    
    with open(attachment_path, 'rb') as fp:
        msg.add_attachment(fp.read(),
                           maintype=maintype,
                           subtype=subtype,
                           filename=os.path.basename(attachment_path))
                           
    try:
        # Use SMTP_SSL if port is 465, else use starttls if there are credentials
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port)
            # if credentials exist, assume starttls is needed
            if smtp_user and smtp_pass:
                server.starttls()
                
        if smtp_user and smtp_pass:
            server.login(smtp_user, smtp_pass)
            
        server.send_message(msg)
        server.quit()
        return True, "Email sent successfully."
    except Exception as e:
        return False, f"Failed to send email: {e}"
