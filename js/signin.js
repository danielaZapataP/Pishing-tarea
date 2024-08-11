//* ***************************************************************
//*  This software and related documentation are provided under a
//*  license agreement containing restrictions on use and
//*  disclosure and are protected by intellectual property
//*  laws. Except as expressly permitted in your license agreement
//*  or allowed by law, you may not use, copy, reproduce,
//*  translate, broadcast, modify, license, transmit, distribute,
//*  exhibit, perform, publish or display any part, in any form or
//*  by any means. Reverse engineering, disassembly, or
//*  decompilation of this software, unless required by law for
//*  interoperability, is prohibited.
//*  The information contained herein is subject to change without
//*  notice and is not warranted to be error-free. If you find any
//*  errors, please report them to us in writing.
//*  
//*  Copyright (C) 1988, 2017, Oracle and/or its affiliates.
//*  All Rights Reserved.
//* ***************************************************************

var ptSignon = function (form) {
var bManualPlaceholder = false;
var init = function() {
  addEvent(form.Submit,"click",function(){submitAction();});
  setErrorImg(); // error check and init
  clearRecentSearch();
  
  var ffv = getFFVersion();
  if ((ffv != -1) && (ffv <= 30))   {
     //Workaround for Mozilla bug:687192,610733. Bug until Firefox 30.0 
     //To verically center the select text
     var langsel = document.getElementById('ptlangsel');
     if (langsel){
    langsel.className += " ps_select_ff_30";
     }    
     var formfactorsel = document.getElementById('ptformfactor');
     if (formfactorsel){    
    formfactorsel.className += " ps_select_ff_30";
     }
  }
  
  var ff_param = getFormFactorFromURL();
  if (ff_param != null) {
      var formfactorset = document.getElementById('ptformfactorset');
      if (formfactorset)
          formfactorset.className = "";
  }
   
},

getFFVersion = function(){   
  //Determine Firefox version
  try {
    var idxUA = navigator.userAgent.lastIndexOf("Firefox/");
    if (idxUA == -1) 
        return -1;
    var strVersion =  navigator.userAgent.substring(idxUA + 8, navigator.userAgent.length);
    return parseInt(strVersion);
  }
  catch (ex){
    return 31;  //version Mozilla bug:687192,610733 is fixed.
  }
},

addEvent = function (el,type,handler) {
  if (!el) { return; }
  if (el.addEventListener) {
    el.addEventListener(type,handler,false);
  } else if (el.attachEvent)  {
    el.attachEvent("on" + type,handler);
  }
},
removeEvent = function(element, type, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(type, handler, false);
        } else if (element.detachEvent) {
            element.detachEvent("on" + type, handler);
        } else {
            element["on" + type] = null;
        }
}

clearRecentSearch = function () {
  if (typeof (window.sessionStorage) !== "undefined") {
    try { sessionStorage.clear(); } catch (e) { }
  }
},
setFocus = function () {
  try {
      if (localStorage.getItem("langChanged")) {
          form = document.forms[0];
          form.ptlangsel.focus();
          localStorage.removeItem("langChanged");
      } else {
          form.userid.focus();
      }
  } catch (e) { }
};

if (typeof form === "undefined" || !form) {
  form = document.forms[0];
}

// public interface
return {
  login: function () {    // signin.html
    setLang();     // language select init
    init();
  },
  expire: function (t) {  // expire.html
    clearRecentSearch();
    try {
      document.getElementById("ptexpirenum").innerHTML = t >= 60 ? Math.round(t / 60) : " < 1 ";
      document.links[0].focus();
    } catch (e) {}
  },
  trace: function () {    // sigintrace.html
    addEvent(form,"submit",function(){signin();});
    init();
    setFocus();
  },
  changeLangFunc: function(obj,e){
    changeLangThis(obj,e);
  }

};
};

function setCookie(name, value, exdays, path, domain, secure) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = d.toGMTString();
    document.cookie = name + "=" + value +
        ((expires) ? "; expires=" + expires : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        if (c.indexOf(name) == 0) {
            var value = c.substring(name.length, c.length);
            if (value == '""')
                return "";
            else
                return value;
        }
    }
    return "";
}

