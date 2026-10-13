"""PWA metadata and deterministic asset revisions shared by all generated pages."""
import hashlib
import json
import re
from pathlib import Path

BASE = '/menu-anual-recetas/'

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def icon_url(root, filename):
    return "assets/pwa/" + filename + "?v=" + digest(root/"assets/pwa"/filename)

def decorate(content, root, site):
    head = (f'<link rel="manifest" href="{site}/manifest.webmanifest">'
            '<meta name="theme-color" content="#516f5d">'
            f'<link rel="icon" type="image/png" sizes="32x32" href="{site}/{icon_url(root, "favicon-32.png")}">'
            f'<link rel="icon" type="image/png" sizes="16x16" href="{site}/{icon_url(root, "favicon-16.png")}">'
            f'<link rel="apple-touch-icon" sizes="180x180" href="{site}/{icon_url(root, "apple-touch-icon.png")}">'
            f'<link rel="stylesheet" href="{site}/assets/pwa.css">')
    content = content.replace('</head>', head + '</head>')
    content = content.replace('</body>', f'<script src="{site}/assets/pwa.js" defer></script></body>')
    # Each URL carries the hash of its own bytes, not a hand-maintained date.
    pattern = re.escape(site) + r'/assets/([a-zA-Z0-9_.-]+\.(?:css|js))(?:\?v=[^"\s<>]+)?'
    def revision_url(match):
        source = root/'assets'/match[1]
        revision = digest(source)
        destination = root/'assets/revisions'/revision/match[1]
        destination.parent.mkdir(parents=True, exist_ok=True)
        if not destination.exists():
            destination.write_bytes(source.read_bytes())
        return site + '/assets/revisions/' + revision + '/' + match[1] + '?v=' + revision
    return re.sub(pattern, revision_url, content)

def build(root):
    manifest_path = root/'manifest.webmanifest'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    for icon in manifest['icons']:
        filename = Path(icon['src'].split('?')[0]).name
        icon['src'] = icon_url(root, filename)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    precache = ['offline.html', 'manifest.webmanifest'] + [icon['src'] for icon in manifest['icons']]
    source = (root/'plantillas/sw.js').read_text(encoding='utf-8')
    paths = [root/'offline.html', root/'manifest.webmanifest'] + sorted((root/'assets').glob('pwa.*')) + sorted((root/'assets/pwa').glob('*.png'))
    revision = hashlib.sha256((source + ''.join(digest(p) for p in paths)).encode()).hexdigest()[:20]
    (root/'sw.js').write_text(source.replace('{{REVISION}}', revision).replace('{{PRECACHE}}', json.dumps(precache)), encoding='utf-8')
