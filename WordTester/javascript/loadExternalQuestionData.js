// 外部問題データ読込

function loadExternalFileList(){
 var fileUrl=WordTesterConfig.externalQuestionList;
 //読込ファイル
 if(fileUrl==null){
  return;
 }
 $.ajax({
   url:fileUrl
 }).done(function(data){
   for(var i=0;i<data.length;i++){
    console.log(data);
    loadExternalQuestionFile(data[i]);
   }
 });
}

function loadExternalQuestionFile(url){
 $.ajax({
   url:url
 }).done(function(data){
   console.log(data);
   addQuestion(data,url);
 });
}