function getJSONCookie(cookieName) {
    var deviceCookie = getCookie(cookieName);    
    if (getCookie("PS_DEVICEFEATURES") == "") return deviceCookie;
    deviceCookie = '{"' + deviceCookie + '}';
    deviceCookie = deviceCookie.replace(/ /g, ',"');
    deviceCookie = deviceCookie.replace(/:/g, '":');
    return deviceCookie;
}

function updatePTCookie(jsonString, cookieName) {
    var sCookieValue = jsonString.replace(/"/g, "");
    sCookieValue = sCookieValue.replace(/{/g, "");
    sCookieValue = sCookieValue.replace(/}/g, "");
    sCookieValue = sCookieValue.replace(/ /g, "");
    sCookieValue = sCookieValue.replace(/,/g, " ");
    var scheme = window.location.href.substr(0, 5);
    var secure = (scheme == "https") ? true : null;
    setCookie(cookieName, sCookieValue, 1000, "/", sDomain, secure);
}

function getFormFactorSize()
{
    var formfactor = document.getElementById("ptformfactor") ? document.getElementById("ptformfactor").value : getFormFactorFromURL();
    var devWidth, devHeight;
    if (formfactor == "0") {
        devHeight = 720;
        devWidth = 519;
    } else if (formfactor == "1") {
        devHeight = 1000;
        devWidth = 759;
    } else if (formfactor == "2") {
        devHeight = 1200;
        devWidth = 959;
    } else {
        devHeight = window.screen.height;
        devWidth = window.screen.width;
    }
    return {width:devWidth, height:devHeight, formfactor:formfactor};
}

function getFormFactorFromURL() {
var url = window.location.href;
var params = url.substring(url.indexOf("?") + 1, url.length);
    var sArr = params.split("&");
    for (var i = 0; i < sArr.length; ++i) {
        var elem = sArr[i].split("=");
        if (elem[0] == "ptformfactor") {
            if (document.getElementById("ptformfactor"))
                document.getElementById("ptformfactor").value = elem[1];
             return elem[1];
        }
    }
    return null;
}

function applyFormFactor() {   
    var devWidth = getFormFactorSize().width;
    var devHeight = getFormFactorSize().height;
    var objWrap = document.getElementById("pswrapper");
    var url = window.location.href;    
    var regexPTF = new RegExp("[?&]" + "ptformfactor" + "=([^&]*)", "i");	
    var pattPTF = regexPTF.exec(url);
    if ((typeof pattPTF != "undefined") && (pattPTF.length > 0))
        url = window.location.href.replace(pattPTF[0], "");    
    url = url + "&ptformfactor=" + getFormFactorSize().formfactor;  
    var myWindow = window.open(url, "newwindowouter", "width=1,height=1,resizable=yes,scrollable=yes,scrollbars=yes,toolbar=no,location=no");
    myWindow.resizeTo(devWidth, devHeight);
    myWindow.moveTo(0, 0);
    myWindow.focus();
    myWindow.innerHeight = devHeight;
    myWindow.innerWidth = devWidth;
}

function ptMAFContainer(){
    var isDevice = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) ? 1 : 0;
    if (isDevice == 1){
        try {
            var http = new XMLHttpRequest();
            http.open('HEAD', "/~maf.device~/www/js/base.js", false);
            http.send();

            if (http.status == "200" ) {
                return 1;
            } else {
                return 0;
            }
        } catch (e) {
            return 0;
        }
    }else{
        return 0;
    }
}

