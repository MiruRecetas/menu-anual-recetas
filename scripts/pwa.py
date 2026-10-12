"""PWA metadata and deterministic asset revisions shared by all generated pages."""
import hashlib
import re
from pathlib import Path

BASE = '/menu-anual-recetas/'

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def decorate(content, root, site):
    head = (f'<link rel="manifest" href="{site}/manifest.webmanifest">'
            '<meta name="theme-color" content="#516f5d">'
            f'<link rel="icon" href="{site}/assets/pwa/icon-192.png">'
            f'<link rel="apple-touch-icon" href="{site}/assets/pwa/apple-touch-icon.png">'
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
    source = (root/'plantillas/sw.js').read_text(encoding='utf-8')
    paths = [root/'offline.html', root/'manifest.webmanifest'] + sorted((root/'assets').glob('pwa.*')) + sorted((root/'assets/pwa').glob('*.png'))
    revision = hashlib.sha256((source + ''.join(digest(p) for p in paths)).encode()).hexdigest()[:20]
    (root/'sw.js').write_text(source.replace('{{REVISION}}', revision), encoding='utf-8')
