/**
 * Created by chaika on 09.02.16.
 */
var API_URL = "http://localhost:5051";

function backendGet(url, callback) {
    $.ajax({
        url: API_URL + url,
        type: 'GET',
        success: function(data){
            callback(null, data);
        },
        error: function() {
            callback(new Error("Ajax Failed"));
        }
    })
}

function backendPost(url, data, callback) {
    $.ajax({
        url: API_URL + url,
        type: 'POST',
        contentType : 'application/json',
        data: JSON.stringify(data),
        success: function(data){
            callback(null, data);
        },
        error: function() {
            callback(new Error("Ajax Failed"));
        }
    })
}

exports.getClothesList = function(callback) {
    backendGet("/api/get-clothes-list", callback);
};
exports.getAPPID = function(callback){
    backendGet('/api/appid', callback);
};