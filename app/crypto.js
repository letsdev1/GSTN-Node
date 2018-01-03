var crypto = require('crypto');
var path = require("path");
var fs = require("fs");
var context = require('../app/shared/shared.context')
var helper = require('../app/helper')

module.exports={


    //Developer: Vikas B
    //Date: 9/18/2017  
    //Purpose: This encryption key will use the path of the public key file and will encrypt the text to be used for GSTN upload.

            encryptWithPublicKey (toEncrypt, publicKeyPath) {
                var buffer = new Buffer(toEncrypt, 'utf8');
                var publicKey = fs.readFileSync(publicKeyPath, "utf8");

                var RsaPublicKey = {
                    key: publicKey,
                    padding:1
                }

                

                var encrypted = crypto.publicEncrypt(RsaPublicKey, buffer);

                return encrypted.toString("base64");
            },


    //Developer: Vikas B
    //Date: 9/19/2017
    //Purpose: This method will take the string, convert it into buffer and will forward the encryptWithkey method with the Application Key
            encrypt(value){
                return this.encryptWithkey(new Buffer(value,'utf8'), helper.Constants.AppKey);
            },
            

    //Developer: Vikas B
    //Date:  9/19/2017
    //Purpose: This function will take the buffered value to be encrypted and the key to be used for encryption. It will use the default algorithm of AES 256 bits with ecb format. 

            encryptWithkey(buffer, key){
                var cipher = crypto.createCipheriv('aes-256-ecb',key,new Buffer(0));
                var crypted = cipher.update(buffer,'utf8','base64');
                crypted = crypted+ cipher.final('base64');
                console.log('printed: ', crypted);
                return crypted;
            },


}