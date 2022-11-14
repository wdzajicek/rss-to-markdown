/**
 * 
 * @export cleanContent - cleans up a string of HTML containing image elements
 *  which have unneeded style and class attributes. It also alters image src 
 *  attribute values to extract the filename and extension of the image and 
 *  prepend it with a new directory name.
 * 
 * Given this example string: '<img class="ms-bad-class" src="/bad-location/image.jpg" alt="alt text" />'
 *  cleanContent will return: `<img class="img-fluid" src="/uploads/image.jpg" alt="alt text">`
 * 
 */
const imageRegex = /<img.+((alt|src)="[^"]*")\s((alt|src)="[^"]*")[^>]*>/g;
const altTextRegex = /alt="[^"]*"/g;
const colonRegex = /&#58;/g;

// Extract image filename + extension from image sources
// and alter the image source value (prepend w/ /uploads/)
function processSrc(attr) {
  const src = attr.replace(/src="([^"]+)"/g, `$1`);
  const newSrc = src.replace(/^(http:\/\/|\/).+\/(.+\.(jpg|png|gif|svg))/g, `/uploads/$2`);
  return `src="${newSrc}"`;
}

function processAttribute(attr) {
  const attributeIsAltText = (attr.search(altTextRegex) !== -1);
  
  return (attributeIsAltText) ? attr : processSrc(attr);
}

// Has the effect of stripping out any style and other attributes.
// since we are returning a new and minimal HTML5 image as a string
function imageReplacer(match, attrAndVal1, attr1, attrAndVal2, attr2) {
  let [clean1, clean2] = [processAttribute(attrAndVal1), processAttribute(attrAndVal2)];
  
  return `<img class="img-fluid" ${clean1} ${clean2}>`;
}

exports.cleanContent = string => {
  const processColons = string.replace(colonRegex, ':');
  const clean = processColons.replace(imageRegex, imageReplacer);
  return clean;
}
