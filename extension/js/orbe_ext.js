function toDownload(url, referer){
  var action = 'dl';
  var task = 'url='+encodeURIComponent(url)+'&referer='+encodeURIComponent(referer);
  if (VDReady && url) {
    sendData(action, task);
  } else if (!VDReady && url) {
    checkVD({'func': sendData, 'arg1': action, 'arg2': task});
  }
}

function btSync(hashStr){
  var action = 'bt';
  var task = 'hashStr=' + hashStr;
  if (VDReady && hashStr) {
    sendData(action, task);
  } else if (!VDReady && hashStr) {
    checkVD({'func': sendData, 'arg1': action, 'arg2': task});
  }
}

function createHttpRequest(){
  var req = new XMLHttpRequest();
  return req;
}

function showNotifyDiv(txt){
    if(ntf){
      ntf.cancel();
      clearTimeout(toForNTF);
    }

    if(txt == "success")
      txt = "Orbe will start to download the requested file for you soon.";
    else if(txt == "BT")
      txt = "Orbe will start to download the requested file via BitTorrent soon.";
    else if(txt == "error")
      txt = "Orbe can't start to download the requested file for you currently.\nPlease try again later.";
    else
      txt = "Orbe is not currently accessible.";

    ntf = webkitNotifications.createNotification("img/Orbe_icon.png", txt, "");
    ntf.show();
    toForNTF = setTimeout(function(){
        ntf.cancel()
    }, 3000);
}

function checkVD(){
  checkVD(null);
}

function checkVD(callback){
  var xmlHttp = createHttpRequest();
  xmlHttp.onreadystatechange = function(){
    if (xmlHttp.readyState == 4) {
      if (xmlHttp.status == 200 && xmlHttp.responseText == "GG") {
        setVDReadyState(true);
        if(typeof(callback) === "object"){
          var func = callback['func'];
          var arg1 = callback['arg1'];
          var arg2 = callback['arg2'];
          func(arg1, arg2);  //sendData(action, dataToSend)
        }
      } else {
        setVDReadyState(false);
        if (typeof(callback) === "object") {
          showNotifyDiv("err");
        }
      }
    }
  };
  xmlHttp.open("POST", "http://127.0.0.1:1337/check", true);
  xmlHttp.send(null);
}

function setVDReadyState(isReady)
{
  if(isReady){
    chrome.browserAction.setIcon({ 'path' : 'img/Orbe_green_19.png'});
    VDReady = true;
  }else{
    chrome.browserAction.setIcon({ 'path' : 'img/Orbe_gray_19.png'});
    VDReady = false;
  }
}

function sendData(action, dataToSend){
    var xmlHttp = createHttpRequest();
    xmlHttp.onreadystatechange = function(){
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        if (xmlHttp.responseText == "GG") {
          showNotifyDiv("success");
        } else if(xmlHttp.responseText == "BT") {
          showNotifyDiv("BT");
        } else {
          showNotifyDiv("error");
        }
      }else if(xmlHttp.readyState == 4){
        chrome.browserAction.setIcon({ 'path' : 'img/Orbe_gray_19.png'});
        VDReady = false;
      }
    };
    xmlHttp.open("POST", "http://127.0.0.1:1337/"+action, true);
    xmlHttp.send(dataToSend);
}

function openDashboard(){

}

function onCMenuClickHandler(info, tab){
  if(info.menuItemId == "mainItem"){
    openDashboard();
  }else if(info.menuItemId == "selectedText"){
    toDownload(info.selectionText, info.pageUrl);
  }else if(info.menuItemId == "linkText"){
    var fUrl = (info.linkUrl != null && info.linkUrl != "") ? info.linkUrl : info.srcUrl;
    if(fUrl != null && fUrl != "")
      toDownload(fUrl, info.pageUrl);
    else
      console.log("url is missing");
  }
}

function createMenuS(){
  var selectionId = chrome.contextMenus.create({
    "id": "selectedText",
    "title": "Download to My Orbe",
    "contexts": ["selection"]
  });
  var linkId = chrome.contextMenus.create({
    "id": "linkText",
    "title": "Download to My Orbe",
    "contexts": ["link", "editable", "image", "video", "audio"]
  });
}

var ntf;
var toForNTF;
var VDReady = false;
var extID = chrome.runtime.id;

chrome.contextMenus.onClicked.addListener(onCMenuClickHandler);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
      chrome.tabs.executeScript(tabId, {file:"js/intercepter.js"});
    }
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request != null && typeof(request) === "object") {
      if (request.action && request.action == "bt") {
        btSync(request.messageData);
      } else {
        showNotifyDiv("error");
      }
    }
  });

chrome.runtime.onInstalled.addListener(createMenuS);

chrome.runtime.onStartup.addListener(createMenuS);

checkVD();
