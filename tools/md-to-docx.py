# -*- coding: utf-8 -*-
"""Convert the project's markdown documents into a readable .docx file.

Usage:  python tools/md-to-docx.py <input.md> <output.docx>
Supports: # headings, bullet lists, numbered lists, pipe tables, **bold**,
inline `code`, and horizontal rules. Designed for the KONTEKS_PEMBELAJARAN doc.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

INK = RGBColor(0x24, 0x45, 0x2B)
GREEN = RGBColor(0x2F, 0x6B, 0x3C)
GREY = RGBColor(0x55, 0x5F, 0x58)

BOLD_RE = re.compile(r"(\*\*.+?\*\*|`.+?`)")


def shade(cell, hex_colour: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_colour)
    tc_pr.append(shd)


def add_rich_text(paragraph, text: str, *, size: float | None = None, colour=None) -> None:
    for chunk in BOLD_RE.split(text):
        if not chunk:
            continue
        if chunk.startswith("**") and chunk.endswith("**") and len(chunk) > 4:
            run = paragraph.add_run(chunk[2:-2])
            run.bold = True
        elif chunk.startswith("`") and chunk.endswith("`") and len(chunk) > 2:
            run = paragraph.add_run(chunk[1:-1])
            run.font.name = "Consolas"
            run.font.size = Pt((size or 11) - 1)
        else:
            run = paragraph.add_run(chunk)
        if size:
            run.font.size = Pt(size)
        if colour:
            run.font.color.rgb = colour


def build(input_path: Path, output_path: Path) -> tuple[int, int]:
    lines = input_path.read_text(encoding="utf-8").splitlines()

    doc = Document()
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(2.0)
    section.bottom_margin = Cm(2.0)
    section.left_margin = Cm(2.2)
    section.right_margin = Cm(2.2)

    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(10.5)
    normal.paragraph_format.space_after = Pt(4)
    normal.paragraph_format.line_spacing = 1.15

    for level, size in ((1, 18), (2, 14), (3, 12)):
        style = doc.styles[f"Heading {level}"]
        style.font.name = "Calibri"
        style.font.size = Pt(size)
        style.font.color.rgb = INK if level == 1 else GREEN
        style.font.bold = True
        style.paragraph_format.space_before = Pt(12 if level > 1 else 6)
        style.paragraph_format.space_after = Pt(4)

    heading_count = 0
    table_count = 0
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i].rstrip()
        stripped = line.strip()

        if not stripped or stripped in {"---", "***"}:
            i += 1
            continue

        # Pipe table: collect consecutive rows starting with '|'
        if stripped.startswith("|"):
            rows: list[list[str]] = []
            while i < n and lines[i].strip().startswith("|"):
                raw = lines[i].strip().strip("|")
                cells = [c.strip() for c in raw.split("|")]
                if not all(re.fullmatch(r":?-{2,}:?", c or "") for c in cells):
                    rows.append(cells)
                i += 1
            if rows:
                width = max(len(r) for r in rows)
                table = doc.add_table(rows=len(rows), cols=width)
                table.style = "Table Grid"
                table.alignment = WD_TABLE_ALIGNMENT.CENTER
                for r_idx, row in enumerate(rows):
                    for c_idx in range(width):
                        cell = table.cell(r_idx, c_idx)
                        cell.text = ""
                        para = cell.paragraphs[0]
                        para.paragraph_format.space_after = Pt(1)
                        value = row[c_idx] if c_idx < len(row) else ""
                        add_rich_text(para, value, size=9.5)
                        if r_idx == 0:
                            for run in para.runs:
                                run.bold = True
                                run.font.color.rgb = INK
                            shade(cell, "E8F3E9")
                doc.add_paragraph()
                table_count += 1
            continue

        if stripped.startswith("#"):
            level = len(stripped) - len(stripped.lstrip("#"))
            text = stripped[level:].strip()
            doc.add_heading(text, level=min(level, 3))
            heading_count += 1
            i += 1
            continue

        if stripped.startswith("- "):
            para = doc.add_paragraph(style="List Bullet")
            para.paragraph_format.space_after = Pt(2)
            add_rich_text(para, stripped[2:])
            i += 1
            continue

        numbered = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if numbered:
            para = doc.add_paragraph(style="List Number")
            para.paragraph_format.space_after = Pt(2)
            add_rich_text(para, numbered.group(2))
            i += 1
            continue

        para = doc.add_paragraph()
        add_rich_text(para, stripped, colour=None)
        i += 1

    doc.save(output_path)
    return heading_count, table_count


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: md-to-docx.py <input.md> <output.docx>")
        return 2
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    if not src.exists():
        print(f"missing input: {src}")
        return 1
    headings, tables = build(src, dst)
    print(f"ok: {dst}  headings={headings} tables={tables} size={dst.stat().st_size} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
