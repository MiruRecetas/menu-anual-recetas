#!/usr/bin/env python3
"""Anonymous HTTP verification against generated local bytes, with bounded retries."""
import hashlib
import time
import urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SITE='https://mirurecetas.github.io/menu-anual-recetas/'

def verify():
    paths=['manifest.webmanifest','sw.js','offline.html','assets/pwa/icon-192.png','assets/pwa/icon-512.png','assets/pwa/maskable-512.png','assets/pwa/apple-touch-icon.png','index.html','recetario/index.html','menus/10-1/lunes/index.html','recetas/tortilla-de-patata-tradicional-con-cebolla/index.html']
    for p in paths:
        expected=(ROOT/p).read_bytes();revision=hashlib.sha256(expected).hexdigest()
        request=urllib.request.Request(SITE+p+'?verify='+revision,headers={'User-Agent':'MiruRecetas-PWA-Verification','Cache-Control':'no-cache'})
        with urllib.request.urlopen(request,timeout=20) as response:
            body=response.read();mime=response.headers.get('Content-Type','')
            if response.status!=200 or body!=expected:raise ValueError('Pages pendiente: '+p)
            if p.endswith('.webmanifest') and 'json' not in mime:raise ValueError('MIME manifest: '+mime)
            if p.endswith('.js') and 'javascript' not in mime:raise ValueError('MIME SW: '+mime)
            if p.endswith('.png') and 'image/png' not in mime:raise ValueError('MIME icono: '+mime)
        print('HTTP público 200 y bytes verificados:',SITE+p)

if __name__=='__main__':
    for attempt in range(24):
        try:verify();break
        except (OSError,ValueError) as err:
            print(str(err),flush=True)
            if attempt==23:raise
            time.sleep(10)
