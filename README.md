# TOBACCO STATION — Static Site

This repo contains a mobile-first static site for TOBACCO STATION Smoke Shop. It includes an age verification gate, SEO meta tags, JSON-LD structured data, and a small build pipeline to minify assets.

Quick start

1. Install dependencies (Node.js required):

```bash
npm install
```

2. Create a production build (this will produce `./build`):

```bash
npm run build
```

The `build` folder is ready to upload to Namecheap (File Manager) or deploy via FTP. Upload the entire `build/` directory contents into the public HTML folder for your domain.

Notes
- Images are referenced from the `IMG/` directory — keep those files in `build/IMG` or point to correct CDN URLs.
- The age verification stores a local flag in `localStorage` when "Remember me" is checked.
- Edit `index.html` to adjust copy, hours, and phone number.
