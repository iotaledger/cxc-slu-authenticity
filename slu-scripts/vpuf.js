const fs = require('fs');
const cryptoJs = require('crypto-js');

exports.createKey= (filePath) => {
    const seed = fs.readFileSync(filePath, 'utf-8');
    const key = cryptoJs.SHA256(seed).toString();
    return key;
}
exports.encrypt = (filePath, key) => {
    const data = fs.readFileSync(filePath, 'utf-8');
    var encryptedData = cryptoJs.AES.encrypt(data, key).toString();
    return encryptedData;
}
exports.decrypt = (encrypted, key) => {
    var decryptedData = cryptoJs.AES.decrypt(encrypted, key).toString(cryptoJs.enc.Utf8);
    return decryptedData;
}




