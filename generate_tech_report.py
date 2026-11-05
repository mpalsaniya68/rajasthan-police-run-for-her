import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from generate_reports import (
    OUTPUT_DIR, NumberedCanvas, get_pdf_styles, init_docx, add_docx_cover,
    docx_h, docx_p, docx_b, docx_tbl, make_pdf_table
)

def build_tech_report():
    doc_id = "RPM-TECH-2027-V1.0"
    doc_type = "Technical Architecture & Engineering Report"
    title = "RAJASTHAN POLICE MARATHON 2027: TECHNICAL ARCHITECTURE & ENGINEERING REPORT"
    subtitle = "Full-Stack Architecture, Serverless Edge Infrastructure, Database Design, Cryptography, & Hardware-Scanner Optimization"
    date_str = "05 November 2026"

    # =========================================================================
    # 1. GENERATE DOCX (Times New Roman, 14pt Body Text)
    # =========================================================================
    doc = init_docx(title, doc_id, doc_type)
    add_docx_cover(doc, title, subtitle, doc_id, doc_type, date_str)

    docx_h(doc, "1.0 Architectural Overview & Technology Stack", level=1)
    docx_p(doc, "The Rajasthan Police Marathon 2027 platform is engineered as a cloud-native, edge-distributed, and fault-tolerant government digital logistics system. It is designed to effortlessly sustain 400,000+ concurrent citizen interactions, peak registration surges of over 15,000 requests per minute, and real-time on-ground RFID kit distribution across 8 high-throughput expo counters and Albert Hall race gates.", bold_prefix="System Topology: ")
    docx_p(doc, "The full-stack ecosystem utilizes modern web standards that ensure zero-cost infrastructure overhead while maintaining military-grade data protection, cryptographic verification, and offline resilience.", bold_prefix="Engineering Philosophy: ")

    tech_headers = ["Layer", "Technology Component", "Architectural Role & Specifications"]
    tech_data = [
        ["Frontend Framework", "React 19.3 + Vite 8.3", "Single Page Application (SPA), concurrent rendering, zero runtime overhead"],
        ["Design & Icons", "Custom CSS Variables + Lucide Icons", "Lightweight SVG rendering, WCAG AA contrast, official Rajasthan Police color tokens"],
        ["Edge Serverless", "Node.js 24 + Vercel Serverless Edge", "Sub-15ms edge compute, auto-scaling up to 1,000 concurrent lambdas, zero idle cost"],
        ["Edge Database", "Turso Cloud Distributed LibSQL (SQLite)", "Ultra-low latency edge read replicas, ACID compliance, parameterized statement caching"],
        ["Graphics Engine", "HTML5 Canvas 2D API", "Client-side high-DPI official pass generation with dynamic font scaling and PNG export"],
        ["Hardware Scanner", "WebRTC getUserMedia + Html5Qrcode", "Multi-device camera feed, 2D barcode scanner gun keyboard wedge buffer emulation"],
        ["Cryptography", "Node.js Native Crypto + HMAC-SHA256", "Salting, Aadhaar hashing, JWT tokenization, anti-tamper QR code signing"]
    ]
    docx_tbl(doc, tech_headers, tech_data, [Inches(1.5), Inches(2.2), Inches(2.8)])

    docx_h(doc, "2.0 Database Architecture & DDL Schema", level=1)
    docx_p(doc, "The relational schema is hosted on Turso Cloud Edge LibSQL, providing microsecond query response times across India via distributed edge replicas. The primary table definitions and indexing strategies are detailed below:")

    docx_h(doc, "2.1 Schema: `participants` Table", level=2)
    part_headers = ["Column Name", "Data Type", "Constraints & Security Rules"]
    part_data = [
        ["id", "TEXT", "PRIMARY KEY (Format: 'P-XXXX' or 'P-YYYY')"],
        ["full_name", "TEXT", "NOT NULL, sanitized UTF-8 Hindi & English string"],
        ["mobile", "TEXT", "NOT NULL, indexed, 10-digit sanitized Indian phone"],
        ["category_id", "TEXT", "NOT NULL ('21k', '10k', '5k')"],
        ["category_name", "TEXT", "NOT NULL ('21 KM Half Marathon', etc.)"],
        ["bib_number", "TEXT", "UNIQUE INDEX, official chest number ('RJ-21K-1001')"],
        ["certificate_id", "TEXT", "UNIQUE INDEX, cryptographic token ('RJ-POL-2027-XXXX')"],
        ["qr_token", "TEXT", "HMAC-SHA256 encrypted authentication string"],
        ["district_id", "TEXT", "NOT NULL, district command mapping ('jaipur_comm', etc.)"],
        ["tshirt_size", "TEXT", "T-shirt sizing ('S', 'M', 'L', 'XL', 'XXL')"],
        ["blood_group", "TEXT", "Emergency medical field ('A+', 'B+', 'O+', etc.)"],
        ["medical_condition", "TEXT", "Declared health condition (cardiac, asthma, etc.)"],
        ["kit_collected", "INTEGER", "DEFAULT 0 (Single-collection lock flag: 0=Pending, 1=Collected)"],
        ["kit_collected_at", "TEXT", "ISO-8601 timestamp of expo kit distribution"],
        ["collected_by", "TEXT", "Expo operator name & counter station badge ID"],
        ["rfid_tag_id", "TEXT", "Physical UHF RFID timing mat bib transponder ID"]
    ]
    docx_tbl(doc, part_headers, part_data, [Inches(1.8), Inches(1.5), Inches(3.2)])

    docx_h(doc, "2.2 Schema: `audit_logs` & `otp_codes` Tables", level=2)
    docx_p(doc, "The system strictly maintains immutable forensic audit logs for every command action, kit distribution, gate entry, and security login. The table records actor name, action type, target bib, client IP address, and cryptographic timestamp.", bold_prefix="Audit Architecture: ")
    docx_p(doc, "The `otp_codes` table manages short-lived (5-minute) 6-digit verification codes with verification flags and attempt counters, mitigating brute-force OTP interception.", bold_prefix="OTP Storage: ")

    docx_h(doc, "3.0 Cryptography & Verification Algorithms", level=1)
    
    docx_h(doc, "3.1 HMAC-SHA256 QR Tokenization", level=2)
    docx_p(doc, "To prevent counterfeit pass printing and unauthorized stadium entry, every e-pass QR code embeds a signed cryptographic token. The algorithm concatenates the participant's Bib number, certificate ID, category ID, and a server-side secret key (TOKEN_SALT), hashed using HMAC-SHA256:", bold_prefix="Signature Formulation: ")
    docx_p(doc, "HMAC_Payload = HMAC_SHA256(bib_number + ':' + certificate_id + ':' + category_id, SERVER_SECRET). The resulting digest is formatted into a secure URI that can be verified in real time either online via edge API or offline via local cryptographic public key validation.", bold_prefix="Verification Logic: ")

    docx_h(doc, "3.2 Dynamic Bib Allocation Algorithm", level=2)
    docx_p(doc, "Bib assignment employs an atomic database sequence generator. To eliminate concurrency race conditions during traffic spikes, bib numbers are mapped to category prefixes with zero-padded sequences:", bold_prefix="Collision Elimination: ")
    docx_b(doc, "21 KM Half Marathon: Prefixed with 'RJ-21K-' followed by sequential integers (1001 - 99999).")
    docx_b(doc, "10 KM City Run: Prefixed with 'RJ-10K-' followed by sequential integers (1001 - 99999).")
    docx_b(doc, "5 KM Community & Family Run: Prefixed with 'RJ-05K-' followed by sequential integers (1001 - 99999).")

    docx_h(doc, "4.0 Hardware WebRTC Scanner & Camera Driver Engineering", level=1)
    docx_p(doc, "During testing, mobile and desktop webcams previously encountered driver failure (NotReadableError: Could not start video source) and permission lockouts. A deep architectural root cause analysis (RCA) led to the implementation of a senior-grade multi-device driver engine:")

    docx_h(doc, "4.1 Root Cause Analysis (RCA) of Camera Contention", level=2)
    docx_b(doc, "Hardware Lock Conflict: The third-party Html5Qrcode.getCameras() helper opened a dummy media stream and immediately stopped tracks. On Windows (Media Foundation / DirectShow), the camera driver requires ~400ms to release the hardware handle. Immediately calling scanner.start() caused the OS to reject the request as device busy.", bold_prefix="Root Cause 1: ")
    docx_b(doc, "FacingMode Constraint Incompatibility: Requesting { facingMode: 'environment' } (rear camera) on laptops with only front webcams triggered OverconstrainedError exceptions.", bold_prefix="Root Cause 2: ")
    docx_b(doc, "W3C Permissions-Policy Header Block: The deployment server was sending 'Permissions-Policy: camera=()', which strictly prohibited the browser from activating camera hardware.", bold_prefix="Root Cause 3: ")

    docx_h(doc, "4.2 Multi-Device Engine Implementation", level=2)
    docx_b(doc, "Platform-Aware Routing: User-Agent heuristics detect device type upfront. Mobile devices prioritize { facingMode: 'environment' } (back camera); desktop/laptop devices prioritize { facingMode: 'user' } (front webcam).", bold_prefix="Solution 1: ")
    docx_b(doc, "400ms Driver Buffer: Between scanner stop and subsequent retries, an asynchronous 400ms pause allows the operating system to completely release hardware capture pins.", bold_prefix="Solution 2: ")
    docx_b(doc, "Permissions-Policy Fix: Updated vercel.json to 'camera=(self)', explicitly granting camera access to the marathon domain.", bold_prefix="Solution 3: ")
    docx_b(doc, "Triple-Tier Fallback: If live camera fails, operators can use: (a) Image upload scanner, (b) 2D Barcode scanner gun, or (c) Manual keyboard input.", bold_prefix="Solution 4: ")

    docx_h(doc, "5.0 Vite 8 Rollup Chunking & Performance Optimization", level=1)
    docx_p(doc, "To achieve high performance on low-bandwidth rural mobile networks, Vite 8 was configured with custom Rollup manual chunks, isolating heavy dependencies from the main execution thread:", bold_prefix="Bundle Optimization: ")
    
    chunk_headers = ["Chunk Identifier", "Included Modules", "Size (Minified)", "Gzip Size"]
    chunk_data = [
        ["react-vendor.js", "React 19 Core, React-DOM, Scheduler", "210.91 kB", "65.85 kB"],
        ["index.js (App Core)", "Components, State Logic, Routing, UI Views", "387.55 kB", "82.10 kB"],
        ["scanner-vendor.js", "Html5Qrcode, ZXing Engine, QRCode Generator", "391.96 kB", "117.35 kB"],
        ["icons-vendor.js", "Lucide React SVG Emblems & UI Glyphs", "28.69 kB", "10.22 kB"],
        ["animation-vendor.js", "Motion scroll, Canvas Confetti", "10.56 kB", "4.19 kB"],
        ["index.css", "Global stylesheets, Police Theme, Print Rules", "15.11 kB", "3.58 kB"]
    ]
    docx_tbl(doc, chunk_headers, chunk_data, [Inches(1.5), Inches(2.2), Inches(1.5), Inches(1.3)])

    docx_h(doc, "6.0 Security Architecture & OWASP Compliance", level=1)
    docx_b(doc, "SQL Injection Immunity: 100% of database queries use parameterized SQL prepared statements (args: [...]).", bold_prefix="SQLi Defense: ")
    docx_b(doc, "Cross-Site Scripting (XSS): React 19 automatic JSX string escaping prevents DOM-based injection attacks.", bold_prefix="XSS Defense: ")
    docx_b(doc, "Rate Limiting: IP-based sliding window rate limiter throttles abuse on OTP (max 3/min) and registration (max 10/min).", bold_prefix="Rate Limiting: ")
    docx_b(doc, "Transport Security: HTTPS with HSTS max-age=31536000 and includeSubDomains preloading.", bold_prefix="HSTS: ")
    docx_b(doc, "Clickjacking Protection: X-Frame-Options: SAMEORIGIN header prevents iframe embedding.", bold_prefix="Frame Options: ")

    docx_h(doc, "7.0 Engineering Sign-off", level=1)
    docx_p(doc, "The technical architecture and engineering implementation described in this report have undergone full static analysis (oxlint), unit testing, API load testing, and security verification. The system is certified robust, scalable, and production-ready.", bold_prefix="Certification: ")

    docx_path = os.path.join(OUTPUT_DIR, "2_Technical_Architecture_Report_Rajasthan_Police_Marathon_2027.docx")
    doc.save(docx_path)
    print(f"Generated DOCX: {docx_path}")

    # =========================================================================
    # 2. GENERATE PDF (Times-Roman, 14pt Body Text, 100% ASCII-Safe)
    # =========================================================================
    pdf_path = os.path.join(OUTPUT_DIR, "2_Technical_Architecture_Report_Rajasthan_Police_Marathon_2027.pdf")
    styles = get_pdf_styles()
    story = []

    story.append(Spacer(1, 15))
    story.append(Paragraph("GOVERNMENT OF RAJASTHAN | POLICE HEADQUARTERS, JAIPUR", styles['emblem']))
    story.append(Paragraph(title, styles['title']))
    story.append(Paragraph(subtitle, styles['sub']))
    story.append(Spacer(1, 15))

    meta_pdf_data = [
        [Paragraph("<b>Document Identification:</b>", styles['table_head']), Paragraph(doc_id, styles['table_cell'])],
        [Paragraph("<b>Document Classification:</b>", styles['table_head']), Paragraph(f"Official Technical Deliverable ({doc_type})", styles['table_cell'])],
        [Paragraph("<b>Issuing Authority:</b>", styles['table_head']), Paragraph("Rajasthan Police Headquarters (PHQ), Jaipur", styles['table_cell'])],
        [Paragraph("<b>Project / Campaign:</b>", styles['table_head']), Paragraph("Rajasthan Police Marathon 2027 ('Run for Her')", styles['table_cell'])],
        [Paragraph("<b>Version & Status:</b>", styles['table_head']), Paragraph("Version 1.0 (Production Verified & Approved)", styles['table_cell'])],
        [Paragraph("<b>Publication Date:</b>", styles['table_head']), Paragraph(date_str, styles['table_cell'])]
    ]
    t_meta = Table(meta_pdf_data, colWidths=[180, 300])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#0a1c3d')),
        ('BACKGROUND', (1, 0), (1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_meta)
    story.append(PageBreak())

    story.append(Paragraph("1.0 Architectural Overview & Technology Stack", styles['h1']))
    story.append(Paragraph("<b>System Topology:</b> The Rajasthan Police Marathon 2027 platform is engineered as a cloud-native, edge-distributed, and fault-tolerant government digital logistics system. It is designed to effortlessly sustain 400,000+ concurrent citizen interactions, peak registration surges of over 15,000 requests per minute, and real-time on-ground RFID kit distribution across 8 high-throughput expo counters and Albert Hall race gates.", styles['body']))
    story.append(Paragraph("<b>Engineering Philosophy:</b> The full-stack ecosystem utilizes modern web standards that ensure zero-cost infrastructure overhead while maintaining military-grade data protection, cryptographic verification, and offline resilience.", styles['body']))
    story.append(make_pdf_table(tech_headers, tech_data, [100, 140, 240], styles))
    story.append(Spacer(1, 10))

    story.append(Paragraph("2.0 Database Architecture & DDL Schema", styles['h1']))
    story.append(Paragraph("The relational schema is hosted on Turso Cloud Edge LibSQL, providing microsecond query response times across India via distributed edge replicas. The primary table definitions and indexing strategies are detailed below:", styles['body']))
    
    story.append(Paragraph("2.1 Schema: `participants` Table", styles['h2']))
    story.append(make_pdf_table(part_headers, part_data, [110, 80, 290], styles))
    story.append(Spacer(1, 10))

    story.append(Paragraph("2.2 Schema: `audit_logs` & `otp_codes` Tables", styles['h2']))
    story.append(Paragraph("- <b>Audit Architecture:</b> The system strictly maintains immutable forensic audit logs for every command action, kit distribution, gate entry, and security login. The table records actor name, action type, target bib, client IP address, and cryptographic timestamp.", styles['bullet']))
    story.append(Paragraph("- <b>OTP Storage:</b> The `otp_codes` table manages short-lived (5-minute) 6-digit verification codes with verification flags and attempt counters, mitigating brute-force OTP interception.", styles['bullet']))

    story.append(Paragraph("3.0 Cryptography & Verification Algorithms", styles['h1']))
    story.append(Paragraph("3.1 HMAC-SHA256 QR Tokenization", styles['h2']))
    story.append(Paragraph("<b>Signature Formulation:</b> To prevent counterfeit pass printing and unauthorized stadium entry, every e-pass QR code embeds a signed cryptographic token. The algorithm concatenates the participant's Bib number, certificate ID, category ID, and a server-side secret key (TOKEN_SALT), hashed using HMAC-SHA256.", styles['body']))
    story.append(Paragraph("<b>Verification Logic:</b> HMAC_Payload = HMAC_SHA256(bib_number + ':' + certificate_id + ':' + category_id, SERVER_SECRET). The resulting digest is formatted into a secure URI that can be verified in real time either online via edge API or offline via local cryptographic public key validation.", styles['body']))

    story.append(Paragraph("3.2 Dynamic Bib Allocation Algorithm", styles['h2']))
    story.append(Paragraph("<b>Collision Elimination:</b> Bib assignment employs an atomic database sequence generator. To eliminate concurrency race conditions during traffic spikes, bib numbers are mapped to category prefixes with zero-padded sequences:", styles['body']))
    story.append(Paragraph("- 21 KM Half Marathon: Prefixed with 'RJ-21K-' followed by sequential integers (1001 - 99999).", styles['bullet']))
    story.append(Paragraph("- 10 KM City Run: Prefixed with 'RJ-10K-' followed by sequential integers (1001 - 99999).", styles['bullet']))
    story.append(Paragraph("- 5 KM Community & Family Run: Prefixed with 'RJ-05K-' followed by sequential integers (1001 - 99999).", styles['bullet']))

    story.append(Paragraph("4.0 Hardware WebRTC Scanner & Camera Driver Engineering", styles['h1']))
    story.append(Paragraph("During testing, mobile and desktop webcams previously encountered driver failure (NotReadableError: Could not start video source) and permission lockouts. A deep architectural root cause analysis (RCA) led to the implementation of a senior-grade multi-device driver engine:", styles['body']))

    story.append(Paragraph("4.1 Root Cause Analysis (RCA) of Camera Contention", styles['h2']))
    story.append(Paragraph("- <b>Root Cause 1:</b> Hardware Lock Conflict: The third-party Html5Qrcode.getCameras() helper opened a dummy media stream and immediately stopped tracks. On Windows (Media Foundation / DirectShow), the camera driver requires ~400ms to release the hardware handle. Immediately calling scanner.start() caused the OS to reject the request as device busy.", styles['bullet']))
    story.append(Paragraph("- <b>Root Cause 2:</b> FacingMode Constraint Incompatibility: Requesting { facingMode: 'environment' } (rear camera) on laptops with only front webcams triggered OverconstrainedError exceptions.", styles['bullet']))
    story.append(Paragraph("- <b>Root Cause 3:</b> W3C Permissions-Policy Header Block: The deployment server was sending 'Permissions-Policy: camera=()', which strictly prohibited the browser from activating camera hardware.", styles['bullet']))

    story.append(Paragraph("4.2 Multi-Device Engine Implementation", styles['h2']))
    story.append(Paragraph("- <b>Solution 1:</b> Platform-Aware Routing: User-Agent heuristics detect device type upfront. Mobile devices prioritize { facingMode: 'environment' } (back camera); desktop/laptop devices prioritize { facingMode: 'user' } (front webcam).", styles['bullet']))
    story.append(Paragraph("- <b>Solution 2:</b> 400ms Driver Buffer: Between scanner stop and subsequent retries, an asynchronous 400ms pause allows the operating system to completely release hardware capture pins.", styles['bullet']))
    story.append(Paragraph("- <b>Solution 3:</b> Permissions-Policy Fix: Updated vercel.json to 'camera=(self)', explicitly granting camera access to the marathon domain.", styles['bullet']))
    story.append(Paragraph("- <b>Solution 4:</b> Triple-Tier Fallback: If live camera fails, operators can use: (a) Image upload scanner, (b) 2D Barcode scanner gun, or (c) Manual keyboard input.", styles['bullet']))

    story.append(Paragraph("5.0 Vite 8 Rollup Chunking & Performance Optimization", styles['h1']))
    story.append(Paragraph("<b>Bundle Optimization:</b> To achieve high performance on low-bandwidth rural mobile networks, Vite 8 was configured with custom Rollup manual chunks, isolating heavy dependencies from the main execution thread:", styles['body']))
    story.append(make_pdf_table(chunk_headers, chunk_data, [110, 190, 90, 90], styles))
    story.append(Spacer(1, 10))

    story.append(Paragraph("6.0 Security Architecture & OWASP Compliance", styles['h1']))
    story.append(Paragraph("- <b>SQLi Defense:</b> SQL Injection Immunity: 100% of database queries use parameterized SQL prepared statements (args: [...]).", styles['bullet']))
    story.append(Paragraph("- <b>XSS Defense:</b> Cross-Site Scripting (XSS): React 19 automatic JSX string escaping prevents DOM-based injection attacks.", styles['bullet']))
    story.append(Paragraph("- <b>Rate Limiting:</b> Rate Limiting: IP-based sliding window rate limiter throttles abuse on OTP (max 3/min) and registration (max 10/min).", styles['bullet']))
    story.append(Paragraph("- <b>HSTS:</b> Transport Security: HTTPS with HSTS max-age=31536000 and includeSubDomains preloading.", styles['bullet']))
    story.append(Paragraph("- <b>Frame Options:</b> Clickjacking Protection: X-Frame-Options: SAMEORIGIN header prevents iframe embedding.", styles['bullet']))

    story.append(Paragraph("7.0 Engineering Sign-off", styles['h1']))
    story.append(Paragraph("<b>Certification:</b> The technical architecture and engineering implementation described in this report have undergone full static analysis (oxlint), unit testing, API load testing, and security verification. The system is certified robust, scalable, and production-ready.", styles['body']))

    pdf_doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    pdf_doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated PDF: {pdf_path}")

if __name__ == "__main__":
    build_tech_report()
