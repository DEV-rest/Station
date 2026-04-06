const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const BUILD_DIR_NAME = process.env.BUILD_DIR || 'build';
const BUILD = path.join(ROOT, BUILD_DIR_NAME);

function ensureDir(p){if(!fs.existsSync(p))fs.mkdirSync(p,{recursive:true})}
ensureDir(BUILD);

function minifyHtml(html){
  const preserved = [];
  const tokenized = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, block => {
    preserved.push(block);
    return `___HTML_BLOCK_${preserved.length - 1}___`;
  });

  const compact = tokenized
    .replace(/<!--(?!\[if[\s\S]*?\]>)[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return compact.replace(/___HTML_BLOCK_(\d+)___/g, (_, index) => preserved[Number(index)]);
}

function copyFileSafely(src, dest){
  try{
    fs.copyFileSync(src, dest);
  }catch(err){
    if(err && err.code === 'EPERM'){
      console.warn(`Skipped locked build file: ${path.basename(dest)}`);
      return;
    }
    throw err;
  }
}

// copy images
function copyFolder(src, dest){
  ensureDir(dest);
  const files = fs.readdirSync(src);
  for(const f of files){
    const s = path.join(src,f), d = path.join(dest,f);
    copyFileSafely(s, d);
  }
}

copyFolder(path.join(ROOT,'IMG'), path.join(BUILD,'IMG'));

// copy minified assets
ensureDir(path.join(BUILD,'css'));
ensureDir(path.join(BUILD,'js'));
if(fs.existsSync(path.join(ROOT,'css','style.min.css'))){
  copyFileSafely(path.join(ROOT,'css','style.min.css'), path.join(BUILD,'css','style.min.css'));
}
if(fs.existsSync(path.join(ROOT,'js','main.min.js'))){
  copyFileSafely(path.join(ROOT,'js','main.min.js'), path.join(BUILD,'js','main.min.js'));
}

// create build index.html by swapping to minified files when present
let html = fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
html = html.replace(/css\/style.css/g, fs.existsSync(path.join(ROOT,'css','style.min.css')) ? 'css/style.min.css' : 'css/style.css');
html = html.replace(/js\/main.js/g, fs.existsSync(path.join(ROOT,'js','main.min.js')) ? 'js/main.min.js' : 'js/main.js');
html = minifyHtml(html);
try{
  fs.writeFileSync(path.join(BUILD,'index.html'), html, 'utf8');
}catch(err){
  if(err && err.code === 'EPERM'){
    console.warn('Skipped locked build file: index.html');
  }else{
    throw err;
  }
}

console.log(`Build complete. Files in ./${BUILD_DIR_NAME}`);
