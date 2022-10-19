# RSS to Markdown

-----

## Contents

- [RSS to Markdown](#rss-to-markdown)
  - [Contents](#contents)
  - [Overview](#overview)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Notes](#notes)

-----

## Overview

A simple project for parsing an RSS feed into markdown files &mdash; one for each feed item.

Each markdown file is named using the Jekyll post naming convention and contains valid YAML front-matter.

This project has minor dependencies (`rss-parser` and `colors`.)

-----

## Prerequisites

- Node.js or [NVM](https://github.com/nvm-sh/nvm)

This project was built using nodejs version `14.5.4`.

If you use NVM (Node Version Manager) you can use this projects' `.nvmrc` file by running `nvm use` (while in the project directory.)

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
   3. Run the main file (`./index.js`):
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
