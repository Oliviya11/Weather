(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
var basil = require('basil.js');
basil = new basil();

exports.get = function(key) {
    return basil.get(key);
};

exports.set = function(key, value) {
    return basil.set(key, value);
}

},{"basil.js":5}],3:[function(require,module,exports){
/**
 * Created by chaika on 25.01.16.
 */

$(function(){
   /*
    Clothes.check();
    */
    var Clothes = require('./style/Clothes');
    Clothes.start();
});



},{"./style/Clothes":4}],4:[function(require,module,exports){
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
},{"../API":1,"../Basil":2}],5:[function(require,module,exports){
(function () {
	// Basil
	var Basil = function (options) {
		return Basil.utils.extend({}, Basil.plugins, new Basil.Storage().init(options));
	};

	// Version
	Basil.version = '0.4.4';

	// Utils
	Basil.utils = {
		extend: function () {
			var destination = typeof arguments[0] === 'object' ? arguments[0] : {};
			for (var i = 1; i < arguments.length; i++) {
				if (arguments[i] && typeof arguments[i] === 'object')
					for (var property in arguments[i])
						destination[property] = arguments[i][property];
			}
			return destination;
		},
		each: function (obj, fnIterator, context) {
			if (this.isArray(obj)) {
				for (var i = 0; i < obj.length; i++)
					if (fnIterator.call(context, obj[i], i) === false) return;
			} else if (obj) {
				for (var key in obj)
					if (fnIterator.call(context, obj[key], key) === false) return;
			}
		},
		tryEach: function (obj, fnIterator, fnError, context) {
			this.each(obj, function (value, key) {
				try {
					return fnIterator.call(context, value, key);
				} catch (error) {
					if (this.isFunction(fnError)) {
						try {
							fnError.call(context, value, key, error);
						} catch (error) {}
					}
				}
			}, this);
		},
		registerPlugin: function (methods) {
			Basil.plugins = this.extend(methods, Basil.plugins);
		},
		getTypeOf: function (obj) {
			if (typeof obj === 'undefined' || obj === null)
				return '' + obj;
			return Object.prototype.toString.call(obj).replace(/^\[object\s(.*)\]$/, function ($0, $1) { return $1.toLowerCase(); });
		}
	};
  	// Add some isType methods: isArguments, isBoolean, isFunction, isString, isArray, isNumber, isDate, isRegExp, isUndefined, isNull.
	var types = ['Arguments', 'Boolean', 'Function', 'String', 'Array', 'Number', 'Date', 'RegExp', 'Undefined', 'Null'];
	for (var i = 0; i < types.length; i++) {
		Basil.utils['is' + types[i]] = (function (type) {
			return function (obj) {
				return Basil.utils.getTypeOf(obj) === type.toLowerCase();
			};
		})(types[i]);
	}

	// Plugins
	Basil.plugins = {};

	// Options
	Basil.options = Basil.utils.extend({
		namespace: 'b45i1',
		storages: ['local', 'cookie', 'session', 'memory'],
		expireDays: 365
	}, window.Basil ? window.Basil.options : {});

	// Storage
	Basil.Storage = function () {
		var _salt = 'b45i1' + (Math.random() + 1)
				.toString(36)
				.substring(7),
			_storages = {},
			_isValidKey = function (key) {
				var type = Basil.utils.getTypeOf(key);
				return (type === 'string' && key) || type === 'number' || type === 'boolean';
			},
			_toStoragesArray = function (storages) {
				if (Basil.utils.isArray(storages))
					return storages;
				return Basil.utils.isString(storages) ? [storages] : [];
			},
			_toStoredKey = function (namespace, path) {
				var key = '';
				if (_isValidKey(path)) {
					key += path;
				} else if (Basil.utils.isArray(path)) {
					path = Basil.utils.isFunction(path.filter) ? path.filter(_isValidKey) : path;
					key = path.join('.');
				}
				return key && _isValidKey(namespace) ? namespace + '.' + key : key;
 			},
			_toKeyName = function (namespace, key) {
				if (!_isValidKey(namespace))
					return key;
				return key.replace(new RegExp('^' + namespace + '.'), '');
			},
			_toStoredValue = function (value) {
				return JSON.stringify(value);
			},
			_fromStoredValue = function (value) {
				return value ? JSON.parse(value) : null;
			};

		// HTML5 web storage interface
		var webStorageInterface = {
			engine: null,
			check: function () {
				try {
					window[this.engine].setItem(_salt, true);
					window[this.engine].removeItem(_salt);
				} catch (e) {
					return false;
				}
				return true;
			},
			set: function (key, value, options) {
				if (!key)
					throw Error('invalid key');
				window[this.engine].setItem(key, value);
			},
			get: function (key) {
				return window[this.engine].getItem(key);
			},
			remove: function (key) {
				window[this.engine].removeItem(key);
			},
			reset: function (namespace) {
				for (var i = 0, key; i < window[this.engine].length; i++) {
					key = window[this.engine].key(i);
					if (!namespace || key.indexOf(namespace) === 0) {
						this.remove(key);
						i--;
					}
				}
			},
			keys: function (namespace) {
				var keys = [];
				for (var i = 0, key; i < window[this.engine].length; i++) {
					key = window[this.engine].key(i);
					if (!namespace || key.indexOf(namespace) === 0)
						keys.push(_toKeyName(namespace, key));
				}
				return keys;
			}
		};

		// local storage
		_storages.local = Basil.utils.extend({}, webStorageInterface, {
			engine: 'localStorage'
		});
		// session storage
		_storages.session = Basil.utils.extend({}, webStorageInterface, {
			engine: 'sessionStorage'
		});

		// memory storage
		_storages.memory = {
			_hash: {},
			check: function () {
				return true;
			},
			set: function (key, value, options) {
				if (!key)
					throw Error('invalid key');
				this._hash[key] = value;
			},
			get: function (key) {
				return this._hash[key] || null;
			},
			remove: function (key) {
				delete this._hash[key];
			},
			reset: function (namespace) {
				for (var key in this._hash) {
					if (!namespace || key.indexOf(namespace) === 0)
						this.remove(key);
				}
			},
			keys: function (namespace) {
				var keys = [];
				for (var key in this._hash)
					if (!namespace || key.indexOf(namespace) === 0)
						keys.push(_toKeyName(namespace, key));
				return keys;
			}
		};

		// cookie storage
		_storages.cookie = {
			check: function () {
				if (!navigator.cookieEnabled)
					return false;
				if (window.self !== window.top) {
					// we need to check third-party cookies;
					var cookie = 'thirdparty.check=' + Math.round(Math.random() * 1000);
					document.cookie = cookie + '; path=/';
					return document.cookie.indexOf(cookie) !== -1;
				}
				return true;
			},
			set: function (key, value, options) {
				if (!this.check())
					throw Error('cookies are disabled');
				options = options || {};
				if (!key)
					throw Error('invalid key');
				var cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value);
				// handle expiration days
				if (options.expireDays) {
					var date = new Date();
					date.setTime(date.getTime() + (options.expireDays * 24 * 60 * 60 * 1000));
					cookie += '; expires=' + date.toGMTString();
				}
				// handle domain
				if (options.domain && options.domain !== document.domain) {
					var _domain = options.domain.replace(/^\./, '');
					if (document.domain.indexOf(_domain) === -1 || _domain.split('.').length <= 1)
						throw Error('invalid domain');
					cookie += '; domain=' + options.domain;
				}
				// handle secure
				if (options.secure === true) {
					cookie += '; secure';
				}
				document.cookie = cookie + '; path=/';
			},
			get: function (key) {
				if (!this.check())
					throw Error('cookies are disabled');
				var encodedKey = encodeURIComponent(key);
				var cookies = document.cookie ? document.cookie.split(';') : [];
				// retrieve last updated cookie first
				for (var i = cookies.length - 1, cookie; i >= 0; i--) {
					cookie = cookies[i].replace(/^\s*/, '');
					if (cookie.indexOf(encodedKey + '=') === 0)
						return decodeURIComponent(cookie.substring(encodedKey.length + 1, cookie.length));
				}
				return null;
			},
			remove: function (key) {
				// remove cookie from main domain
				this.set(key, '', { expireDays: -1 });
				// remove cookie from upper domains
				var domainParts = document.domain.split('.');
				for (var i = domainParts.length; i >= 0; i--) {
					this.set(key, '', { expireDays: -1, domain: '.' + domainParts.slice(- i).join('.') });
				}
			},
			reset: function (namespace) {
				var cookies = document.cookie ? document.cookie.split(';') : [];
				for (var i = 0, cookie, key; i < cookies.length; i++) {
					cookie = cookies[i].replace(/^\s*/, '');
					key = cookie.substr(0, cookie.indexOf('='));
					if (!namespace || key.indexOf(namespace) === 0)
						this.remove(key);
				}
			},
			keys: function (namespace) {
				if (!this.check())
					throw Error('cookies are disabled');
				var keys = [],
					cookies = document.cookie ? document.cookie.split(';') : [];
				for (var i = 0, cookie, key; i < cookies.length; i++) {
					cookie = cookies[i].replace(/^\s*/, '');
					key = decodeURIComponent(cookie.substr(0, cookie.indexOf('=')));
					if (!namespace || key.indexOf(namespace) === 0)
						keys.push(_toKeyName(namespace, key));
				}
				return keys;
			}
		};

		return {
			init: function (options) {
				this.setOptions(options);
				return this;
			},
			setOptions: function (options) {
				this.options = Basil.utils.extend({}, this.options || Basil.options, options);
			},
			support: function (storage) {
				return _storages.hasOwnProperty(storage);
			},
			check: function (storage) {
				if (this.support(storage))
					return _storages[storage].check();
				return false;
			},
			set: function (key, value, options) {
				options = Basil.utils.extend({}, this.options, options);
				if (!(key = _toStoredKey(options.namespace, key)))
					return false;
				value = options.raw === true ? value : _toStoredValue(value);
				var where = null;
				// try to set key/value in first available storage
				Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage, index) {
					_storages[storage].set(key, value, options);
					where = storage;
					return false; // break;
				}, null, this);
				if (!where) {
					// key has not been set anywhere
					return false;
				}
				// remove key from all other storages
				Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage, index) {
					if (storage !== where)
						_storages[storage].remove(key);
				}, null, this);
				return true;
			},
			get: function (key, options) {
				options = Basil.utils.extend({}, this.options, options);
				if (!(key = _toStoredKey(options.namespace, key)))
					return null;
				var value = null;
				Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage, index) {
					if (value !== null)
						return false; // break if a value has already been found.
					value = _storages[storage].get(key, options) || null;
					value = options.raw === true ? value : _fromStoredValue(value);
				}, function (storage, index, error) {
					value = null;
				}, this);
				return value;
			},
			remove: function (key, options) {
				options = Basil.utils.extend({}, this.options, options);
				if (!(key = _toStoredKey(options.namespace, key)))
					return;
				Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage) {
					_storages[storage].remove(key);
				}, null, this);
			},
			reset: function (options) {
				options = Basil.utils.extend({}, this.options, options);
				Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage) {
					_storages[storage].reset(options.namespace);
				}, null, this);
			},
			keys: function (options) {
				options = options || {};
				var keys = [];
				for (var key in this.keysMap(options))
					keys.push(key);
				return keys;
			},
			keysMap: function (options) {
				options = Basil.utils.extend({}, this.options, options);
				var map = {};
				Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage) {
					Basil.utils.each(_storages[storage].keys(options.namespace), function (key) {
						map[key] = Basil.utils.isArray(map[key]) ? map[key] : [];
						map[key].push(storage);
					}, this);
				}, null, this);
				return map;
			}
		};
	};

	// Access to native storages, without namespace or basil value decoration
	Basil.memory = new Basil.Storage().init({ storages: 'memory', namespace: null, raw: true });
	Basil.cookie = new Basil.Storage().init({ storages: 'cookie', namespace: null, raw: true });
	Basil.localStorage = new Basil.Storage().init({ storages: 'local', namespace: null, raw: true });
	Basil.sessionStorage = new Basil.Storage().init({ storages: 'session', namespace: null, raw: true });

	// browser export
	window.Basil = Basil;

	// AMD export
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return Basil;
		});
	// commonjs export
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = Basil;
	}

})();

},{}]},{},[3]);
