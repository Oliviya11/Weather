var API = require('../API');
var APPID ="009b33a305b6cd775a3e5633569ca1c7";
var currentForc = [];
var items = [];
var list = $("#cloth-weather-list");
var errorCounter=0;
var mycurday = 0;

var it = '<div class="col-xs-1-5 col-md-1-5 col-lg-1-5 item"> \
            <div class="thumbnail style-card"> \
                <div class="weather"> \
                    <div class="row"> \
                    <div class="col-xs-8 col-md-8 col-lg-8 center"> \
                        <div class="weekday"></div> \
                        <div class="time"></div> \
                     </div>\
                    <div class="col-xs-4 col-md-4 col-lg-4"><img class="iconWeather" src=""></div> \
                    <div class="col-xs-12 col-md-12 col-lg-12"> \
                    <div class="col-xs-6 col-md-6 col-lg-6 masterTemp tempm1"> \
                         <span class="glyphicon glyphicon-tint hum"><span class="humText"></span></span> \
                    </div>\
                    <div class="col-xs-6 col-md-6 col-lg-6 masterTemp tempm2"> \
                        <span class="temp tempmin"></span><span class="temp2">&#176</span> \
                    </div> \
                    </div> \
                    </div> \
                </div> \
                     <img class="icon" src=""> \
                       <div class="mainInfo"></div> \
                 <div class="lowerWeather"></div> \
             </div> \
          </div>';




var ClothesList;
var counter = 0;
var mainCounter=0;
var nameInUp;
var Storage = require('../Basil');
var DATA;


function updateByZip(mycity) {
      API.getAPPID (function(err, APPID){
          if (err){}
          else {
       var url ="http://api.openweathermap.org/data/2.5/forecast?" + "q="+mycity+ "&units=metric&lang=uk&APPID="
       + APPID;
       sendRequest(url);
          }
      });
}
function sendRequest(url) {
    var xml = new XMLHttpRequest();
    xml.onreadystatechange = function(){
        if (xml.readyState == 4 && xml.status == 200) {
            DATA = JSON.parse(xml.responseText);
            console.log(DATA);
            fillCityName(DATA.city.name);
            
             changeWeather(0);
            
            API.getClothesList (function(err, data){
                if (err) {
                    ClothesList = [];
                }
                else {
                     ClothesList = data;
                     ClothesList.shuffle(true);
                     createItems();
                     if (mainCounter==0) add();
                     else change();
                     mainCounter++;
                }
            });
            
        }
        
       if (xml.status==502){
           $( ".error" ).show( "fast" );
           $("#cityWord").text("");
       }
       else {
           $( ".error" ).hide( "fast" );
            $("#cityWord").text("Місто");
       }
       
       
       
    };
    xml.open("GET", url, true);
    xml.send();
    
}

function changeWeather(curday) {
  
    currentForc = [];
    var day = DATA.list[curday].dt_txt.substring(0, 11);
    var time = DATA.list[curday].dt_txt.substr(11, 2);
            var i = 0;
            addToForc(DATA.list[curday]);
            do {
                i++;
                if (i<DATA.list.length){
                var deltaTime = Number(DATA.list[i].dt_txt.substr(11, 2)) - Number(time);
                if (day != DATA.list[i].dt_txt.substring(0, 11) && (deltaTime == 3 || deltaTime == -21)) {
                   day = DATA.list[i].dt_txt.substring(0, 11);
                   time = DATA.list[i].dt_txt.substr(11, 2);
                   addToForc(DATA.list[i]);
                   counter++;
                }
                }
                else break;
            }while(counter!=4);
             
             counter = 0;
    if (ClothesList) {
        ClothesList.shuffle(true);
        createItems();
        change();
    }
}
function getWeather() {
    nameInUp = Storage.get('city');
    if (nameInUp) 
          updateByZip(nameInUp);
    else 
          updateByZip('Kiev');
}
function getAndChangeWeather() {
     
    nameInUp = Storage.get('city');
    if (nameInUp)    
       changeByTime(nameInUp);
    else 
       changeByTime('Kiev');
    
}
function  changeByTime(cityName){
   if (DATA)  var time = DATA.list[mycurday].dt_txt.substr(11, 2);
     if ( time = "00" ){
           updateByZip(cityName);
           mycurday == 0;
     }
     else 
          changeWeather(++mycurday);
}
function addToForc(data) {
   
    //console.log(numDay);
    var descr = data.weather[0].description;
    descr = descr.charAt(0).toUpperCase()+descr.substr(1)+".";
    currentForc.push({
        deta: data.dt_txt,
        temp: Math.round(data.main.temp),
       // tempmax: Math.round(data.main.temp_kf),
       // tempmin: Math.round(data.main.temp_min),
        pressure: "Атмосферний тиск: "+Math.round(data.main.pressure)+"(hPa).",
        humidity: Math.round(data.main.humidity)+"%",
        desc: descr,
        icon: "http://openweathermap.org/img/w/"+data.weather[0].icon+".png",
        clouds: "Хмарність: "+Math.round(data.clouds.all)+"%.",
        windspeed: "Швидкість вітру: "+Math.round(data.wind.speed)+"(м/с).",
        winddeg: "Напярмок вітру: "+findWindDirection(Math.round(data.wind.deg))+".",
        weekDay:  weekDay(data),
        time: data.dt_txt.substr(11, 5)
        
    });
   
}

