import os
import sys

from generate_prd import build_prd
from generate_tech_report import build_tech_report
from generate_handover_report import build_handover_report

def main():
    print("==============================================================")
    print("RAJASTHAN POLICE MARATHON 2027: DOCUMENTATION COMPILER")
    print("Font Family: Times New Roman | Body Font Size: 14pt")
    print("Output Formats: Microsoft Word (.docx) & Adobe PDF (.pdf)")
    print("==============================================================")

    print("\n[1/3] Compiling Product Requirement Document (PRD)...")
    build_prd()

    print("\n[2/3] Compiling Technical Architecture & Engineering Report...")
    build_tech_report()

    print("\n[3/3] Compiling Production Submission & Handover Report...")
    build_handover_report()

    print("\n==============================================================")
    print("ALL 6 PRODUCTION DELIVERABLES COMPILED SUCCESSFULLY!")
    print("Directory: production_documents/")
    print("==============================================================")

if __name__ == "__main__":
    main()

