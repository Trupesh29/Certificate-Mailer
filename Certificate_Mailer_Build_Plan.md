# Certificate Generator & Mailer — Build Plan

**Project:** Automated Certificate Generation & Bulk Email Distribution System  
**Prepared for:** Trupesh (24DCS033), B.Tech CS, CHARUSAT DEPSTAR  
**Planning Style:** Layer-wise SGP build plan with demoable checkpoints

---

## 1. Project Vision

The system will help an admin or faculty coordinator upload a blank certificate PDF and a CSV file of student details, automatically generate personalized certificates, email them in bulk, track delivery status, retry failures, and provide QR-based certificate verification.

The project should be built step by step. Each step must create a working feature that can be tested and shown during review.

---

## 2. Final System Modules

| Module | Purpose |
|---|---|
| Admin Panel | Login, upload files, configure certificate fields, send certificates |
| PDF Certificate Engine | Place names and other fields on uploaded PDF templates |
| CSV Parser & Validator | Read student data and flag invalid rows |
| Email Composer | Custom subject/body with placeholders like `{name}` and `{course}` |
| Bulk Mailer | Send generated certificates to all valid students |
| Status Dashboard | Show pending, sent, failed, and retry status |
| QR Verification | Generate unique certificate IDs and public verification page |
| Batch History | Store and browse previous certificate batches |
| Report Export | Download sent/failed report after completion |

---

## 3. Technology Stack

| Area | Technology |
|---|---|
| Frontend | React + Tailwind CSS |
| Backend | FastAPI |
| Database | SQLite for development, PostgreSQL for deployment |
| PDF Generation | ReportLab + pypdf |
| PDF Preview | pdf.js |
| CSV Processing | pandas |
| Email Service | SendGrid or Brevo |
| Live Updates | Server-Sent Events |
| QR Code | Python `qrcode` library |
| Deployment | Render/Railway for backend, Vercel/Netlify for frontend |

---

## 4. Development Phases

### Phase 0: Project Setup

**Goal:** Prepare the basic project structure.

Tasks:

- Create `backend/` folder for FastAPI.
- Create `frontend/` folder for React.
- Initialize Git repository.
- Create `.env.example` files.
- Add local storage folders for uploads and generated PDFs.
- Install basic dependencies.

Checkpoint:

- Backend runs locally.
- Frontend runs locally.
- Project structure is clean and ready.

Expected output:

```txt
backend/
frontend/
README.md
.gitignore
```

---

### Phase 1: PDF Generation Engine

**Goal:** Generate one personalized certificate from one PDF template.

Tasks:

- Build a standalone Python script.
- Input one PDF template.
- Add hardcoded sample name at hardcoded x/y position.
- Support font name, font size, color, and alignment.
- Add auto-shrink logic for long names.
- Save output as a new PDF.

Checkpoint:

- One certificate PDF is generated correctly.
- Long names fit inside the selected area.

Demo:

- Show blank certificate.
- Run script.
- Show filled certificate.

---

### Phase 2: Batch Certificate Generation

**Goal:** Generate certificates for multiple students from CSV.

Tasks:

- Read CSV using pandas.
- Validate required fields: `name`, `email`.
- Detect invalid email format.
- Separate valid and invalid rows.
- Generate one certificate per valid student.
- Save generated PDFs with clean filenames.

Checkpoint:

- One CSV file creates multiple certificates.
- Invalid rows are clearly reported.

Demo:

- Upload/test a CSV with 5 students.
- Show generated PDF folder.
- Show validation error for one intentionally bad row.

---

### Phase 3: Email Sending

**Goal:** Send generated certificate by email.

Tasks:

- Create SendGrid or Brevo account.
- Store API key in `.env`.
- Send one certificate to admin email.
- Add email subject and body template.
- Replace placeholders like `{name}`, `{course}`, `{date}`.
- Attach generated certificate PDF.

Checkpoint:

- Admin receives a test certificate email.
- Email body is formatted correctly.

Demo:

- Send one test certificate.
- Show received email with attachment.

---

### Phase 4: Bulk Email and Status Tracking

**Goal:** Send certificates to all valid students and track status.

Tasks:

- Create database tables for batches and rows.
- Store each row as `pending`, `sent`, or `failed`.
- Add error message for failed sends.
- Add small delay between emails.
- Add retry-failed-only logic.

Checkpoint:

- Batch send works for 5-10 test emails.
- Failed email is stored as failed.
- Retry sends only failed rows.

Demo:

- Send a test batch.
- Show status table in database or API output.
- Fix one failed email and retry.

---

### Phase 5: FastAPI Backend

**Goal:** Convert the working scripts into API endpoints.

Tasks:

- Create FastAPI app.
- Add upload endpoint for PDF template.
- Add upload endpoint for CSV batch.
- Add preview endpoint.
- Add send-test endpoint.
- Add send-all endpoint.
- Add retry-failed endpoint.
- Add status endpoint.
- Add report download endpoint.

Main API endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| `/templates` | POST | Upload PDF template |
| `/templates/{template_id}/fields` | POST | Save field positions |
| `/batches` | POST | Upload CSV and create batch |
| `/batches/{batch_id}/preview` | POST | Generate preview PDF |
| `/batches/{batch_id}/send-test` | POST | Send sample certificate |
| `/batches/{batch_id}/send` | POST | Send all certificates |
| `/batches/{batch_id}/status` | GET | Get batch status |
| `/batches/{batch_id}/events` | GET | Stream live status using SSE |
| `/batches/{batch_id}/retry-failed` | POST | Retry failed sends |
| `/batches/{batch_id}/report` | GET | Download report |

Checkpoint:

- Complete flow works through Postman or curl.
- No frontend required yet.

Demo:

- Upload template through API.
- Upload CSV through API.
- Generate preview.
- Send test.
- Send batch.
- View status.

---

### Phase 6: Basic Frontend Upload UI

**Goal:** Build the first browser-based workflow.

Tasks:

- Create React app.
- Add dashboard page.
- Add PDF upload component.
- Add CSV upload component.
- Show parsed student rows in a table.
- Highlight invalid rows.
- Show validation summary.

Checkpoint:

- Admin can upload template and CSV from browser.
- Student rows appear in frontend table.

Demo:

- Upload files through UI.
- Show valid/invalid row count.

---

### Phase 7: Visual Certificate Field Placement

**Goal:** Let admin place certificate fields visually.

Tasks:

- Render uploaded PDF using pdf.js.
- Add draggable field boxes.
- Support fields like name, course, date, certificate ID.
- Save x/y/width/height coordinates.
- Generate live preview using one student row.
- Support editing font size, color, and alignment.

Checkpoint:

- No hardcoded coordinates are needed.
- Admin can visually place fields and preview output.

Demo:

- Drag name field onto certificate.
- Preview generated certificate.

---

### Phase 8: Send Dashboard

**Goal:** Complete the end-to-end admin workflow.

Tasks:

- Add email subject/body editor.
- Add live email preview.
- Add "Send Test" button.
- Add "Send All" button.
- Connect dashboard to SSE live status.
- Show pending/sent/failed table.
- Add retry failed button.
- Add report download button.

Checkpoint:

- Entire flow works from browser.

Demo:

- Upload files.
- Place fields.
- Send test.
- Send all.
- Watch live statuses.
- Download report.

---

### Phase 9: QR Verification

**Goal:** Make each certificate verifiable.

Tasks:

- Generate unique certificate ID for each student.
- Generate QR code image.
- Place QR code on certificate.
- Create public verification endpoint.
- Create public verification page.
- Show student name, course/event, issued date, and validity.

Checkpoint:

- Scanning QR code opens real verification page.

Demo:

- Open certificate.
- Scan QR.
- Show valid certificate page.

---

### Phase 10: Auth, History, Cleanup

**Goal:** Make the app suitable for real use.

Tasks:

- Add simple admin login.
- Protect admin routes.
- Add batch history page.
- Allow downloading old certificates/reports.
- Add configurable data retention period.
- Add cleanup job for old uploaded data.

Checkpoint:

- Admin-only pages are protected.
- Past batches can be viewed.
- Old data can be cleaned safely.

Demo:

- Login as admin.
- View previous batch.
- Download old report.

---

### Phase 11: Polish and Deployment

**Goal:** Prepare final submission/demo.

Tasks:

- Improve UI with Tailwind.
- Add loading states.
- Add error messages.
- Make layout responsive.
- Write final README.
- Add screenshots.
- Deploy backend.
- Deploy frontend.
- Test deployed full flow.

Checkpoint:

- Project is ready for final review.

Demo:

- Open deployed frontend URL.
- Complete full certificate generation and mailing workflow.

