

var APPID ="009b33a305b6cd775a3e5633569ca1c7";
var  temp;
var loc;
var icon;
var humitidy;

function updateByZip(myid) {
    var url ="http://api.openweathermap.org/data/2.5/forecast?" + "id=" + myid + "&APPID="
    + APPID;
    sendRequest(url);
}
function sendRequest(url) {
    var xml = new XMLHttpRequest();
    xml.onreadystatechange = function(){
        if (xml.readyState == 4 && xml.status == 200) {
            var data = JSON.parse(xml.responseText);
            console.log(data);
           
        }
    };
    xml.open("GET", url, true);
    xml.send();
}
function update(weather) {
    humitidy.innerHTML = weather.humitidy;
    loc.innerHTML = weather.loc;
    temp.innerHTML = weather.temp;
}

window.onload = function() {
    temp = document.getElementById("temp");
    loc = document.getElementById("loc");
    icon = document.getElementById("icon");
    humitidy = document.getElementById("humitidy");
    
    updateByZip(524901);
}
