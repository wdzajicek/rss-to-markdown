const fs = require('fs');
const { cleanContent } = require('./helpers/cleanContent');
let Parser = require('rss-parser');
let parser = new Parser({
  timeout: 100000
});

const config = {
  input: {
    source: 'faculty_campus-news.xml',
  },
  output: {
    path: './dist/faculty'
  }
}

fs.readFile(`./src/${config.input.source}`, 'utf8', (err, data) => {
  if (err) throw err;
  parser.parseString(data, (err, feed) => {
    if (err) throw err;
    console.log(`[PARSED FEED]: ${feed.title}`);
    console.log(`[PROCESSING FEED ITEMS]...`);
    feed.items.forEach((item, i) => {
      const { title, link, pubDate, author, content, guid, isoDate } = item; // unpack the parts of each feed item
      const cleanTitle = title.replace(/(")/g, `\\$1`); // Escape any quotes in the title
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
      const postname = `${year}-${month}-${day}-${filename}`;

      fs.mkdir(config.output.path, { recursive: true }, (err) => {
        if (err) throw err;
        fs.writeFile(`${config.output.path}/${postname}.md`, fileContent, (err) => {
          if (err) throw err;
          console.log(`[WROTE FILE]: ${config.output.path}/${postname}.md`);
        });
      });

    });
  });
});
