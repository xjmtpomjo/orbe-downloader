$(function(){
  $( "body" ).delegate( "a", "click", function(e) {
    var tempUrl = $(this).attr("href");
    if (tempUrl.indexOf("orbe.xxx.com") > -1) {
      e.preventDefault();
      console.log("^_^");
      var hashStr = tempUrl.replace("http://orbe.xxx.com/", "");
      hashStr = hashStr.replace(/^\s+|\s+$/g,'');
      console.log("url: " + tempUrl + ", hashStr: " + hashStr);
      var messageObj = {action: "bt", messageData: hashStr};
      chrome.runtime.sendMessage(chrome.runtime.id, messageObj);
      return false;
    }
  });
});
