import glob, sys, os
from fontTools.ttLib import TTFont
from fontTools.merge import Merger
src, out = sys.argv[1], sys.argv[2]
tmp=[]
for f in sorted(glob.glob(os.path.join(src,sys.argv[3] if len(sys.argv)>3 else '*-400-normal.woff2'))):
    t=TTFont(f); t.flavor=None
    p=f.replace('.woff2','.ttf'); t.save(p); tmp.append(p)
m=Merger().merge(tmp)
m.save(out)
f=TTFont(out); print(out, 'glyphs', len(f.getGlyphOrder()), f['name'].getDebugName(1))
