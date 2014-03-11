var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require("querystring");
var util = require("util");
var vdLetter = "M:\\";
var exec = require('child_process').exec;
var child;
var orbeID;
var objectID = 'f7bd56603ad452dd1311b13ffca89252';
var pathToDXShell = '.\\dxshell.exe'

function onRequest(request, response) {
    var postData = "";
    var action = url.parse(request.url).pathname;

    console.log("\nRequest for " + action + " received.");

    request.setEncoding("utf8");

    request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
    });

    request.addListener("end", function() {
      actionHandler(action, postData, response);
    });
}

function glueTaskForDl(url, referer)
{
  var toReplace = '&';
  var re = new RegExp(toReplace, 'g');
  url = url.replace(re, "\\\\\"&\"");
  var task = " command=\"download\";download_url=\"\\\\\\\""+url+"\\\\\\\"\"";
  return task;
}

function glueTaskForBTSync(hashStr)
{
  var task = "";
  if(hashStr != "")
  {
    task = "command=\"share_folders\";share_dir_type=\"2\";share_dir_loc=\""+hashStr+"\"";
  }
  return task;
}

function actionHandler(action, postData, response)
{
  console.log("actionHandler: " + action);
  var data = qs.parse(postData);
  response.writeHead(200, {'Content-Type': 'text/plain'});
  if(action == "/dl" || action == "/bt")
  {
    var task = "";
    if(action == "/dl") {
      console.log("Download: " + data.url);
      console.log("Referer: " + data.referer);
      task = glueTaskForDl(data.url, data.referer);
    } else if(action == "/bt") {
      console.log("BTSync: " + data.hashStr);
      task = glueTaskForBTSync(data.hashStr);
    } else {
      console.log("Unknown action: " + action);
      return;
    }

    var cmd = pathToDXShell + ' ' + 'RemoteFile EditTag'+ ' ' + orbeID + ' ' + objectID + ' ' + task;
    exec(cmd,
      function (error, stdout, stderr) {
          if (stdout.indexOf("Request failed") > -1) {
            console.log('Request failed: ' + task);
            response.end("QQ");
          } else {
            console.log('Request succeeded(???): ' + task);
            response.end((action == "/dl") ? "GG" : "BT");
          }
          if (error !== null) {
            console.log('exec error: ' + error);
            response.end("QQ");
          }
      }
    );
  }
  else if(action == "/check")
  {
    fs.exists(vdLetter, function (exists) {
      response.end(exists ? "GG" : "QQ");
      console.log("VD exist?: " + exists);
    });
  }
  else
  {
    response.end('Orbe\n');
  }
}

http.createServer(onRequest).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/\n');
child = exec(pathToDXShell + ' ' + 'ListUserStorage',
  function (error, stdout, stderr) {
    orbeID = "";
    var tempStr = stdout.substring(stdout.indexOf("storageClusterId:"), stdout.indexOf("featureVirtDriveEnabled: true"));
    tempStr = tempStr.substring(tempStr.lastIndexOf("storageClusterId:"), tempStr.lastIndexOf("storageName:"));
    tempStr = tempStr.replace("storageClusterId:", "");
    orbeID = tempStr.replace(/^\s+|\s+$/g,'');
    if(orbeID.length > 5)
    {
      console.log("Got Orbe's device ID: "+orbeID);
    }
    else
    {
      console.log("failed to get Orbe's device ID: "+orbeID);
    }

    if (error !== null) {
      console.log('exec error: ' + error);
    }
});
