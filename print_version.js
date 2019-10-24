const fs = require('fs');
const NodeRSA = require('node-rsa');

const version = process.env.CI_COMMIT_SHA;
const file = './dist_electron/dist_vue.asar';

if (!fs.existsSync(file)) {
  console.log(`${file} not found!`);
  return;
}

let fileBuf = fs.readFileSync(file);

const key = new NodeRSA();
key.importKey(process.env.SIGN_KEY, 'pkcs8-private-pem');
let signHash = key.sign(fileBuf, 'base64', 'buffer');

let writeObj = {
  version: version,
  hash: signHash,
};

fs.writeFileSync("./dist_electron/version.json", JSON.stringify(writeObj));

console.log(`${version} created!`);