function ptDeviceFeatures() {
    this.deviceFeatures = {},
        ptText = "peoplesoft",
    this.init = function () {
        var devWidth = getFormFactorSize().width;
        var devHeight = getFormFactorSize().height;
        var ua = navigator.userAgent;
        var isAndroid = ua.indexOf("android") > -1;
        this.deviceFeatures['maf'] = ptMAFContainer();
        if (this.deviceFeatures['maf'] && isAndroid) {
            this.deviceFeatures['width'] = Math.round(devWidth / window.devicePixelRatio);
            this.deviceFeatures['height'] = Math.round(devHeight / window.devicePixelRatio);
        } else {
        this.deviceFeatures['width'] = devWidth;
        this.deviceFeatures['height'] = devHeight;
        }
        this.deviceFeatures['clientWidth'] = getViewportWidth();
        this.deviceFeatures['clientHeight'] = getViewportHeight();
        this.deviceFeatures['pixelratio'] = window.devicePixelRatio;
        this.deviceFeatures['touch'] = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) ? 1 : 0;
        this.deviceFeatures['geolocation'] = ('geolocation' in navigator) ? 1 : 0;
        this.deviceFeatures['websockets'] = ('WebSocket' in window || 'MozWebSocket' in window) ? 1 : 0;
        this.deviceFeatures['webworkers'] = (!!window.Worker) ? 1 : 0;
        this.deviceFeatures['datepicker'] = checkInputType("date") ? 1 : 0;
        this.deviceFeatures['dtpicker'] = checkInputType("datetime-local") ? 1 : 0;
        this.deviceFeatures['timepicker'] = checkInputType("time") ? 1 : 0;
        this.deviceFeatures['dnd'] = checkDND() ? 1 : 0;
        this.deviceFeatures['sessionstorage'] = checkSessionStorage() ? 1 : 0;
        this.deviceFeatures['localstorage'] = checkLocalStorage() ? 1 : 0;
        this.deviceFeatures['history'] = (!!(window.history && history.pushState)) ? 1 : 0;
        this.deviceFeatures['canvas'] = checkCanvas() ? 1 : 0;
        this.deviceFeatures['svg'] = checkSVG() ? 1 : 0;
        this.deviceFeatures['postmessage'] = (!!window.postMessage) ? 1 : 0;
        this.deviceFeatures['hc'] = checkHC() ? 1 : 0;
        var sValue = JSON.stringify(this.deviceFeatures);
        updatePTCookie(sValue, "PS_DEVICEFEATURES");    
    };
    checkInputType = function (type) {
        try {
            var input = document.createElement("input");
            input.setAttribute("type", type);
            return input.type == type;
        } catch (e) {
            return false;
        }
    };
    checkDND = function () {
        try {
            var div = document.createElement('div');
            return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
        } catch (e) {
            return false;
        }
    };
    checkLocalStorage = function () {
        try {
            localStorage.setItem(ptText, ptText);
            localStorage.removeItem(ptText);
            return true;
        } catch (e) {
            return false;
        }
    };

    checkSessionStorage = function () {
        try {
            sessionStorage.setItem(ptText, ptText);
            sessionStorage.removeItem(ptText);
            return true;
        } catch (e) {
            return false;
        }
    };
    checkCanvas = function () {
        try {
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('2d'));
        } catch (e) {
            return false;
        }
    };
    checkSVG = function () {
        try {
            return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
        } catch (e) {
            return false;
        }
    };
    function checkHC() {
        try {
            var btn = document.createElement("input");
            var grad, rgrad;
            try {
                btn.style.backgroundImage = "linear-gradient(rgb(255, 255, 255),rgb(0, 0, 0))";
            } catch (e) {
                btn.style.backgroundImage = "url()";
            }

            var cssobj = window.getComputedStyle(btn, null);
            rgrad = cssobj.getPropertyValue("background-image");
            if (rgrad == "none")
                return 1;
            return 0;

        } catch (e) {
            return 0;
        }
    };

    getViewportHeight = function (oWin) {
        if (!oWin) oWin = window;
        if (oWin.innerHeight != oWin.undefined)
            return oWin.innerHeight;
        if (oWin.document.compatMode == 'CSS1Compat')
            return oWin.document.documentElement.clientHeight;
        if (oWin.document.body)
            return oWin.document.body.clientHeight;
        return oWin.undefined;
    };

    getViewportWidth = function (oWin) {

        if (!oWin) oWin = window;
        if (oWin.innerWidth != oWin.undefined)
            return oWin.innerWidth;
        if (oWin.document.compatMode == 'CSS1Compat')
            return oWin.document.documentElement.clientWidth;
        if (oWin.document.body)
            return oWin.document.body.clientWidth;
        return oWin.undefined;
    };
};
