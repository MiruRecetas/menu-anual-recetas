import hashlib
import json
import struct
import subprocess
import sys
import unittest
from pathlib import Path
from scripts.pwa import decorate, build
R=Path(__file__).resolve().parents[1]
SITE='https://mirurecetas.github.io/menu-anual-recetas'

class PWA(unittest.TestCase):
    def test_manifest_and_icons(self):
        m=json.loads((R/'manifest.webmanifest').read_text())
        for k in ('id','scope','start_url'): self.assertEqual(m[k],'/menu-anual-recetas/')
        self.assertEqual(m['display'],'standalone')
        for icon in m['icons']:
            data=(R/icon['src'].split('?')[0]).read_bytes()
            self.assertEqual(data[:8],b'\x89PNG\r\n\x1a\n')
            size=struct.unpack('>II',data[16:24])
            self.assertEqual(icon['sizes'],f'{size[0]}x{size[1]}')
    def test_all_page_families(self):
        subprocess.run([sys.executable, str(R/"scripts/generar.py")], cwd=R, check=True, capture_output=True)
        for p in [R/'index.html',R/'recetario/index.html',next((R/'recetas').glob('*/index.html')),R/'menus/10-1/lunes/index.html']:
            t=p.read_text()
            self.assertIn(SITE+'/manifest.webmanifest',t)
            self.assertRegex(t, r'/assets/revisions/[a-f0-9]{64}/pwa.js\?v=')
            self.assertNotIn('unpkg.com',t)
    def test_asset_revision_changes_and_idempotence(self):
        text=f'<head></head><body><script src="{SITE}/assets/cocina.js?v=old"></script></body>'
        result=decorate(text,R,SITE)
        self.assertEqual(result,decorate(text,R,SITE))
        self.assertIn(hashlib.sha256((R/'assets/cocina.js').read_bytes()).hexdigest(),result)
        build(R);a=(R/'sw.js').read_bytes();build(R);self.assertEqual(a,(R/'sw.js').read_bytes())
    def test_sw_limits_and_scope(self):
        sw=(R/'sw.js').read_text()
        self.assertNotIn('{{',sw)
        self.assertIn("request.headers.has('Authorization')",sw)
        self.assertNotIn('clients.claim()',sw)
        self.assertTrue((R/'offline.html').exists())
