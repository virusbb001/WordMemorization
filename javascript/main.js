function init() {
 if(!window.File){
  window.alert("File APIが使えません 他のブラウザに *至急* 変更してください");
 }
 //IME判定設定
 $('input').observe("keypress",function(e){
  if((e.keyCode!=241)&&(e.keyCode!=242)){
   keypressCount++;
  }
 });

 $('input').observe("keyup",function (e) {
  keypressCount--;
  if(keypressCount<0){
   if(e.keyCode==13){
    $('status').update("IME確定");
    //送信
   }else{
    $('status').update("IME入力中");
   }
   keypressCount=0;
  }else{
   $('status').update("直接入力中");
   if(e.keyCode==13){
    check();
   }
  }
 });

 $('questionLoad').observe("click",function(e){
  setQuestionData();
 });

 $('TestStart').observe("click",function(e){
  startTest();
 });
}

//間違い回答クラス
var WrongAnswer=function(id,wAnswer){
 this.id=id;
 this.wAnswer=wAnswer;
}

//問題データ
var questionData;

//ユーザーの設定データ
var userResult={
};

//出題ごとの結果
var testingData={
 //正解数
 CorrectAnswer:0,
 //skip回数
 SkipCount:0,
 //現在の問題ID
 currentQuestion:-1,
 //出題する問題ID
 questionID:[],
 //間違った回答
 wrongAnswer:[]
};

function setUserData(){
 var userFile=$('userData').files[0];
 var reader=new FileReader();
 reader.addEventListener('load',function(e){
  try{
   var userData=eval("("+reader.result+")");
   //ここにユーザーデータの処理
  }catch(exception){
   $('userDataLoading').update("何かしらの例外が発生しました:"+exception.message+")");
   console.log(exception);
  }
 },true);
 reader.addEventListener('error',function(e){
  var errorMessages=[
   "Error:0",
   "File Not Found",
   "Permission Error",
   "処理が中断された",
   "読込中にエラーが発生",
   "ファイルサイズが大きすぎる"
   ];
   $('userDataLoading').update("Error:"+reader.error.code+":"+errorMessages[reader.error.code]);
 },true);
 reader.addEventListener('progress',function(e){
  $('userDataLoading').update(Math.floor(e.loaded/e.total*100));
 },true);
 reader.readAsText(questionFile,'UTF-8');
}

function setQuestionData(){
 var questionFile=$('questionData').files[0];
 var reader=new FileReader();
 reader.addEventListener('load',function(e){
  try{
   questionData=eval("("+reader.result+")");
  }catch(exception){
   $('questionLoading').update("何かしらの例外が発生しました:"+e.message+")");
   console.log(e);
  }
 },true);
 reader.addEventListener('error',function(e){
  var errorMessages=[
   "Error:0",
   "File Not Found",
   "Permission Error",
   "処理が中断された",
   "読込中にエラーが発生",
   "ファイルサイズが大きすぎる"
   ];
   alert("Error:"+reader.error.code+":"+errorMessages[reader.error.code]);
 },true);
 reader.addEventListener('progress',function(e){
  $('questionLoading').update((Math.floor(e.loaded/e.total*100))+"%");
 },true);
 reader.readAsText(questionFile,'UTF-8');
}

//出題開始
function startTest(){
 //testingData初期化
 testingData.CorrectAnswer=0;
 testingData.SkipCount=0;
 testingData.wrongAnswer.clear();
 testingData.questionID.clear();
 console.log(questionData);
 for(i=0;i<questionData.question.length;i++){
  testingData.questionID.push(i);
 }

 emptyWrongAnswers();

 //出題
 setQuestion();
}

//問題設定
function setQuestion(){
 if(0==testingData.questionID.length){
  endTest();
 }else{
  var id=Math.floor(Math.random()*testingData.questionID.length);
  testingData.currentQuestion=testingData.questionID[id];
  $('statement').update(questionData.question[testingData.currentQuestion].questionSentence);
  //出題した問題を外す
  console.log(""+id+":"+testingData.questionID[id]);
  testingData.questionID.splice(id,1);
 }
}

//出題終了
function endTest(){
 alert("テスト終了");
 console.log(testingData.wrongAnswer);
 //間違いと正解表示
 testingData.wrongAnswer.sort(function(a,b){
  return a.id-b.id;
 });
 testingData.wrongAnswer.each(function(item){
  addWrongAnswer(item.id,item.wAnswer);
 })
}

//正誤チェック
function check(){
 var wFlag=false;
 //パス判定
 if($('input').value==""){
  $('correct').update("PASS");
  wFlag=true;
 }else{
  if($('input').value==questionData.question[testingData.currentQuestion].answer){
   $('correct').update("OK");
  }else{
   $('correct').update("NG");
   wFlag=true;
  }
 }
 if(wFlag){
  testingData.wrongAnswer.push(new WrongAnswer(testingData.currentQuestion,$('input').value));
 }
 $('input').value="";
 setQuestion();
}

//wrongAnswersを空に
function emptyWrongAnswers() {
 while($('wrongAnswers').rows.length>0){
  $('wrongAnswers').deleteRow(0);
 }
}

//wrongAnswersに追加
function addWrongAnswer(id,wAnswer) {
 var tr;

 tr=$('wrongAnswers').insertRow(-1);
 tr.insertCell(-1).update(id);
 tr.insertCell(-1).update(questionData.question[id].questionSentence);
 tr.insertCell(-1).update(wAnswer);
 tr.insertCell(-1).update(questionData.question[id].answer);
}

//IME判定用
var keypressCount=0;

document.observe("dom:loaded",init);
