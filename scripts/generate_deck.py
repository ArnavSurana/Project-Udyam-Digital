"""
Generate Airtel SYNC 7-Slide Presentation Deck matching the problem statement template.
Slide 1: Title (Airtel SYNC · Enterprise Track A · Project Udyam Digital)
Slide 2: Context & The Problem (Current High-Drop Paper Journey vs Digital In One Sitting)
Slide 3: Target Segments & The Prioritised Bundle Strategy
Slide 4: Solution Architecture & Technical Data Flow
Slide 5: Live Interactive Walkthrough & Demo Video
Slide 6: Impact & Metrics (Lead-to-Activation, Churn, CAC & Status Chase Elimination)
Slide 7: DPDP Compliance, Field Force Synergy & Rollout Plan
"""
import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Colors
    c_bg = RGBColor(11, 15, 25)         # #0b0f19
    c_card = RGBColor(22, 31, 48)       # #161f30
    c_red = RGBColor(225, 25, 0)        # #e11900
    c_white = RGBColor(255, 255, 255)
    c_gray = RGBColor(156, 163, 175)
    c_blue = RGBColor(56, 189, 248)
    c_green = RGBColor(16, 185, 129)
    c_yellow = RGBColor(250, 204, 21)

    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = c_bg
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="Airtel SYNC · YTL Hackathon 2026 · Enterprise Track A"):
        # Header bar
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.9))
        tf = header_box.text_frame
        tf.word_wrap = True
        p_sub = tf.paragraphs[0]
        p_sub.text = category_text.upper()
        p_sub.font.size = Pt(11)
        p_sub.font.bold = True
        p_sub.font.color.rgb = c_red
        
        p_title = tf.add_paragraph()
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = c_white

    # ==========================
    # SLIDE 1: TITLE SLIDE
    # ==========================
    slide1 = prs.slides.add_slide(blank_layout)
    add_bg(slide1)

    # Red Accent Bar
    accent = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.2), Inches(3.6))
    accent.fill.solid()
    accent.fill.fore_color.rgb = c_red
    accent.line.fill.background()

    tb1 = slide1.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(11), Inches(3.6))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "AIRTEL SYNC · YTL HACKATHON 2026"
    p0.font.size = Pt(14)
    p0.font.bold = True
    p0.font.color.rgb = c_red

    p1 = tf1.add_paragraph()
    p1.text = "Project Udyam Digital"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = c_white

    p2 = tf1.add_paragraph()
    p2.text = "Making Small Businesses Go Digital in One Sitting"
    p2.font.size = Pt(22)
    p2.font.color.rgb = c_blue

    p3 = tf1.add_paragraph()
    p3.text = "\nA GenAI-powered digital onboarding and operations engine replacing slow paper-based sales visits with instant discovery, automated KYC, and Paytm AutoPay."
    p3.font.size = Pt(14)
    p3.font.color.rgb = c_gray

    # Footer Card
    card_foot = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.8), Inches(11.7), Inches(1.0))
    card_foot.fill.solid()
    card_foot.fill.fore_color.rgb = c_card
    card_foot.line.color.rgb = RGBColor(40, 50, 70)
    tf_f = card_foot.text_frame
    pf = tf_f.paragraphs[0]
    pf.text = "Deliverables: Working Prototype · Solution Architecture Diagram · 7-Slide Business Case · Demo Video Walkthrough"
    pf.font.size = Pt(12)
    pf.font.bold = True
    pf.font.color.rgb = c_white
    pf.alignment = PP_ALIGN.CENTER

    # ==========================
    # SLIDE 2: CONTEXT & PROBLEM
    # ==========================
    slide2 = prs.slides.add_slide(blank_layout)
    add_bg(slide2)
    add_header(slide2, "Context & The Problem: Steep Dropouts in SMB Onboarding")

    # Column 1: Legacy Pain Points
    box2_1 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.3))
    box2_1.fill.solid()
    box2_1.fill.fore_color.rgb = c_card
    box2_1.line.color.rgb = RGBColor(45, 55, 75)
    tf2_1 = box2_1.text_frame
    tf2_1.word_wrap = True
    p = tf2_1.paragraphs[0]
    p.text = "THE AS-IS JOURNEY: SLOW & PAPER-HEAVY"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = c_red

    bullets = [
        ("Needs Discovery in Person", "Sales reps pitch target products rather than actual needs."),
        ("3–5 Days for PDF Quotes", "Quotes come as confusing PDFs with product codes owners don't understand."),
        ("Physical KYC Hassle", "Documents collected manually via paper/WhatsApp with frequent errors."),
        ("10–14 Days to Activate", "Customers chase status an average of 3 times per onboarding."),
        ("Fragmented Vendors", "Businesses buy separate SIMs, CCTV, POS, and broadband with separate bills.")
    ]
    for b_title, b_desc in bullets:
        pb = tf2_1.add_paragraph()
        pb.text = f"• {b_title}: {b_desc}"
        pb.font.size = Pt(11)
        pb.font.color.rgb = c_gray

    # Column 2: Data Insights
    box2_2 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.3))
    box2_2.fill.solid()
    box2_2.fill.fore_color.rgb = c_card
    box2_2.line.color.rgb = RGBColor(45, 55, 75)
    tf2_2 = box2_2.text_frame
    tf2_2.word_wrap = True
    p = tf2_2.paragraphs[0]
    p.text = "DATA EVIDENCE: smb_leads.csv (5,000 LEADS)"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = c_blue

    metrics_list = [
        ("Only 7.0% Activation Rate", "Steepest drop is from Needs Assessed (1,974) to Quote Accepted (861) — a 56% dropout!"),
        ("17.6 Days Average Cycle", "Lead-to-activation takes over 2.5 weeks, driving customer frustration."),
        ("₹15,000 Blended CAC", "Sales visits and friction inflate cost to acquire beyond viable margins."),
        ("9.6% vs 2.0% GSTIN Effect", "Leads with verified GSTIN activate 4.8× more often than unverified leads."),
        ("3× Status Chases", "Customers constantly call support due to lack of self-serve tracking.")
    ]
    for m_title, m_desc in metrics_list:
        pb = tf2_2.add_paragraph()
        pb.text = f"• {m_title}: {m_desc}"
        pb.font.size = Pt(11)
        pb.font.color.rgb = c_gray

    # ==========================
    # SLIDE 3: TARGET SEGMENTS & BUNDLE STRATEGY
    # ==========================
    slide3 = prs.slides.add_slide(blank_layout)
    add_bg(slide3)
    add_header(slide3, "Target Segments & Tailored Bundle Strategy")

    segments = [
        ("Micro Retail & Services", "55% of Base", "₹899 – ₹1,499/mo", "Biz 5G AirFiber 100 + Cloud POS & Billing + WhatsApp API", "Very High Sensitivity: Needs reliable internet for UPI & orders."),
        ("Professional Offices", "25% of Base", "₹1,499 – ₹2,999/mo", "Biz Fibre 300 + Cloud Email / Office Suite + Endpoint Security", "Medium Sensitivity: High priority on uptime, client confidentiality & static IP."),
        ("Small Multi-Site Businesses", "15% of Base", "₹3,500 – ₹7,000/mo", "Biz Fibre 300 + Managed SD-WAN + 4G Failover + Cloud CCTV", "Medium-Low Sensitivity: Demands single consolidated bill & centralized failover."),
        ("Small Manufacturers", "5% of Base", "₹8,000 – ₹18,000/mo", "Internet Leased Line + IoT Machine Monitor + Managed Firewall", "Low Sensitivity: Dedicated bandwidth SLA and machinery telemetry.")
    ]

    for idx, (seg_name, share, price, bundle, notes) in enumerate(segments):
        x = Inches(0.8 + idx * 2.95)
        card = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.5), Inches(2.8), Inches(5.3))
        card.fill.solid()
        card.fill.fore_color.rgb = c_card
        card.line.color.rgb = c_red if idx == 1 else RGBColor(45, 55, 75)
        
        tfc = card.text_frame
        tfc.word_wrap = True
        
        p = tfc.paragraphs[0]
        p.text = seg_name
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = c_white

        p_s = tfc.add_paragraph()
        p_s.text = f"{share} · {price}"
        p_s.font.size = Pt(11)
        p_s.font.bold = True
        p_s.font.color.rgb = c_blue

        p_b = tfc.add_paragraph()
        p_b.text = f"\nOptimal Bundle:\n{bundle}"
        p_b.font.size = Pt(10.5)
        p_b.font.color.rgb = c_yellow

        p_n = tfc.add_paragraph()
        p_n.text = f"\nProfile & Insight:\n{notes}"
        p_n.font.size = Pt(10)
        p_n.font.color.rgb = c_gray

    # ==========================
    # SLIDE 4: ARCHITECTURE DIAGRAM & DATA FLOWS
    # ==========================
    slide4 = prs.slides.add_slide(blank_layout)
    add_bg(slide4)
    add_header(slide4, "End-to-End Solution Architecture & Data Flow")

    # Architecture Overview Box
    arch_box = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(11.7), Inches(5.3))
    arch_box.fill.solid()
    arch_box.fill.fore_color.rgb = c_card
    arch_box.line.color.rgb = RGBColor(50, 65, 90)
    tfa = arch_box.text_frame
    tfa.word_wrap = True

    pa = tfa.paragraphs[0]
    pa.text = "MULTI-TIER EVENT-DRIVEN ARCHITECTURE (High Cohesion, Zero Bloat)"
    pa.font.size = Pt(14)
    pa.font.bold = True
    pa.font.color.rgb = c_blue

    arch_sections = [
        ("Layer 1: Mobile-First Presentation (React 19 + Vite)", 
         "• Dual Face: Small Business Owner Portal & Enterprise Sales Ops Console.\n• Supabase / OAuth 2.0 SSO Authentication & Role Gating.\n• Conversational needs discovery with quick chips & Hindi/English voice toggle.\n• Dynamic live quote generator enforcing product catalogue dependencies in real time."),
        ("Layer 2: Application & AI Intelligence (FastAPI + Python 3.12)",
         "• Grok AI Engine (xAI API) generating plain-language reasoning why the bundle fits.\n• Smart KYC OCR Pipeline (Tesseract + OpenCV Laplacian blur detection).\n• DPDP Act 2023 Validation: Automated 90-day utility bill expiry check & 30-day retention purge.\n• Paytm Payment Gateway (Sandbox): Dynamic UPI intent, QR simulator, and AutoPay mandate.\n• Contextual Status AI Chatbot eliminating status chase phone calls."),
        ("Layer 3: Enterprise Data & Mock Registries",
         "• Mock GSTIN Registry (3,534 records) — formats & status checks.\n• Mock Udyam Registry (2,723 records) — MSME verification.\n• Historical SMB Leads Data (5,000 records) — powering ML propensity priority calling queue.\n• File Asset: architecture_diagram.svg (High-resolution editorial SVG blueprint).")
    ]
    for sec_title, sec_desc in arch_sections:
        p_sec = tfa.add_paragraph()
        p_sec.text = f"\n{sec_title}"
        p_sec.font.size = Pt(12)
        p_sec.font.bold = True
        p_sec.font.color.rgb = c_yellow

        p_det = tfa.add_paragraph()
        p_det.text = sec_desc
        p_det.font.size = Pt(10.5)
        p_det.font.color.rgb = c_gray

    # ==========================
    # SLIDE 5: LIVE DEMO & VIDEO WALKTHROUGH
    # ==========================
    slide5 = prs.slides.add_slide(blank_layout)
    add_bg(slide5)
    add_header(slide5, "Live Prototype & Demo Video Walkthrough")

    demo_box_l = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.3))
    demo_box_l.fill.solid()
    demo_box_l.fill.fore_color.rgb = c_card
    demo_box_l.line.color.rgb = RGBColor(50, 65, 90)
    tfl = demo_box_l.text_frame
    tfl.word_wrap = True
    pl = tfl.paragraphs[0]
    pl.text = "5-STEP OWNER ONBOARDING JOURNEY"
    pl.font.size = Pt(13)
    pl.font.bold = True
    pl.font.color.rgb = c_red

    steps = [
        ("Step 1: AI Advisor", "4-question needs wizard (category, staff, branches, GSTIN)."),
        ("Step 2: Interactive Quote", "Custom bundle recommendation with live add-ons and 12-month discount."),
        ("Step 3: Smart KYC", "Instant OCR document extraction + DPDP consent notice."),
        ("Step 4: Paytm Sandbox", "One-touch UPI intent QR payment + recurring mandate setup."),
        ("Step 5: Order Tracker", "5-stage timeline with assigned field engineer & AI query assistant.")
    ]
    for s_title, s_desc in steps:
        p = tfl.add_paragraph()
        p.text = f"• {s_title}: {s_desc}"
        p.font.size = Pt(11)
        p.font.color.rgb = c_gray

    demo_box_r = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.3))
    demo_box_r.fill.solid()
    demo_box_r.fill.fore_color.rgb = c_card
    demo_box_r.line.color.rgb = RGBColor(50, 65, 90)
    tfr = demo_box_r.text_frame
    tfr.word_wrap = True
    pr = tfr.paragraphs[0]
    pr.text = "DEMO ARTIFACTS & LINKS"
    pr.font.size = Pt(13)
    pr.font.bold = True
    pr.font.color.rgb = c_blue

    links = [
        ("Working Web Application", "Frontend: http://127.0.0.1:3000 | Backend: http://127.0.0.1:8000"),
        ("Demo Video Walkthrough", "udyam_demo_walkthrough.mp4 (Recorded end-to-end interactive journey)"),
        ("Architecture Blueprint", "architecture_diagram.svg (Editorial-grade system diagram)"),
        ("GitHub Repository Link", "https://github.com/accel-telecom/project-udyam-digital"),
        ("Dual Sign-in Mode", "Business Owner: owner@balajidental.in | Admin: admin@airtel.com")
    ]
    for l_title, l_desc in links:
        p = tfr.add_paragraph()
        p.text = f"• {l_title}:\n   {l_desc}"
        p.font.size = Pt(11)
        p.font.color.rgb = c_gray

    # ==========================
    # SLIDE 6: METRICS & BUSINESS CASE
    # ==========================
    slide6 = prs.slides.add_slide(blank_layout)
    add_bg(slide6)
    add_header(slide6, "Key Metrics & Business Case Impact")

    kpi_cards = [
        ("Lead-to-Activation", "7.0%", "14.2%", "Target 12-15% achieved via instant self-serve checkout & Grok AI clarity."),
        ("Activation Velocity", "17.6 Days", "< 2.5 Days", "Cut by 85% through instant OCR KYC & pre-scheduled technician dispatch."),
        ("Blended CAC", "₹15,000", "₹6,800", "Zero sales rep travel waste for micro SMBs; digital closures cut cost by 54%."),
        ("Status Chase Calls", "3 per cust", "0.4 per cust", "Eliminated with 'Ask About My Order' AI & real-time WhatsApp updates.")
    ]
    for idx, (kpi, base, target, impact) in enumerate(kpi_cards):
        x = Inches(0.8 + idx * 2.95)
        k_card = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.5), Inches(2.8), Inches(5.3))
        k_card.fill.solid()
        k_card.fill.fore_color.rgb = c_card
        k_card.line.color.rgb = c_green if idx == 0 else RGBColor(45, 55, 75)
        
        tfk = k_card.text_frame
        tfk.word_wrap = True
        
        p = tfk.paragraphs[0]
        p.text = kpi
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = c_white

        p_val = tfk.add_paragraph()
        p_val.text = f"\n{target}"
        p_val.font.size = Pt(28)
        p_val.font.bold = True
        p_val.font.color.rgb = c_green

        p_base = tfk.add_paragraph()
        p_base.text = f"Baseline: {base}"
        p_base.font.size = Pt(11)
        p_base.font.color.rgb = c_yellow

        p_imp = tfk.add_paragraph()
        p_imp.text = f"\nBusiness Impact:\n{impact}"
        p_imp.font.size = Pt(10.5)
        p_imp.font.color.rgb = c_gray

    # ==========================
    # SLIDE 7: DPDP COMPLIANCE & FIELD SYNERGY
    # ==========================
    slide7 = prs.slides.add_slide(blank_layout)
    add_bg(slide7)
    add_header(slide7, "DPDP 2023 Compliance & Field Force Synergy")

    box7_1 = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.3))
    box7_1.fill.solid()
    box7_1.fill.fore_color.rgb = c_card
    box7_1.line.color.rgb = RGBColor(45, 55, 75)
    tf7_1 = box7_1.text_frame
    tf7_1.word_wrap = True
    p = tf7_1.paragraphs[0]
    p.text = "DATA PRIVACY (DPDP ACT 2023) COMPLIANCE"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = c_green

    dpdp_items = [
        ("Explicit Granular Consent", "Opt-in consent screen before any document or camera access is granted."),
        ("Data Minimisation", "Extracts only GSTIN/Udyam identifiers. Discards unneeded document metadata."),
        ("Automated Purge Cycle", "KYC documents are retained for 30 days post-activation, then automatically purged."),
        ("Fraud & Tamper Defense", "OpenCV Laplacian blur detection + 90-day utility bill date validation against 2026-07-15.")
    ]
    for d_title, d_desc in dpdp_items:
        pb = tf7_1.add_paragraph()
        pb.text = f"• {d_title}:\n   {d_desc}"
        pb.font.size = Pt(11)
        pb.font.color.rgb = c_gray

    box7_2 = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.3))
    box7_2.fill.solid()
    box7_2.fill.fore_color.rgb = c_card
    box7_2.line.color.rgb = RGBColor(45, 55, 75)
    tf7_2 = box7_2.text_frame
    tf7_2.word_wrap = True
    p = tf7_2.paragraphs[0]
    p.text = "FIELD FORCE & CHANNEL PARTNER ALLY"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = c_blue

    field_items = [
        ("Assisted Digital Mode", "Sales reps launch the exact same portal on a tablet during shop visits to close instantly."),
        ("Channel Partner Commission", "Partners receive referral codes and earn 100% commissions on digital closures."),
        ("Priority Callback Queue", "ML propensity model spots high-intent dropouts and feeds them to sales agents."),
        ("Human Fallback Loop", "If the AI Advisor is uncertain, it automatically creates a callback ticket in Ops Console.")
    ]
    for f_title, f_desc in field_items:
        pb = tf7_2.add_paragraph()
        pb.text = f"• {f_title}:\n   {f_desc}"
        pb.font.size = Pt(11)
        pb.font.color.rgb = c_gray

    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Project_Udyam_Digital_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation generated successfully at: {output_path}")

if __name__ == "__main__":
    build_presentation()
