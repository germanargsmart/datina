import pathlib,re,sys,shutil
S=pathlib.Path(sys.argv[1]); h=pathlib.Path("sitio/rutas.html").read_text(encoding="utf8")
i=h.index('<section class="tema herramienta" id="rutas"'); j=h.index("</section>",i)
# la seccion tiene secciones adentro: buscar el cierre balanceado
n=0
for m in re.finditer(r"<section\b|</section>",h[i:]):
    n+=1 if m.group(0)!="</section>" else -1
    if n==0: j=i+m.end(); break
h=h[:i]+(S/"seccion.html").read_text(encoding="utf8")+h[j:]
h=h.replace("</head>","<style>"+(S/"mudanzas.css").read_text(encoding="utf8")+"</style></head>",1).replace("Rutas comerciales","Mudanzas y población")
pathlib.Path("sitio/mudanzas.html").write_text(h,encoding="utf8",newline="\n"); shutil.copy("scripts/mudanzas.js","sitio/mudanzas.js")
print(re.findall(r'<script[^>]*>',h)[-8:])