function findWindDirection(deg){
    if (deg==0 || deg==360)
        return "Північний";
    if (deg>0 && deg<90) 
        return "Північно-східний";
    if (deg==90)
        return "Східний";
    if (deg > 90 && deg<180)
        return "Південно-східний";
    if (deg == 180)
        return "Східний";
    if (deg>180 && deg<270)
        return "Південно-західний";
    if (deg==270)
        return "Західний";
    if (deg>270 && deg<360 ) 
        return "Північно-західний";
}

function weekDay(data) {
     dateArr = data.dt_txt.substring(0,11).split("-");
     var d = new Date(Number(dateArr[0]), Number(dateArr[1]), Number(dateArr[2]));
     var numDay = d.getDay();
     var weekDay = 0;
     switch(numDay){
         case 0: 
             weekDay = "Четвер";
             break;
         case 1:
             weekDay = "П'ятниця";
             break;
         case 2: 
             weekDay = "Субота";
             break;
         case 3:
             weekDay = "Неділя";
             break;
         case 4:
             weekDay = "Понеділок";
             break;
         case 5:
             weekDay = "Вівторок";
             break;
         case 6:
             weekDay = "Середа";
             break;
         default:
             weekDay = null;
     }
    
    return weekDay;
}
function add() {
    
   /*
   $(".item").find(".weekday").text(items[0].weather.weekDay);
   $(".item").find(".humText").text(items[0].weather.humidity);
   $(".item").find(".tempmin").text(items[0].weather.temp);
   $(".item").find(".iconWeather").attr("src", items[0].weather.icon);
   $(".item").find(".icon").attr("src", items[0].img);
   $(".item").find(".lowerWeather").text(items[0].weather.pressure+" "+items[0].weather.clouds+" "+items[0].weather.windspeed+" "+items[0].weather.winddeg);
   $(".item").find(".mainInfo").text(items[0].weather.desc);
   */
    
   for (var i=0; i<currentForc.length && i<5; i++) {
    
      var node = $(it);
      // console.log(node);
      node.find(".weekday").text(items[i].weather.weekDay);
      node.find(".humText").text(items[i].weather.humidity);
      node.find(".tempmin").text(items[i].weather.temp);
      node.find(".iconWeather").attr("src", items[i].weather.icon);
      node.find(".icon").attr("src", items[i].img);
      node.find(".lowerWeather").text(items[i].weather.pressure+" "+items[i].weather.clouds+" "+items[i].weather.windspeed+" "+items[i].weather.winddeg);
      node.find(".mainInfo").text(items[i].weather.desc);
      node.find(".time").text(items[i].weather.time);
      list.append(node);
    }
    
    

}

function change() {
    
    var i = 0;
    $( ".item" ).each(function() {
          $( this ).find(".weekday").text(items[i].weather.weekDay);
          $( this ).find(".humText").text(items[i].weather.humidity);
          $( this ).find(".tempmin").text(items[i].weather.temp);
          $( this ).find(".iconWeather").attr("src", items[i].weather.icon);
          $( this ).find(".icon").attr("src", items[i].img);
          $( this ).find(".lowerWeather").text(items[i].weather.pressure+" "+items[i].weather.humidity+" "+items[i].weather.clouds+" "+items[i].weather.windspeed+" "+items[i].weather.winddeg);
          $( this ).find(".mainInfo").text(items[i].weather.desc);
          $( this ).find(".time").text(items[i].weather.time);
          i++;
          
    });
    
}

function Item(weather, img, id) {
    this.weather = weather;
    this.img = img;
    this.id = id;
}

function createItems() {
    items = [];
    for (var i=0; i< currentForc.length; i++) {
        var cloth = findCloth(currentForc[i].temp);
        //console.log(cloth);
        items[i] = new Item(currentForc[i],cloth.icon, cloth.id);
    }
}

function findCloth(temp) {
    for (var i=0; i<ClothesList.length; i++){
        if (ClothesList[i].mintemp <= temp && ClothesList[i].maxtemp >= temp && !isPresentInItems(ClothesList[i].id)) {
            return ClothesList[i];
        }
            
    }
}
function isPresentInItems(id){
    for (var i=0; i<items.length; i++){
        if (items[i].id == id) {
        //    console.log(true);
            return true;
        }
    }
    return false;
}
/* Array.shuffle( deep ) - перемешать элементы массива случайным образом
deep - необязательный аргумент логического типа, указывающий на то, 
       нужно ли рекурсивно обрабатывать вложенные массивы;
       по умолчанию false (не обрабатывать)
*/
Array.prototype.shuffle = function( b )
{
 var i = this.length, j, t;
 while( i ) 
 {
  j = Math.floor( ( i-- ) * Math.random() );
  t = b && typeof this[i].shuffle!=='undefined' ? this[i].shuffle() : this[i];
  this[i] = this[j];
  this[j] = t;
 }
 return this;
};

function start() {
     var now = new Date();
     var nowmin = now.getMinutes();
     var nowhours = now.getHours();
    // console.log(nowhours+" "+nowmin);
    var deltaT= deltaT = 2*60 - nowmin; 
    // console.log(deltaT);
     getWeather();
    setTimeout(makeTime, deltaT*60*1000);
   // setTimeout(makeTime, 5000);
     
      
}
function makeTime(){
    getAndChangeWeather();
    setInterval(getAndChangeWeather, 7200000);
  //  setInterval(getAndChangeWeather, 5000);
}

 $("#see").click(function(){
        nameInUp = $("#cityName").val();
        Storage.set('city', nameInUp);
 });
function fillCityName(name) {
    $("#mainCityName").text(name);
}
$(window).on('load', function () {
    var $preloader = $('#p_prldr'),
        $svg_anm   = $preloader.find('.svg_anm');
    $svg_anm.fadeOut();
    $preloader.delay(500).fadeOut('slow');
});

exports.start = start;