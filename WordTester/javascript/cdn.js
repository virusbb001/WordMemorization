//外部ファイル読込

function loadExternalFile(list){
 var headTag=document.getElementsByTagName("head")[0];
 var treeRoot={};
 if(!headTag){
  alert("headTagがありませんでした");
  return;
 }

 function makeElement(type){
  var obj={
   javascript:function(){
    var element=document.createElement("script");
    element.type="text/javascript";
    return element;
   },
   css:function(){
    //<link rel="stylesheet" type="text/css" href="style.css" media="all">
    var element=document.createElement("link");
    element.rel="stylesheet";
    element.media="all";
    element.type="text/css";
    return element;
   }
  };
  return (obj[type])();
 }

 var loadFile=function(url,type,callback,failCallback){
  var elem=makeElement(type);
  elem[({javascript:"src",css:"href"}[type])]=url;
  elem.onload=function(){
   console.log(elem);
   if(callback){
    callback();
   }
  };
  elem.onerror=function(){
   this.parentNode.removeChild(this);
   if(failCallback){
    failCallback();
   }
  };
  headTag.appendChild(elem);
 };

 (function(list){
   var i=0;
   var urlNo=0;

   function tmp(){
    if(i<list.length){
     data=list[i];
     loadFile(data.list[urlNo],data.type,function(){
       i++;
       urlNo=0;
       tmp();
      },function(){
       urlNo++;
       if(!(urlNo<data.list.length)){
        i++;
        urlNo=0;
       }
       tmp();
     });
    }
   }
   tmp();
 })(list);
};

