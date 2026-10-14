"""HTTP anónimo y binarios publicados. No acredita una importación física en Bring!."""
import hashlib,json,time,urllib.request,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SITE='https://mirurecetas.github.io/menu-anual-recetas/'
def verify():
 files=[]
 for key in json.loads((ROOT/'datos/compra/activos.json').read_text()):
  files += [f'menus/{key}/compra/index.html',f'datos/compra/{key}.json']
  files += [f'menus/{key}/compra/exports/{n}.json' for n in range(1,21)]
  files += [json.loads((ROOT/f'datos/compra/{key}.json').read_text())['imagen']]
 failures=[]
 for name in files:
  local=(ROOT/name).read_bytes()
  try:
   request=urllib.request.Request(SITE+name+'?revision='+hashlib.sha256(local).hexdigest(),headers={'Cache-Control':'no-cache','User-Agent':'MiruRecetas-Compra-Verification'})
   with urllib.request.urlopen(request,timeout=25) as response:
    remote=response.read();mime=response.headers.get('Content-Type','');status=response.status
   expected='json' if name.endswith('.json') else 'text/html' if name.endswith('.html') else 'image/'
   if status!=200 or expected not in mime:raise ValueError('HTTP o MIME incorrecto')
   if remote!=local:raise ValueError('Bytes de otra revisión')
   if name.endswith('.json'):json.loads(remote)
  except (urllib.error.URLError,ValueError) as ex:failures.append((name,str(ex)))
 if failures:raise ValueError(str(failures))
 print('Compra: HTTP anónimo, MIME y bytes verificados en',len(files),'archivos (20 selecciones e imagen).')
if __name__=='__main__':
 for attempt in range(24):
  try:verify();break
  except ValueError as ex:
   if attempt==23:raise
   print('Esperando publicación de compra:',str(ex)[:500],flush=True);time.sleep(10)
