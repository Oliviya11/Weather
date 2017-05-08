var fs = require('fs');
var ejs = require('ejs');

exports.ClothCard = ejs.compile(fs.readFileSync('./Frontend/templates/ClothCard.ejs', "utf8"));