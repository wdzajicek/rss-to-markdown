const feed = require('./src/update.json');
const fs = require('fs');
const colors = require('colors'); // Colored console output
// const { cleanContent } = require('./helpers/cleanContent'); // transforms strings to desired format
// let Parser = require('rss-parser');
// const FEED_URL = 'https://update.kcc.edu/feed/update.json';
const IMAGE_BASEURL = 'https://update.kcc.edu/feed/images/';
// let parser = new Parser({
//   timeout: 100000
// });
// Configure this object to set the source file and destination path
const config = {
  input: {
    source: feed,
  },
  output: {
    path: './dist/archive-oct',
  }
}
// Setup a theme for colors (colored console output)
colors.setTheme({
  info: 'brightCyan',
  warn: 'yellow',
  success: 'green',
  debug: 'cyan',
  error: 'red'
});

function createFiles(path, postname, content) {
  fs.writeFile(`${path}/${postname}.md`, content, (err) => {
    if (err) throw err;
    console.log(`${colors.info('[WROTE FILE]')}: ${path}/${postname}.md`);
  });
}

function createFolders(path, postname, content) {
  fs.mkdir(path, { recursive: true }, (err) => {
    if (err) throw err;
    createFiles(path, postname, content)
  });
}

const zeroDateTime = date => date.setHours(0, 0, 0, 0);
const changeImageLocation = str => {
  return (
    str
      .replace(
        /src="\/sites\/updateeditor\/SiteAssets\/Lists\/Update%20News%20articles\/AllItems\/([^"]+)"/g,
        `src="https://update.kcc.edu/feed/images/$1"`
      )
  )
}
const changePDFLocation = str => {
  return (
    str
      .replace(
        /href="\/&#58;b&#58;\/r\/sites\/updateeditor\/Shared%20Documents\/([^"]+)"/g,
        `href="https://cdn.kcc.edu/update-documents/$1"`
      )
  )
}
const clean = str => {
  return (
    str
      .replace(
        /&#58;/g,
        ':'
      )
      .replace(
        /’/g,
        `'`
      )
  );
}

function init(feed) {
  feed.value.forEach(item => {
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
      const cleanTitle = title.trim().replace(/(")/g, `\\$1`);
      const cleanDesc = (desc !== null) ? desc.replace(/(\r\n|\r|\n)/g, ' ') : desc;
      const month = ((d.getMonth() + 1) <= 9) ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
      const day = (d.getDate() <= 9) ? `0${d.getDate()}` : d.getDate();
      const year = d.getFullYear();
      const e_month = ((e.getMonth() + 1) <= 9) ? `0${e.getMonth() + 1}` : e.getMonth() + 1;
      const e_day = (e.getDate() <= 9) ? `0${e.getDate()}` : e.getDate();
      const e_year = e.getFullYear();

      const thumbnail = (thumb !== null) ? `${IMAGE_BASEURL}${JSON.parse(thumb).fileName.replace(/\s/g, '%20')}` : `${IMAGE_BASEURL}kcc-blue-100x100.svg`;
      const alt = (image_alt === null) ? null : image_alt.replace(/"/g, "'");
      const img = (image === null) ? null : `${IMAGE_BASEURL}${JSON.parse(image).fileName.replace(/\s/g, '%20')}`;
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
      const postname = `${year}-${month}-${day}-${filename.replace(/--/g, '-')}`;

      createFolders(config.output.path, postname, fileContent);
    }
  })
}

init(config.input.source);
