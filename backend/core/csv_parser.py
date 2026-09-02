import pandas as pd
import re

def is_valid_email(email):
    """Basic regex to check valid email format."""
    if not isinstance(email, str):
        return False
    # A simple regex for email validation
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return re.match(pattern, email.strip()) is not None

def process_csv(csv_path: str):
    """
    Reads a CSV file and validates rows.
    Required columns: 'name', 'email'.
    Returns:
        valid_rows: list of dicts for rows that passed validation.
        invalid_rows: list of dicts for rows that failed validation, with a 'failure_reason'.
    """
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        raise ValueError(f"Failed to read CSV: {e}")

    # Convert column names to lowercase to make it case-insensitive for required fields
    df.columns = [col.strip().lower() for col in df.columns]

    if 'name' not in df.columns or 'email' not in df.columns:
        raise ValueError("CSV must contain 'name' and 'email' columns.")

    valid_rows = []
    invalid_rows = []

    for index, row in df.iterrows():
        row_dict = row.to_dict()
        name = str(row_dict.get('name', '')).strip()
        email = str(row_dict.get('email', '')).strip()

        if not name or name.lower() == 'nan':
            row_dict['failure_reason'] = "Missing or empty 'name'"
            invalid_rows.append(row_dict)
            continue
            
        if not email or not is_valid_email(email):
            row_dict['failure_reason'] = f"Invalid email format: '{email}'"
            invalid_rows.append(row_dict)
            continue
            
        valid_rows.append(row_dict)

    return valid_rows, invalid_rows
