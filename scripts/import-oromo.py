"""
Run this after you fill in the "Oromo (fill this in)" column in the
translation Excel file and re-upload it.

Usage:
    python3 scripts/import-oromo.py path/to/filled_translations.xlsx

It reads columns: Key | English (source) | Oromo (fill this in) | Used in
and writes src/locales/om.json, keeping any key whose Oromo cell is still
blank as an empty string (so it falls back to English automatically).
Rows that already had an Oromo value in the sheet are kept as-is too.
"""
import sys
import json
from openpyxl import load_workbook


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 import-oromo.py <translated.xlsx>")
        sys.exit(1)

    path = sys.argv[1]
    wb = load_workbook(path)
    ws = wb.active

    om = {}
    for row in ws.iter_rows(min_row=2, values_only=True):
        key, english, oromo = row[0], row[1], row[2]
        if not key:
            continue
        om[key] = (oromo or "").strip()

    out_path = "src/locales/om.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(om, f, ensure_ascii=False, indent=2)

    filled = sum(1 for v in om.values() if v)
    print(f"Wrote {out_path}: {filled}/{len(om)} keys translated.")


if __name__ == "__main__":
    main()
