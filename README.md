# RSS to Markdown

> 
> Transform a JSON feed into Jekyll posts!!
> 

-----

## Contents

<!-- no toc -->
- [RSS to Markdown](#rss-to-markdown)
  - [Contents](#contents)
  - [Overview](#overview)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Old Instructions](#old-instructions)

-----

## Overview

This is a simple Node.js project for parsing a JSON feed into markdown files &mdash; one for each feed item.

Each markdown file is named using the Jekyll post naming convention and contains valid YAML front-matter.

-----

## Prerequisites

- Node.js or [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm)

Use the Nodejs version specified in `.nvmrc`.

If you use NVM you can use this projects' `.nvmrc` file by running `nvm use` (while in the project directory.)

-----

## Installation

```bash
git clone rss-to-markdown
cd rss-to-markdown
```

-----

## Usage

Run the main script using npm:

```bash
npm run process-feed --  --output=my-folder ## Generates the markdown files in ./dist/my-folder

# The following works too:
npm run process-feed --  --output my-folder
npm run process-feed --  -o=my-folder
npm run process-feed --  -o my-folder
```

You can optionally specify a parent directory to build the files into using the `--dir-parent` option:

```bash
npm run process-feed --  --output=my-folder --dir-parent=my-parent ## Generates files in ./my-parent/my-folder

# The following also works:
npm run process-feed --  --output=my-folder --dir-parent my-parent
npm run process-feed --  --output=my-folder -d=my-parent
npm run process-feed --  --output=my-folder -d my-parent
```

View the help message using `-h` or `--help`:

```bash
npm run process-feed -- -h
# Or
npm run process-feed -- --help

usage: npm run process-update -- [options]
  options:
    -o, --output        Specify the output folder to save files to  [string]         [required]
    -d, --dir-prefix    Specify directory prefix for output folder  [string]  [default: "dist"]
```

If you need to change the URL to the feed, or where images are kept, adjust the `FEED_URL` and
`IMAGE_BASEURL` constants in `./process-update.mjs`.

-----

## Old Instructions

<details>
<summary>It is not recommended that you use the old scripts/instructions</summary>

### Overview

This is a simple Node.js project for parsing an RSS feed into markdown files &mdash; one for each feed item.

Each markdown file is named using the Jekyll post naming convention and contains valid YAML front-matter.

***Note:** `colors` is not recommended as it had previous security issues and needs to be locked to version `1.4.0` including in your `package.json` file (use `1.4.0` and not `^1.4.0`).*

This project has minimal dependencies:

- ~~`rss-parser` to parse a string of XML (our RSS feed) into a JavaScript Object.~~
- ~~`colors` to create more aesthetically pleasing console output.~~

There's also a folder `./helpers/` with a module `cleanContent.js` used for cleaning up less-than-ideal HTML image elements. See [`cleanContent` Helper](#cleancontent-helper) for more information.

-----

### Prerequisites

- Node.js or [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm)

This project was built using nodejs version `14.5.4`.

If you use NVM you can use this projects' `.nvmrc` file by running `nvm use` (while in the project directory.)

-----

### Installation

```bash
git clone rss-to-markdown
cd rss-to-markdown
npm i # or `npm install` if you like typing more
```

-----

### Usage

1. Place XML feed file in `./src` folder
2. In `./index.js` file:
   1.  Update `config.input.source` to match filename of your XML feed
   2.  Set `config.output.path` to the path you want you markdown files built (i.e. `./dist/my-feed`)
   3. Run the main file (`./index.js`) using:
      ```bash
      npm start
      ```

The configuration object is found towards the top of `./index.js`:

```javascript
// index.js

const config = {
  input: {
    source: 'my-rss-feed.xml' // ./src/my-rss-feed.xml
  },
  output: {
    path: './dist/my-feed'
  }
}
```

#### Notes

**Existing files will be overwritten!** \
If the same file exists (in the output directory) it will be overwritten by running `npm start`.

If the output folder(s) specified (`config.output.path`) does not exist, it will be created &mdash; including any subfolders.

-----

### Customize File Contents

The contents of each file is defined inside `index.js` &mdash; within a function named `processFeed()`.


The array `fileArray` becomes the contents for each file:
```javascript
function processFeed(feed) {
  feed.items.forEach((item) => {
    const { title, link, pubDate, author, content, guid, isoDate } = item;
    /* JS omitted ... */

    // This array becomes the markdown file contents:
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

    /* JS omitted ... */

  });
}
```

-----

### `cleanContent` Helper

The `./helper/` folder contains a `cleanContent.js` module for cleaning up html coming from the feed.

Use the `./helper/` directory for any helper modules/function and import them into `index.js`

The existing helper functions were created for cleaning up old SharePoint code. Specifically, to cleanup strings of HTML containing image elements and alter their src attributes to point to a new folder location (`/uploads/`.)

The image elements coming from the feed I am processing vary.
Some have the `src` followed by the `alt` attribute while others have the reversed order.
Some images have `class` attributes with old/unneeded sharepoint classes.
There are also images with `style` attributes that need removing.


```javascript
import {cleanContent} from './helpers/cleanContent';

cleanImageString = cleanContent(stringWithHTMLImageElements);
```

It will take a string of multiple HTML images (within other HTML elements too) and clean them all up:
```js
import {cleanContent} from './helpers/cleanContent';

const html = 
`<img class="ms-old-class" src="some-old-path/image.jpg" alt="alt text" />
<img src="some-old-path/image.jpg" alt="alt text" />
<img alt="" src="some-old-path/image.jpg" />
<img class="ms-old-class" src="some-old-path/image.jpg" alt="alt text" style="border: none;" />`;

const cleanHTML = cleanContent(html);

console.log(cleanHTML);
// <img class="img-fluid" src="/uploads/image.jpg" alt="alt text">
// <img class="img-fluid" src="/uploads/image.jpg" alt="alt text">
// <img class="img-fluid" alt="" src="/uploads/image.jpg">
// <img class="img-fluid" src="/uploads/image.jpg" alt="alt text">
```

</details>
