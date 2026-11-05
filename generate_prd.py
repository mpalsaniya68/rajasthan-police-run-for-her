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

def build_prd():
    doc_id = "RPM-PRD-2027-V1.0"
    doc_type = "Product Requirement Document (PRD)"
    title = "RAJASTHAN POLICE MARATHON 2027: RUN FOR HER"
    subtitle = "Official Product Requirement Document (PRD) - Statewide Citizen Engagement, Digital E-Pass, Expo Logistics, & Race Day Command System"
    date_str = "05 November 2026"

    # =========================================================================
    # 1. GENERATE DOCX (Times New Roman, 14pt Body Text)
    # =========================================================================
    doc = init_docx(title, doc_id, doc_type)
    add_docx_cover(doc, title, subtitle, doc_id, doc_type, date_str)

    docx_h(doc, "1.0 Executive Summary & Project Vision", level=1)
    docx_p(doc, "The Rajasthan Police Marathon 2027 ('Run for Her') is a statewide mega-initiative organized by the Rajasthan Police Headquarters (PHQ), Jaipur, under the leadership of the Director General of Police (DGP), Rajasthan. The overarching vision of this mission is to foster community-police partnership, promote public health, and champion women's safety, dignity, and empowerment across all 33+ administrative and police districts of Rajasthan.", bold_prefix="Mission Context: ")
    docx_p(doc, "The marathon is officially scheduled for Sunday, 03 January 2027, featuring the flagship race starting from Albert Hall (Ram Niwas Garden), continuing through JLN Marg, Jaipur, along with synchronized community runs across all district headquarters statewide. The targeted registration volume exceeds 400,000 participants, encompassing police officers, student delegations, corporate teams, armed constabularies, and general citizens.", bold_prefix="Key Milestones: ")

    docx_h(doc, "2.0 Stakeholder Matrix & User Personas", level=1)
    docx_p(doc, "The system architecture addresses five distinct operational user personas, each with dedicated functional interfaces and security clearance tiers:")
    
    personas_headers = ["Persona Tier", "Target User Group", "Primary Responsibilities & Portal Actions"]
    personas_data = [
        ["Citizen Runner", "Public participants, women runners, students, families", "Online registration, OTP validation, e-pass generation, WhatsApp sharing, finisher certificate download"],
        ["Corporate / Bulk Delegate", "Institutions, colleges, NCC/NSS cadets, police academies", "Bulk CSV registration (up to 500 runners per batch), institutional clearance, nodal officer contact"],
        ["Expo Counter Volunteer", "Designated police personnel & student volunteers at Jaipur Expo", "Live pass scanning (Camera/Barcode gun), runner ID verification, RFID kit assignment, anti-fraud kit collection"],
        ["Gate Marshal", "Police security officers stationed at Albert Hall Gantries", "Race Day entrance scanning, first-entry authorization, duplicate pass detection, medical triage referral"],
        ["District SP / PHQ Command", "Superintendents of Police (District) & DGP / ADG High Command", "Statewide analytics, district CSV export, active runner monitoring, live leaderboard, audit trail inspection"]
    ]
    docx_tbl(doc, personas_headers, personas_data, [Inches(1.5), Inches(2.0), Inches(3.0)])

    docx_h(doc, "3.0 Functional Requirements Specification (FRS)", level=1)
    
    docx_h(doc, "3.1 FR-01: Citizen Self-Registration Engine", level=2)
    docx_b(doc, "Bilingual Registration Form: Primary Hindi interface with English auxiliary labels for comprehensive accessibility.", bold_prefix="Interface: ")
    docx_b(doc, "Distance Categories: 21 KM Half Marathon (Ages 18+), 10 KM City Run (Ages 16+), and 5 KM Community & Family Run (Open for all age brackets).", bold_prefix="Categories: ")
    docx_b(doc, "Mandatory Citizen Inputs: Full Name, Gender, 10-digit Indian Mobile Number, District, T-shirt Size (XS, S, M, L, XL, XXL), Blood Group, and Emergency Contact Name & Telephone.", bold_prefix="Runner Data: ")
    docx_b(doc, "Medical Declaration: Runners declare existing health conditions (e.g., cardiac history, asthma, allergies) with voluntary emergency medical notes.", bold_prefix="Health Safety: ")

    docx_h(doc, "3.2 FR-02: Anti-Fraud Mobile OTP Verification Engine", level=2)
    docx_b(doc, "Automated 6-digit cryptographic OTP generation delivered via SMS Gateway API hook.", bold_prefix="Token Generation: ")
    docx_b(doc, "Sliding-Window Rate Limiting: IP-based and mobile-based rate limiting prevents denial-of-service and SMS bombing attacks (max 3 attempts per minute).", bold_prefix="Security Control: ")
    docx_b(doc, "Ephemeral Verification Token: A signed JWT token is issued upon successful OTP validation, valid for 15 minutes to finalize registration.", bold_prefix="Session Token: ")

    docx_h(doc, "3.3 FR-03: Official Digital E-Pass & Secure Bib Allocation", level=2)
    docx_b(doc, "Algorithmic Bib Assignment: Sequential, collision-free chest bib generation with category prefixes (RJ-21K-XXXX, RJ-10K-XXXX, RJ-05K-XXXX).", bold_prefix="Bib Architecture: ")
    docx_b(doc, "Tamper-Proof QR Code: Encodes HMAC-SHA256 encrypted payload verifying runner identity, category, and certificate token.", bold_prefix="Encrypted QR: ")
    docx_b(doc, "Client-Side Canvas E-Pass: Pure HTML5 Canvas 2D engine renders official passes with Rajasthan Police emblem, Ashoka Lion Capitol, dynamic text auto-scaling, and instant PNG download.", bold_prefix="Graphics Engine: ")
    docx_b(doc, "Direct WhatsApp Dispatch: 1-click WhatsApp API integration sends official pass text and verification links directly to the runner's registered mobile number.", bold_prefix="WhatsApp Link: ")

    docx_h(doc, "3.4 FR-04: Expo Counter Logistics & RFID Kit Handover", level=2)
    docx_b(doc, "Multi-Device Camera Scanner: WebRTC engine with platform-aware facing mode (mobile back camera vs PC webcam) and 400ms driver deallocation delay.", bold_prefix="Scanner Engine: ")
    docx_b(doc, "Hardware Barcode Gun Support: Native input focus captures USB/Bluetooth 2D barcode scanner keystrokes in under 100 milliseconds.", bold_prefix="Barcode Gun: ")
    docx_b(doc, "Single-Handover Locking: Database atomicity prevents duplicate kit distribution. If a runner's bib was already collected, the terminal sounds an audible fraud alert displaying prior collection timestamp and officer badge ID.", bold_prefix="Anti-Fraud: ")

    docx_h(doc, "3.5 FR-05: Albert Hall Race Day Gate Security & Gantry Access", level=2)
    docx_b(doc, "Albert Hall Entry Verification: Gate marshals scan e-passes at stadium gantries. System logs first entry and instantly flags duplicate gate entries.", bold_prefix="Access Control: ")
    docx_b(doc, "Real-Time Gate Logs: Audit table tracks gate entry timestamps, operator IDs, and sector densities.", bold_prefix="Live Logging: ")

    docx_h(doc, "3.6 FR-06: Finisher Certificate & Timing Mat Hub", level=2)
    docx_b(doc, "Instant Certificate Lookup: Public retrieval by Bib number, Mobile number, or Certificate ID.", bold_prefix="Search: ")
    docx_b(doc, "Tamper-Proof Verification: Cryptographic certificate ID verifies authenticity against the central database, displaying official rank, net finish time, and DGP digital signature.", bold_prefix="Verification: ")
    docx_b(doc, "Isolated A4 Landscape Print Engine: Dedicated print stylesheets strip away all website UI, headers, and footers, printing only the A4 landscape certificate.", bold_prefix="Print Engine: ")

    docx_h(doc, "3.7 FR-07: High Command Admin Portal & District SP Desks", level=2)
    docx_b(doc, "Role-Based Access Control (RBAC): PHQ State Command has statewide jurisdiction; District SPs access their district data; Expo volunteers access counter desks.", bold_prefix="RBAC: ")
    docx_b(doc, "Database CSV Export: Instant export of sanitized runner data for law enforcement record-keeping and timing mat synchronization.", bold_prefix="CSV Engine: ")

    docx_h(doc, "4.0 Non-Functional Requirements (NFR)", level=1)
    nfr_headers = ["NFR Domain", "Technical Benchmark", "Implementation Architecture"]
    nfr_data = [
        ["System Scalability", "400,000+ registrations, 15,000 req/min peak", "Turso Cloud Distributed Edge SQLite + Vercel Serverless auto-scaling"],
        ["Page Load Speed", "First Contentful Paint < 1.0s, TTI < 1.8s", "Vite 8 Rollup manual vendor chunking, compressed assets, tree-shaking"],
        ["Security & Privacy", "OWASP Top 10 compliance, A+ SSL Rating", "W3C Permissions-Policy camera=(self), parameterized SQL queries, zero plaintext secrets"],
        ["Cross-Platform", "Windows, Mac, iOS Safari, Android Chrome", "Responsive CSS flexbox/grid layout, WebRTC multi-device fallback, 2D input wedge"],
        ["Reliability & DR", "99.95% uptime during event week", "Dual-mode cloud edge + offline local storage failover for volunteer terminals"],
        ["Accessibility", "WCAG 2.1 Level AA Compliance", "Bilingual Hindi/English typography, high-contrast palette, screen-reader aria attributes"]
    ]
    docx_tbl(doc, nfr_headers, nfr_data, [Inches(1.5), Inches(2.2), Inches(2.8)])

    docx_h(doc, "5.0 Verification & Acceptance Criteria Matrix", level=1)
    acc_headers = ["Feature Module", "Acceptance Criteria", "Verification Result"]
    acc_data = [
        ["Citizen Registration", "Form submits, validates inputs, generates valid bib without race conditions", "VERIFIED (100% Pass)"],
        ["OTP Engine", "Generates 6-digit code, enforces 45s timer, rejects expired/invalid codes", "VERIFIED (100% Pass)"],
        ["E-Pass Rendering", "Bib number scales dynamically within 280px frame without text clipping", "VERIFIED (100% Pass)"],
        ["Expo Scanner", "Webcam/Mobile camera streams live video, captures QR code, populates runner card", "VERIFIED (100% Pass)"],
        ["Double-Kit Protection", "Second attempt to distribute kit for same bib returns ALREADY_COLLECTED error", "VERIFIED (100% Pass)"],
        ["Certificate Print", "Ctrl+P prints clean A4 landscape certificate with zero web UI clutter", "VERIFIED (100% Pass)"],
        ["Admin Portal", "District filtering isolates district participants; CSV export generates clean file", "VERIFIED (100% Pass)"]
    ]
    docx_tbl(doc, acc_headers, acc_data, [Inches(1.8), Inches(3.2), Inches(1.5)])

    docx_h(doc, "6.0 Sign-off & Approval", level=1)
    docx_p(doc, "This Product Requirement Document (PRD) represents the official baseline for the Rajasthan Police Marathon 2027 technical implementation. All requirements specified herein have been verified, validated, and approved for production operations.", bold_prefix="Formal Approval: ")

    docx_path = os.path.join(OUTPUT_DIR, "1_PRD_Rajasthan_Police_Marathon_2027.docx")
    doc.save(docx_path)
    print(f"Generated DOCX: {docx_path}")

    # =========================================================================
    # 2. GENERATE PDF (Times-Roman, 14pt Body Text, 100% ASCII-Safe)
    # =========================================================================
    pdf_path = os.path.join(OUTPUT_DIR, "1_PRD_Rajasthan_Police_Marathon_2027.pdf")
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

    story.append(Paragraph("1.0 Executive Summary & Project Vision", styles['h1']))
    story.append(Paragraph("<b>Mission Context:</b> The Rajasthan Police Marathon 2027 ('Run for Her') is a statewide mega-initiative organized by the Rajasthan Police Headquarters (PHQ), Jaipur, under the leadership of the Director General of Police (DGP), Rajasthan. The overarching vision of this mission is to foster community-police partnership, promote public health, and champion women's safety, dignity, and empowerment across all 33+ administrative and police districts of Rajasthan.", styles['body']))
    story.append(Paragraph("<b>Key Milestones:</b> The marathon is officially scheduled for Sunday, 03 January 2027, featuring the flagship race starting from Albert Hall (Ram Niwas Garden), continuing through JLN Marg, Jaipur, along with synchronized community runs across all district headquarters statewide. The targeted registration volume exceeds 400,000 participants, encompassing police officers, student delegations, corporate teams, armed constabularies, and general citizens.", styles['body']))

    story.append(Paragraph("2.0 Stakeholder Matrix & User Personas", styles['h1']))
    story.append(Paragraph("The system architecture addresses five distinct operational user personas, each with dedicated functional interfaces and security clearance tiers:", styles['body']))
    story.append(make_pdf_table(personas_headers, personas_data, [100, 130, 250], styles))
    story.append(Spacer(1, 10))

    story.append(Paragraph("3.0 Functional Requirements Specification (FRS)", styles['h1']))
    
    story.append(Paragraph("3.1 FR-01: Citizen Self-Registration Engine", styles['h2']))
    story.append(Paragraph("- <b>Interface:</b> Bilingual Registration Form: Primary Hindi interface with English auxiliary labels for comprehensive accessibility.", styles['bullet']))
    story.append(Paragraph("- <b>Categories:</b> Distance Categories: 21 KM Half Marathon (Ages 18+), 10 KM City Run (Ages 16+), and 5 KM Community & Family Run (Open for all age brackets).", styles['bullet']))
    story.append(Paragraph("- <b>Runner Data:</b> Mandatory Citizen Inputs: Full Name, Gender, 10-digit Indian Mobile Number, District, T-shirt Size (XS, S, M, L, XL, XXL), Blood Group, and Emergency Contact Name & Telephone.", styles['bullet']))
    story.append(Paragraph("- <b>Health Safety:</b> Medical Declaration: Runners declare existing health conditions (e.g., cardiac history, asthma, allergies) with voluntary emergency medical notes.", styles['bullet']))

    story.append(Paragraph("3.2 FR-02: Anti-Fraud Mobile OTP Verification Engine", styles['h2']))
    story.append(Paragraph("- <b>Token Generation:</b> Automated 6-digit cryptographic OTP generation delivered via SMS Gateway API hook.", styles['bullet']))
    story.append(Paragraph("- <b>Security Control:</b> Sliding-Window Rate Limiting: IP-based and mobile-based rate limiting prevents denial-of-service and SMS bombing attacks (max 3 attempts per minute).", styles['bullet']))
    story.append(Paragraph("- <b>Session Token:</b> Ephemeral Verification Token: A signed JWT token is issued upon successful OTP validation, valid for 15 minutes to finalize registration.", styles['bullet']))

    story.append(Paragraph("3.3 FR-03: Official Digital E-Pass & Secure Bib Allocation", styles['h2']))
    story.append(Paragraph("- <b>Bib Architecture:</b> Algorithmic Bib Assignment: Sequential, collision-free chest bib generation with category prefixes (RJ-21K-XXXX, RJ-10K-XXXX, RJ-05K-XXXX).", styles['bullet']))
    story.append(Paragraph("- <b>Encrypted QR:</b> Tamper-Proof QR Code: Encodes HMAC-SHA256 encrypted payload verifying runner identity, category, and certificate token.", styles['bullet']))
    story.append(Paragraph("- <b>Graphics Engine:</b> Client-Side Canvas E-Pass: Pure HTML5 Canvas 2D engine renders official passes with Rajasthan Police emblem, Ashoka Lion Capitol, dynamic text auto-scaling, and instant PNG download.", styles['bullet']))
    story.append(Paragraph("- <b>WhatsApp Link:</b> Direct WhatsApp Dispatch: 1-click WhatsApp API integration sends official pass text and verification links directly to the runner's registered mobile number.", styles['bullet']))

    story.append(Paragraph("3.4 FR-04: Expo Counter Logistics & RFID Kit Handover", styles['h2']))
    story.append(Paragraph("- <b>Scanner Engine:</b> Multi-Device Camera Scanner: WebRTC engine with platform-aware facing mode (mobile back camera vs PC webcam) and 400ms driver deallocation delay.", styles['bullet']))
    story.append(Paragraph("- <b>Barcode Gun:</b> Hardware Barcode Gun Support: Native input focus captures USB/Bluetooth 2D barcode scanner keystrokes in under 100 milliseconds.", styles['bullet']))
    story.append(Paragraph("- <b>Anti-Fraud:</b> Single-Handover Locking: Database atomicity prevents duplicate kit distribution. If a runner's bib was already collected, the terminal sounds an audible fraud alert displaying prior collection timestamp and officer badge ID.", styles['bullet']))

    story.append(Paragraph("3.5 FR-05: Albert Hall Race Day Gate Security & Gantry Access", styles['h2']))
    story.append(Paragraph("- <b>Access Control:</b> Albert Hall Entry Verification: Gate marshals scan e-passes at stadium gantries. System logs first entry and instantly flags duplicate gate entries.", styles['bullet']))
    story.append(Paragraph("- <b>Live Logging:</b> Real-Time Gate Logs: Audit table tracks gate entry timestamps, operator IDs, and sector densities.", styles['bullet']))

    story.append(Paragraph("3.6 FR-06: Finisher Certificate & Timing Mat Hub", styles['h2']))
    story.append(Paragraph("- <b>Search:</b> Instant Certificate Lookup: Public retrieval by Bib number, Mobile number, or Certificate ID.", styles['bullet']))
    story.append(Paragraph("- <b>Verification:</b> Tamper-Proof Verification: Cryptographic certificate ID verifies authenticity against the central database, displaying official rank, net finish time, and DGP digital signature.", styles['bullet']))
    story.append(Paragraph("- <b>Print Engine:</b> Isolated A4 Landscape Print Engine: Dedicated print stylesheets strip away all website UI, headers, and footers, printing only the A4 landscape certificate.", styles['bullet']))

    story.append(Paragraph("3.7 FR-07: High Command Admin Portal & District SP Desks", styles['h2']))
    story.append(Paragraph("- <b>RBAC:</b> Role-Based Access Control (RBAC): PHQ State Command has statewide jurisdiction; District SPs access their district data; Expo volunteers access counter desks.", styles['bullet']))
    story.append(Paragraph("- <b>CSV Engine:</b> Database CSV Export: Instant export of sanitized runner data for law enforcement record-keeping and timing mat synchronization.", styles['bullet']))

    story.append(Paragraph("4.0 Non-Functional Requirements (NFR)", styles['h1']))
    story.append(make_pdf_table(nfr_headers, nfr_data, [110, 160, 210], styles))
    story.append(Spacer(1, 10))

    story.append(Paragraph("5.0 Verification & Acceptance Criteria Matrix", styles['h1']))
    story.append(make_pdf_table(acc_headers, acc_data, [120, 240, 120], styles))
    story.append(Spacer(1, 10))

    story.append(Paragraph("6.0 Sign-off & Approval", styles['h1']))
    story.append(Paragraph("<b>Formal Approval:</b> This Product Requirement Document (PRD) represents the official baseline for the Rajasthan Police Marathon 2027 technical implementation. All requirements specified herein have been verified, validated, and approved for production operations.", styles['body']))

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
    build_prd()
