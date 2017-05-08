var Clothes_List = require('./data/Clothes_List');
var APPID ="009b33a305b6cd775a3e5633569ca1c7";

exports.getClothesList = function(req, res) {
    res.send(Clothes_List);
};

exports.getAPPID = function(req, res){
    res.send(APPID);
};



