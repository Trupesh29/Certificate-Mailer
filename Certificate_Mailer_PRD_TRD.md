# Certificate Generator & Mailer — PRD & TRD

**Project:** Automated Certificate Generation & Bulk Email Distribution System
**Prepared for:** Trupesh (24DCS033), B.Tech CS, CHARUSAT DEPSTAR
**Version:** 1.0

---

## 1. Product Requirements Document (PRD)

### 1.1 Problem Statement
Manually creating and emailing individual certificates to a batch of students (for courses, events, workshops) is slow, error-prone, and doesn't scale. This project automates the full pipeline: template → personalized certificates → bulk email delivery.

### 1.2 Goals
- Let an admin upload one blank certificate template and one CSV of student data.
- Automatically generate a personalized certificate per student.
- Email each certificate to its respective student, with live delivery status.
- Present a polished, trustworthy, production-quality web experience — not a script.

### 1.3 Target User
Admin/faculty coordinator running a course, workshop, or event who needs to issue certificates to many students at once.

### 1.4 Core User Flow
1. Admin logs in.
2. Admin uploads a blank certificate (PDF) and a CSV (name, email, course, date, etc.).
3. Admin visually places/maps fields (name, course, date, ...) onto the certificate via drag-and-drop, with live preview.
4. Admin previews CSV data, fixes/removes invalid rows.
5. Admin sends a test certificate to their own email to confirm it looks correct.
6. Admin clicks "Send All" — system generates all certificates and emails them in the background.
7. Admin watches a live dashboard: sent / failed / pending per student.
8. Failed sends can be retried individually without resending the whole batch.
9. Admin can download a report of the batch and browse past batches later.

### 1.5 Functional Requirements
| # | Requirement |
|---|---|
| FR1 | Upload blank certificate template (PDF) |
| FR2 | Upload CSV of student data |
| FR3 | Map CSV columns to placeholder fields on the certificate (not just name — any field) |
| FR4 | Drag-and-drop visual placement of each field on the certificate canvas |
| FR5 | Auto-fit/shrink text so long names don't overflow their box |
| FR6 | Validate CSV rows (missing/invalid emails, empty names) before sending is enabled |
| FR7 | Live preview of a generated certificate before bulk send |
| FR8 | "Send test to myself" before bulk send |
| FR9 | Bulk generate certificates + send via email, with a designed HTML email body |
| FR9a | Admin composes custom email subject + body text (with placeholders like `{name}`, `{course}`) reused per student; live preview of exact email before sending |
| FR10 | Real-time per-row send status (sent / failed / pending) |
| FR11 | Retry failed sends only |
| FR12 | Unique certificate ID + QR code per certificate, linking to a public verification page |
| FR13 | Public "Verify Certificate" page (lookup by ID) |
| FR14 | Batch history — browse/download past batches |
| FR15 | Admin authentication (single admin login acceptable for v1) |
| FR16 | Auto-purge uploaded student data after a configurable retention period |
| FR17 | Downloadable send report (CSV/PDF) after batch completion |

### 1.6 Stretch Features (post-MVP)
- Multiple certificate templates per system (Completion, Merit, Participation)
- Analytics dashboard (sent/failed/bounce counts, simple charts)
- Scheduled/future-dated sending
- Google Sheets as a live data source instead of CSV upload
- Duplicate-send protection per event

### 1.7 Non-Goals (v1)
- Multi-admin roles/permissions (single admin is enough for v1)
- Payment/billing
- Mobile native app

### 1.8 Success Criteria
- Admin can go from "blank template + CSV" to "certificates delivered" in under 5 minutes for a batch of ~100 students.
- Zero manual editing of individual certificates required.
- Failed sends are recoverable without re-sending successful ones.

---

## 2. Technical Requirements Document (TRD)

### 2.1 Architecture Overview
```
React Frontend  <--- REST/JSON + SSE --->  FastAPI Backend  --->  PDF Engine
                                                  |
                                                  ---> Email Service (SendGrid/Mailgun/Brevo)
                                                  |
                                                  ---> Database (status, batch history)
```

### 2.2 Tech Stack
| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Tailwind CSS | Trupesh's existing skillset; strong, polished UI requirement |
| PDF rendering (preview) | pdf.js | Renders uploaded PDF as canvas for click/drag field placement |
| Backend | Python + FastAPI | Async support needed for bulk email without blocking; pairs cleanly with React |
| PDF generation | `reportlab` (text overlay) + `pypdf`/`pdfrw` (merge onto template) | Precise text placement on existing PDF |
| CSV parsing | `pandas` | Familiar, robust validation |
| Email delivery | SendGrid / Mailgun / Brevo API | Avoids SMTP rate limits; delivery tracking |
| Real-time status | Server-Sent Events (SSE) | Simple one-way live progress updates to frontend |
| Database | PostgreSQL (or SQLite for early dev) | Batch history, per-row send status, certificate IDs |
| Auth | Simple JWT/session-based single-admin login | Sufficient for v1 scope |
| QR codes | `qrcode` (Python) | Generates verification QR per certificate |

### 2.3 Data Model (simplified)
- **Batch**: id, template_id, created_at, status
- **Student Row**: id, batch_id, name, email, custom_fields (JSON), certificate_id, send_status (pending/sent/failed), sent_at
- **Template**: id, file_path, field_positions (JSON: field name → x/y/width/height/font)
- **CertificateVerification**: certificate_id, student_row_id, issued_at (public-readable)

### 2.4 Key Backend Endpoints
| Endpoint | Purpose |
|---|---|
| `POST /templates` | Upload certificate PDF |
| `POST /templates/{id}/fields` | Save field placement coordinates |
| `POST /batches` | Upload CSV, create batch, run validation |
| `POST /batches/{id}/preview` | Generate one sample certificate |
| `POST /batches/{id}/send-test` | Email a sample to the admin |
| `POST /batches/{id}/send` | Trigger bulk generation + send (background task) |
| `GET /batches/{id}/status` (SSE) | Stream live per-row status |
| `POST /batches/{id}/retry-failed` | Resend only failed rows |
| `GET /verify/{certificate_id}` | Public verification lookup |

### 2.5 Build Sequence
1. PDF text-overlay engine (single certificate, fixed test coordinates)
2. CSV parsing + batch certificate generation loop
3. Email sending (single test address, then looped via provider API)
4. FastAPI endpoints wrapping the above
5. React: upload UI + pdf.js canvas with drag-and-drop field placement
6. React: CSV preview/validation table
7. Send test + bulk send dashboard with SSE live status
8. QR code generation + public verification page
9. Auth, batch history, data retention/purge job
10. Polish: Tailwind styling, loading/error states, downloadable reports

### 2.6 Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Long names overflow certificate | Auto-shrink font to fit bounding box |
| Bulk email hits provider rate limits | Use background queue with throttling/delay |
| Partial batch failure | Per-row status tracking + selective retry |
| Student PII exposure | Auto-purge after retention period, avoid logging raw emails |
| Typo sent to entire batch | Mandatory preview + "send test to self" before bulk send |
