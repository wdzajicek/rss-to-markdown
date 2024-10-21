import folder from './get-cli-args.mjs';
import { info } from './color-console.mjs';
import { mkdir, writeFile } from 'node:fs';

const FEED_URL = 'https://update.kcc.edu/feed/update.json'; // Update JSON feed is FTP'd to this location
const IMAGE_BASEURL = 'https://update.kcc.edu/feed/images/'; // Images are FTP'd to this folder

async function fetchFeed(url) {
  const res = await fetch(url);
  const json = res.json();

  return json;
}

// Configure this object to set the source file and destination path
const config = {
  output: {
    path: folder,
  }
}

function createFiles(path, postname, content) {
  writeFile(`${path}/${postname}.md`, content, (err) => {
    if (err) throw err;
    console.log(`${info('[WROTE FILE]:')} ${path}/${postname}.md`);
  });
}

function createFolders(path, postname, content) {
  mkdir(path, { recursive: true }, (err) => {
    if (err) throw err;
    createFiles(path, postname, content);
  });
}

const zeroDateTime = date => date.setHours(0, 0, 0, 0);

// Modify image locations in the articles' content
const changeImageLocation = str => {
  return (
    str
      .replace(
        // Images uploaded in article content will be in this format:
        /src="\/sites\/updateeditor\/SiteAssets\/Lists\/Update%20News%20articles\/AllItems\/([^"]+)"/g,
        `src="https://update.kcc.edu/feed/images/$1"`
      )
  )
}

// Change URL's to PDF files in the articles' content. PDF files for articles are sent to cdn.kcc.edu/update-documents/ via FTP
const changePDFLocation = str => {
  return (
    str
      .replace(
        // SharePoint PDF URL's will be in this format:
        /href="\/&#58;b&#58;\/r\/sites\/updateeditor\/Shared%20Documents\/([^"]+)"/g,
        (_m, capt) => {
          const url = new URL(`https://cdn.kcc.edu/update-documents/${capt}`);

          url.search = '';
          return `href="${url}"`;
        }
      )
  )
}

// Adjust article content:
const clean = str => {
  return (
    str
      .replace(
        // SharePoint replaces colons with their HTML entity which doesn't work for images and links
        /&#58;/g,
        ':'
    )
      // replace smart/curly apostrophes
      .replace(
        /’/g,
        `'`
      )
  );
}

function init(feed) {
  // Feed has a main "value" key where everything is stored
  feed.value.forEach(item => { // each "item" object represents an update article
    const {
      Title: title,
      Article_x0020_Description: desc,
      Article_x0020_Category: cat,
      Author0: auth,
      Article_x0020_Thumbnail: thumb,
      Article_x0020_Image: image,
      Article_x0020_Image_x0020_alt_x0: image_alt,
      Article_x0020_Content: content,
      Article_x0020_Date: date,
      Expires: expires,
    } = item;
    const d = new Date(date);
    const e = new Date(expires);
    const now = new Date();

    zeroDateTime(d);
    zeroDateTime(e);
    zeroDateTime(now);
    if (!now <= e) {
      // Articles here are old (expired)
      const cleanTitle = title.trim().replace(/(")/g, `\\$1`); // unescaped quotes would result in invalid YAML
      const cleanDesc = (desc !== null) ? desc.replace(/(\r\n|\r|\n)/g, ' ') : desc;
      const month = ((d.getMonth() + 1) <= 9) ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
      const day = (d.getDate() <= 9) ? `0${d.getDate()}` : d.getDate();
      const year = d.getFullYear();
      const e_month = ((e.getMonth() + 1) <= 9) ? `0${e.getMonth() + 1}` : e.getMonth() + 1;
      const e_day = (e.getDate() <= 9) ? `0${e.getDate()}` : e.getDate();
      const e_year = e.getFullYear();

      // `thumbnail` will be set to an object by SharePoint (if not empty/null). Use the "fileName" key to create the URL to the image.
      const thumbnail = (thumb !== null) ? `${IMAGE_BASEURL}${JSON.parse(thumb).fileName.replace(/\s/g, '%20')}` : `${IMAGE_BASEURL}kcc-blue-100x100.svg`;
      const alt = (image_alt === null) ? null : image_alt.replace(/"/g, "'");
      // `image` will be set to an object by SharePoint (if not empty/null). Use the "fileName" key to create the URL to the image.
      const img = (image === null) ? null : `${IMAGE_BASEURL}${JSON.parse(image).fileName.replace(/\s/g, '%20')}`;
      // Modify image and PDF file locations in article content:
      const articleWithPDFs = changePDFLocation(content);
      const articleWithImages = changeImageLocation(articleWithPDFs);
      const cleanContent = clean(articleWithImages);
      // construct our file content
      const fileArray = [
        '---', // YAML front-matter start
        `\ntitle: "${cleanTitle}"`,
        `\ndescription: ${(!!cleanDesc && cleanDesc.search(/:/g) !== -1) ? `"${cleanDesc}"`: cleanDesc}`,
        `\nauthor: ${auth}`,
        `\narticle_category: ${cat}`, // Do NOT name this field "category" as Jekyll gives category special treatment in posts
        `\ndate: ${year}-${month}-${day}T08:00:00Z`,
        `\nexpires: ${e_year}-${e_month}-${e_day}T08:00:00Z`,
        `\nthumbnail: ${thumbnail}`,
        `\narticle_image: ${img}`,
        `\narticle_image_alt: ${(!!alt && alt.search(/:/g) !== -1) ? `"${alt}"`: alt}`,
        `\n---`, // YAML front-matter end
        `\n`,
        `\n${cleanContent}`
      ];

      const fileContent = fileArray.join('');
      const file = title.replace(/[^a-zA-z0-9\s]/g, '');
      const filename = file.trim().replace(/\s/g, '-').toLowerCase();
      // Follow Jekyll post naming convention:
      const postname = `${year}-${month}-${day}-${filename.replace(/--/g, '-')}`;

      createFolders(config.output.path, postname, fileContent);
    }
  })
}

fetchFeed(FEED_URL).then(json => {
  init(json);
});
