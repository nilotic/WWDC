#!/usr/bin/env python3
import json
from pathlib import Path
from urllib.parse import quote

REPO_ROOT = Path(__file__).resolve().parents[1]
DOCS_ROOT = REPO_ROOT / 'docs'


def collect(year_dir: Path):
    rows = []
    for d in sorted([p for p in year_dir.iterdir() if p.is_dir()]):
        title = display_title(d.name)
        summary = None
        fallback_summaries = []
        pdf = None
        for p in d.iterdir():
            if p.is_file():
                if p.suffix.lower() == '.md':
                    if p.name.endswith('-Summary.md'):
                        summary = p
                    else:
                        fallback_summaries.append(p)
                elif p.suffix.lower() == '.pdf':
                    pdf = p
        if summary is None and len(fallback_summaries) == 1:
            summary = fallback_summaries[0]
        rows.append((title, summary, pdf))
    return rows


def display_title(path_name: str) -> str:
    return path_name.replace('Code-along - ', 'Code-along: ', 1)


def enc(path: str) -> str:
    return quote(path, safe='/')


def find_years():
    years = []
    for p in DOCS_ROOT.iterdir():
        if p.is_dir() and p.name.isdigit() and len(p.name) == 4:
            years.append(p.name)
    return sorted(years)


def build_indexes():
    years = find_years()

    # docs/INDEX.md
    lines = ['# WWDC 2024–2025 Index', '']
    if years:
        lines[0] = f'# WWDC {years[0]}–{years[-1]} Index'

    for year in years:
        year_dir = DOCS_ROOT / year
        lines += [f'## WWDC {year}', '', '| Session | Summary | PDF |', '| --- | --- | --- |']
        for title, summary, pdf in collect(year_dir):
            if summary:
                rel = f'{year}/{summary.parent.name}/{summary.name}'
                summary_link = f'[View Summary](reader.html?path={enc(rel)})'
            else:
                summary_link = '—'
            if pdf:
                pdf_rel = f'{year}/{pdf.parent.name}/{pdf.name}'
                pdf_link = f'[View PDF](pdf.html?path={enc(pdf_rel)})'
            else:
                pdf_link = '—'
            lines.append(f'| {title} | {summary_link} | {pdf_link} |')
        lines.append('')

    (DOCS_ROOT / 'INDEX.md').write_text('\n'.join(lines), encoding='utf-8')

    # root INDEX.md
    root_lines = ['# WWDC 2024–2025 Index', '']
    if years:
        root_lines[0] = f'# WWDC {years[0]}–{years[-1]} Index'

    for year in years:
        year_dir = DOCS_ROOT / year
        root_lines += [f'## WWDC {year}', '', '| Session | Summary | PDF |', '| --- | --- | --- |']
        for title, summary, pdf in collect(year_dir):
            if summary:
                rel = f'{year}/{summary.parent.name}/{summary.name}'
                summary_link = f'[View Summary](docs/reader.html?path={enc(rel)})'
            else:
                summary_link = '—'
            if pdf:
                pdf_rel = f'{year}/{pdf.parent.name}/{pdf.name}'
                pdf_link = f'[View PDF](docs/pdf.html?path={enc(pdf_rel)})'
            else:
                pdf_link = '—'
            root_lines.append(f'| {title} | {summary_link} | {pdf_link} |')
        root_lines.append('')

    (REPO_ROOT / 'INDEX.md').write_text('\n'.join(root_lines), encoding='utf-8')


def build_search():
    years = find_years()
    entries = []
    for year in years:
        year_dir = DOCS_ROOT / year
        for title, summary, pdf in collect(year_dir):
            text = ''
            summary_url = None
            pdf_url = None
            if summary and summary.exists():
                try:
                    text = summary.read_text(encoding='utf-8', errors='ignore')
                except Exception:
                    text = ''
                rel = f'{year}/{summary.parent.name}/{summary.name}'
                summary_url = f'reader.html?path={enc(rel)}'
            if pdf and pdf.exists():
                pdf_rel = f'{year}/{pdf.parent.name}/{pdf.name}'
                pdf_url = f'pdf.html?path={enc(pdf_rel)}'
            entries.append({
                'id': f'{year}/{summary.parent.name if summary else title}',
                'title': title,
                'year': year,
                'summary_url': summary_url,
                'pdf_url': pdf_url,
                'text': ' '.join(text.split()),
            })

    (DOCS_ROOT / 'search.json').write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding='utf-8')


def main():
    if not DOCS_ROOT.exists():
        raise SystemExit(f'missing docs root: {DOCS_ROOT}')
    build_indexes()
    build_search()
    print('Updated docs/INDEX.md, INDEX.md, and docs/search.json')


if __name__ == '__main__':
    main()
