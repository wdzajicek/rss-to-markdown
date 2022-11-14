const fs = require('fs');
const colors = require('colors'); // Colored console output
const { cleanContent } = require('./helpers/cleanContent'); // transforms strings to desired format
let Parser = require('rss-parser');
let parser = new Parser({
  timeout: 100000
});
// Configure this object to set the source file and destination path
const config = {
  input: {
    source: 'update-articles_2017-2022.xml',
  },
  output: {
    path: './dist/update',
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

function processFeed(feed) {
  feed.items.forEach((item) => {
    const { title, link, pubDate, author, content, guid, isoDate } = item; // unpack the parts of each feed item
    const cleanTitle = title.replace(/(")/g, `\\$1`).trim(); // Escape any quotes in the title
    const clean = cleanContent(content); // Modifies <img> elements in the feed
    // for creating a proper Jekyll post name: `YEAR-MONTH-DAY-TITLE.md`
    const d = new Date(pubDate);
    const month = ((d.getMonth() + 1) <= 9) ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
    const day = (d.getDate() <= 9) ? `0${d.getDate()}` : d.getDate();
    const year = d.getFullYear();
    // construct our file content
    const fileArray = [
      '---', // YAML front-matter start
      `\ntitle: "${cleanTitle}"`,
      `\nlink: ${link}`,
      `\nauthor: ${author}`,
      `\npublish_date: ${pubDate}`,
      `\nguid: ${guid}`,
      `\nisoDate: ${isoDate}`,
      `\n---`, // YAML front-matter end
      `\n`,
      `\n${clean}`
    ];

    const fileContent = fileArray.join('');
    const file = title.replace(/[^a-zA-z0-9\s]/g, '');
    const filename = file.trim().replace(/\s/g, '-').toLowerCase();
    const postname = `${year}-${month}-${day}-${filename.replace(/--/g, '-')}`;

    createFolders(config.output.path, postname, fileContent);
  });
}

function parseFeed(data) {
  parser.parseString(data, (err, feed) => {
    if (err) throw err;
    console.log(`${colors.info('[PARSED FEED]')}: ${feed.title}`);
    console.log(`${colors.info('[PROCESSING FEED ITEMS]')}...`);
    processFeed(feed);
  });
}

function rssToMarkdown(source) {
  fs.readFile(`./src/${source}`, 'utf8', (err, data) => {
    if (err) throw err;
    parseFeed(data);
  });
}

rssToMarkdown(config.input.source);
