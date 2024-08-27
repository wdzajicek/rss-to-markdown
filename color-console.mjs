const cyanControlChar = '\x1b[36m';
const colorResetControlChar = '\x1b[0m';

function info(text) {
  return `${cyanControlChar}${text}${colorResetControlChar}`;
}

export { info };
