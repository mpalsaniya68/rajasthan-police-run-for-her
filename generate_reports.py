import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "production_documents")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# REPORTLAB CANVAS WITH HEADERS, FOOTERS & PAGE NUMBERS
# ---------------------------------------------------------------------------
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Times-Roman", 10)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (Pages 2+)
        if self._pageNumber > 1:
            self.drawString(54, 800, "Rajasthan Police Marathon 2027 • Official Technical Documentation")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 792, 541, 792)
            
        # Footer
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 541, 45)
        self.drawString(54, 32, "Rajasthan Police Headquarters, Jaipur • Government Official Deliverable")
        self.drawRightString(541, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def get_pdf_styles():
    styles = getSampleStyleSheet()
    return {
        'title': ParagraphStyle('PTitle', fontName='Times-Bold', fontSize=22, leading=26, textColor=colors.HexColor('#0a1c3d'), alignment=1, spaceAfter=8),
        'emblem': ParagraphStyle('PEmblem', fontName='Times-Bold', fontSize=12, leading=16, textColor=colors.HexColor('#0a1c3d'), alignment=1, spaceAfter=10),
        'sub': ParagraphStyle('PSub', fontName='Times-Italic', fontSize=14, leading=18, textColor=colors.HexColor('#0b3a75'), alignment=1, spaceAfter=18),
        'h1': ParagraphStyle('PH1', fontName='Times-Bold', fontSize=18, leading=22, textColor=colors.HexColor('#0a1c3d'), spaceBefore=16, spaceAfter=8, keepWithNext=True),
        'h2': ParagraphStyle('PH2', fontName='Times-Bold', fontSize=16, leading=20, textColor=colors.HexColor('#0b3a75'), spaceBefore=12, spaceAfter=6, keepWithNext=True),
        'h3': ParagraphStyle('PH3', fontName='Times-Bold', fontSize=14, leading=18, textColor=colors.HexColor('#111827'), spaceBefore=8, spaceAfter=4, keepWithNext=True),
        'body': ParagraphStyle('PBody', fontName='Times-Roman', fontSize=14, leading=18, textColor=colors.HexColor('#1f2937'), spaceAfter=8),
        'bullet': ParagraphStyle('PBullet', fontName='Times-Roman', fontSize=14, leading=18, textColor=colors.HexColor('#1f2937'), leftIndent=20, firstLineIndent=-12, spaceAfter=4),
        'table_cell': ParagraphStyle('PTCell', fontName='Times-Roman', fontSize=10, leading=13, textColor=colors.HexColor('#1f2937')),
        'table_head': ParagraphStyle('PTHead', fontName='Times-Bold', fontSize=10, leading=13, textColor=colors.white)
    }

# ---------------------------------------------------------------------------
# DOCX BASE STYLES & BUILDERS
# ---------------------------------------------------------------------------
def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def init_docx(doc_title, doc_id, doc_type):
    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(1)
        s.bottom_margin = Inches(1)
        s.left_margin = Inches(1)
        s.right_margin = Inches(1)
        
        hp = s.header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run(f"Rajasthan Police Marathon 2027 • {doc_type}")
        hrun.font.name = "Times New Roman"
        hrun.font.size = Pt(10)
        hrun.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

        fp = s.footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        frun = fp.add_run(f"Rajasthan Police Headquarters, Jaipur | {doc_id} | Confidential & Government Official")
        frun.font.name = "Times New Roman"
        frun.font.size = Pt(10)
        frun.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    normal_style = doc.styles['Normal']
    normal_font = normal_style.font
    normal_font.name = 'Times New Roman'
    normal_font.size = Pt(14)
    normal_font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    normal_style.paragraph_format.line_spacing = 1.2
    normal_style.paragraph_format.space_after = Pt(8)
    return doc

def add_docx_cover(doc, title, subtitle, doc_id, doc_type, date_str):
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(20)
    p_title.paragraph_format.space_after = Pt(8)
    
    remb = p_title.add_run("GOVERNMENT OF RAJASTHAN • POLICE HEADQUARTERS, JAIPUR\n")
    remb.font.name = "Times New Roman"
    remb.font.size = Pt(12)
    remb.font.bold = True
    remb.font.color.rgb = RGBColor(0x0A, 0x1C, 0x3D)

    rtitle = p_title.add_run(f"{title}\n")
    rtitle.font.name = "Times New Roman"
    rtitle.font.size = Pt(22)
    rtitle.font.bold = True
    rtitle.font.color.rgb = RGBColor(0x0A, 0x1C, 0x3D)

    rsub = p_title.add_run(subtitle)
    rsub.font.name = "Times New Roman"
    rsub.font.size = Pt(14)
    rsub.font.italic = True
    rsub.font.color.rgb = RGBColor(0x0B, 0x3A, 0x75)

    doc.add_paragraph()

    meta_table = doc.add_table(rows=6, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    meta = [
        ("Document Identification:", doc_id),
        ("Document Classification:", f"Official Technical Deliverable ({doc_type})"),
        ("Issuing Authority:", "Rajasthan Police Headquarters (PHQ), Jaipur"),
        ("Project / Campaign:", "Rajasthan Police Marathon 2027 ('Run for Her')"),
        ("Version & Status:", "Version 1.0 (Production Verified & Approved)"),
        ("Publication Date:", date_str)
    ]
    widths = [Inches(2.5), Inches(4.0)]
    for i, (k, v) in enumerate(meta):
        row = meta_table.rows[i]
        
        ck = row.cells[0]
        ck.width = widths[0]
        set_cell_background(ck, "F1F5F9")
        set_cell_margins(ck)
        pk = ck.paragraphs[0]
        pk.paragraph_format.space_after = Pt(2)
        rk = pk.add_run(k)
        rk.font.name = "Times New Roman"
        rk.font.size = Pt(12)
        rk.font.bold = True
        rk.font.color.rgb = RGBColor(0x0A, 0x1C, 0x3D)

        cv = row.cells[1]
        cv.width = widths[1]
        set_cell_background(cv, "FFFFFF")
        set_cell_margins(cv)
        pv = cv.paragraphs[0]
        pv.paragraph_format.space_after = Pt(2)
        rv = pv.add_run(v)
        rv.font.name = "Times New Roman"
        rv.font.size = Pt(12)
        rv.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    doc.add_page_break()

def docx_h(doc, text, level=1):
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.bold = True
    if level == 1:
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        r.font.size = Pt(18)
        r.font.color.rgb = RGBColor(0x0A, 0x1C, 0x3D)
    elif level == 2:
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        r.font.size = Pt(16)
        r.font.color.rgb = RGBColor(0x0B, 0x3A, 0x75)
    else:
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(3)
        r.font.size = Pt(14)
        r.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
    return p

def docx_p(doc, text, bold_prefix=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.2
    if bold_prefix:
        rb = p.add_run(bold_prefix)
        rb.font.name = "Times New Roman"
        rb.font.size = Pt(14)
        rb.font.bold = True
        rb.font.color.rgb = RGBColor(0x0A, 0x1C, 0x3D)
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    return p

def docx_b(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.2
    if bold_prefix:
        rb = p.add_run(bold_prefix)
        rb.font.name = "Times New Roman"
        rb.font.size = Pt(14)
        rb.font.bold = True
        rb.font.color.rgb = RGBColor(0x0A, 0x1C, 0x3D)
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    return p

def docx_tbl(doc, headers, rows_data, widths=None):
    table = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    hdr = table.rows[0]
    for c_idx, h_text in enumerate(headers):
        cell = hdr.cells[c_idx]
        if widths and c_idx < len(widths):
            cell.width = widths[c_idx]
        set_cell_background(cell, "0A1C3D")
        set_cell_margins(cell, top=120, bottom=120, left=120, right=120)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(h_text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    for r_idx, row_vals in enumerate(rows_data):
        row = table.rows[r_idx + 1]
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_vals):
            cell = row.cells[c_idx]
            if widths and c_idx < len(widths):
                cell.width = widths[c_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(str(val))
            r.font.name = "Times New Roman"
            r.font.size = Pt(11)
            r.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    doc.add_paragraph()

# ---------------------------------------------------------------------------
# REPORTLAB TABLE HELPER
# ---------------------------------------------------------------------------
def make_pdf_table(headers, rows_data, col_widths, styles):
    data = []
    # Header
    hdr_row = [Paragraph(f"<b>{h}</b>", styles['table_head']) for h in headers]
    data.append(hdr_row)
    # Rows
    for r in rows_data:
        row_cells = [Paragraph(str(v), styles['table_cell']) for v in r]
        data.append(row_cells)

    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0a1c3d')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
    ]))
    return t

print("Helper core ready.")
