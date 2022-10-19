const regex = /<img alt=("[^"]*") src="([^"]+)"[^>]+>/g;

function replacer(match, alt, src) {
  const img = `<img alt=${alt} src="/assets/img/placeholder.jpg" data-src="${src}">`;
  return img;
}

exports.cleanContent = string => {
  const clean = string.replace(regex, replacer);
  return clean;
}
