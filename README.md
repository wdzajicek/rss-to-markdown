# RSS to Markdown

> 
> Transform an RSS feed into Jekyll posts!!
> 

Takes an RSS feed (as an XML file) and generates a Jekyll post for each feed entry.

-----

## Contents

- [RSS to Markdown](#rss-to-markdown)
  - [Contents](#contents)
  - [Overview](#overview)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Notes](#notes)
  - [Customize File Contents](#customize-file-contents)
  - [`cleanContent` Helper](#cleancontent-helper)

-----

## Overview

This is a simple Node.js project for parsing an RSS feed into markdown files &mdash; one for each feed item.

Each markdown file is named using the Jekyll post naming convention and contains valid YAML front-matter.

This project has minimal dependencies (`rss-parser` and `colors`):

- `rss-parser` to parse a string of XML (our RSS feed) into a JavaScript Object.
- `colors` to create more aesthetically pleasing console output.

There's also a folder `./helpers/` with a module `cleanContent.js` used for cleaning up less-than-ideal HTML image elements. See [`cleanContent` Helper](#cleancontent-helper) for more information.

-----

## Prerequisites

- Node.js or [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm)

This project was built using nodejs version `14.5.4`.

If you use NVM you can use this projects' `.nvmrc` file by running `nvm use` (while in the project directory.)

-----

## Installation

```bash
git clone rss-to-markdown
cd rss-to-markdown
npm i # or `npm install` if you like typing more
```

-----

## Usage

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

### Notes

**Existing files will be overwritten!** \
If the same file exists (in the output directory) it will be overwritten by running `npm start`.

If the output folder(s) specified (`config.output.path`) does not exist, it will be created &mdash; including any subfolders.

-----

## Customize File Contents

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

## `cleanContent` Helper

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
