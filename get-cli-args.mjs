import { info } from './color-console.mjs';

const helpMsg = cmd => console.log(
  info(`
usage: npm run ${cmd} -- [options]
  options:
    -o, --output        Specify the output folder to save files to  [string]         [required]
    -d, --dir-prefix    Specify directory prefix for output folder  [string]  [default: "dist"]`
  )
);

function findArgs(args, argAssignmentRegex, argRegex) {
  for (const [i, arg] of args.entries()) {
    const assignmentMatch = arg.match(argAssignmentRegex);
    const match = arg.match(argRegex);

    if (assignmentMatch) {
      return assignmentMatch[1];
    }
    if (match) {
      return args[i + 1];
    }
  }
  return null;
}

const npmCommand = process.env.npm_lifecycle_event;

if (process.argv.length == 2) {
  console.error('Expected at least one argument!');
  helpMsg(npmCommand);
  process.exit(1);
}

const args = process.argv.slice(2);
const output = findArgs(args, /^(?:--output|-o)=(.+)$/, /^--output|-o$/);

if (
  args.indexOf('--help') !== -1 ||
  args.indexOf('-h') !== -1
) {
  helpMsg(npmCommand);
  process.exit(0);
}

console.log(`[output]: ${output}`);

if (output === null) {
  console.error('The `--output` (or `-o`) argument is required!');
  helpMsg(npmCommand);
  process.exit(1);
}

if (output === undefined) {
  console.error('The `--output` (or `-o`) argument cannot be empty!');
  helpMsg(npmCommand);
  process.exit(1);
}

const prefix = findArgs(args, /^(?:--dir-prefix|-d)=(.+)$/, /^--dir-prefix|-d$/);

if (prefix === undefined) {
  console.error('The `--dir-prefix` (or `-d`) argument should not be empty!');
  helpMsg(npmCommand);
  process.exit(1);
}

const dirPrefix = (prefix === null) ? 'dist' : prefix;
const folder = `./${dirPrefix}/${output}`;

console.log(`[dir-prefix]: ${dirPrefix}`);
console.log(`\nCreating files in "${folder}"\n`);

export default folder;