---

## 5. Suggested Weekly Plan

| Week | Work |
|---|---|
| Week 1 | Setup, backend structure, PDF generation engine |
| Week 2 | CSV parsing, validation, batch PDF generation |
| Week 3 | Email sending, placeholder templates, attachments |
| Week 4 | Database status tracking, retry failed logic |
| Week 5 | FastAPI endpoints and API testing |
| Week 6 | React upload UI and CSV preview table |
| Week 7 | pdf.js visual field placement and certificate preview |
| Week 8 | Send dashboard, SSE live status, report export |
| Week 9 | QR verification, admin login, batch history |
| Week 10 | Polish, testing, deployment, final documentation |

---

## 6. Database Plan

### Admin

Stores admin login information.

Fields:

- `id`
- `email`
- `password_hash`
- `created_at`

### Template

Stores uploaded certificate templates and field placement settings.

Fields:

- `id`
- `file_path`
- `original_filename`
- `field_positions`
- `created_at`

### Batch

Stores one uploaded CSV batch.

Fields:

- `id`
- `template_id`
- `name`
- `status`
- `total_rows`
- `valid_rows`
- `invalid_rows`
- `created_at`
- `completed_at`

### StudentCertificate

Stores each student row and send status.

Fields:

- `id`
- `batch_id`
- `name`
- `email`
- `custom_fields`
- `certificate_id`
- `certificate_path`
- `send_status`
- `failure_reason`
- `sent_at`

---

## 7. Frontend Pages

| Page | Purpose |
|---|---|
| Login | Admin login |
| Dashboard | Show recent batches and quick actions |
| New Batch | Upload certificate template and CSV |
| CSV Review | Show valid/invalid student rows |
| Field Placement | Drag fields onto PDF template |
| Preview | Preview one generated certificate and email |
| Send Dashboard | Send test, send all, live status, retry failed |
| Batch History | Browse previous batches |
| Verify Certificate | Public certificate verification page |

---

## 8. MVP Feature Priority

### Must Have

- PDF upload
- CSV upload
- CSV validation
- Certificate generation
- Email sending
- Send test
- Bulk send
- Status tracking
- Retry failed
- Report download

### Should Have

- Visual PDF field placement
- Live certificate preview
- Email body preview
- Batch history

### Could Have

- QR verification
- Admin login
- Auto cleanup
- Analytics cards

### Later

- Google Sheets import
- Scheduled sending
- Multiple admin roles
- Multiple reusable templates

---

## 9. Testing Plan

### PDF Tests

- Short name fits correctly.
- Long name auto-shrinks.
- Multiple fields render in correct positions.
- Generated certificate preserves original template.

### CSV Tests

- Valid CSV passes.
- Empty name is flagged.
- Invalid email is flagged.
- Extra columns are stored as custom fields.

### Email Tests

- Test email sends successfully.
- Attachment opens correctly.
- Placeholder values are replaced.
- Invalid email becomes failed status.

### API Tests

- Template upload works.
- CSV upload works.
- Preview generation works.
- Send-test works.
- Send-all starts background job.
- Status endpoint returns correct row states.
- Retry failed sends only failed rows.

### Frontend Tests

- Upload UI works.
- Invalid rows are visible.
- Field dragging works.
- Preview matches placement.
- Live send status updates correctly.
- Report downloads successfully.

---

## 10. Review Milestones

| Review | Demo Target |
|---|---|
| Review 1 | PRD/TRD, architecture, setup, one certificate generated |
| Review 2 | CSV batch generation and validation |
| Review 3 | Email sending and status tracking |
| Review 4 | FastAPI backend working through API |
| Review 5 | Frontend upload UI and field placement |
| Review 6 | Full send dashboard with retry/report |
| Final Review | Complete deployed app with QR verification and documentation |

---

## 11. Final Deliverables

- Source code repository
- PRD/TRD document
- Build plan document
- Working backend API
- Working frontend app
- Sample certificate template
- Sample CSV file
- Generated certificate examples
- Final project report
- Deployment links
- Demo video or screenshots

---

## 12. First Implementation Target

Start with **Phase 1: PDF Generation Engine**.

The first coding goal should be:

> Given one blank certificate PDF, one student name, and one fixed coordinate box, generate a new PDF with the student name correctly placed and automatically resized if it is too long.

Once this works, CSV generation, email sending, API wrapping, and frontend UI can be added safely.
