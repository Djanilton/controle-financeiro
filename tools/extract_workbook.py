"""Read-only extraction of formulas and cached values; output contains private data.

Requires openpyxl. Never save the output inside the public repository.
"""
import json
from pathlib import Path
import sys
import openpyxl

if len(sys.argv) != 3:
    raise SystemExit('Usage: python tools/extract_workbook.py input.xlsx private-output.json')
source, target = map(Path, sys.argv[1:])
repository = Path(__file__).resolve().parents[1]
if target.resolve().is_relative_to(repository) or source.resolve() == target.resolve():
    raise SystemExit('Choose a private output outside the repository and distinct from the source.')
formulas = openpyxl.load_workbook(source, data_only=False)
cached = openpyxl.load_workbook(source, data_only=True)
out = {sheet.title: {cell.coordinate: {
    'formula': (cell.value if isinstance(cell.value, str) else cell.value.text) if cell.data_type == 'f' else None,
    'value': cached[sheet.title][cell.coordinate].value
} for row in sheet for cell in row if cell.value is not None} for sheet in formulas}
with target.open('x', encoding='utf-8') as stream:
    json.dump(out, stream, ensure_ascii=False, default=str)
print(json.dumps({'sheets': len(out), 'cells': sum(map(len, out.values()))}))
