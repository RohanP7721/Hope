# Builds guide/index.html from the template, embedding the current code for copy-paste.
import html, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
code = (root / 'apps-script/Code.gs').read_text()
dash = (root / 'apps-script/Dashboard.html').read_text()
t = (root / 'guide/guide.template.html').read_text()
prev = lambda s: html.escape('\n'.join(s.splitlines()[:8]))
out = (t.replace('{{CODE_GS}}', html.escape(code, quote=False)).replace('{{DASH}}', html.escape(dash, quote=False))
        .replace('{{CODE_PREVIEW}}', prev(code)).replace('{{DASH_PREVIEW}}', prev(dash))
        .replace('{{CODE_LINES}}', str(len(code.splitlines()))).replace('{{DASH_LINES}}', str(len(dash.splitlines()))))
(root / 'guide/index.html').write_text(out)
print('ok', len(out))
