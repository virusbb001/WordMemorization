//TODO QuestionIDを使用する
function init() {
 if(!window.File){
  window.alert("File APIが使えません 他のブラウザに *至急* 変更してください");
  return;
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
    //$('status').update("IME確定");
   }else{
    //$('status').update("IME入力中");
   }
   keypressCount=0;
  }else{
   //$('status').update("直接入力中");
   if(e.keyCode==13){
    check();
   }
  }
 });


 //ファイルが選択されているかどうか
 //問題
 $('questionData').observe("change",function(e){
  if($('questionData').value==""){
   $('questionLoad').disabled=true;
  }else{
   $('questionLoad').disabled=false;
  }
 });
 //ユーザー
 $('userData').observe("change",function(e){
  if($('userData').value==""){
   $('loadButton').disabled=true;
  }else{
   $('loadButton').disabled=false;
  }
 });

 // 問題読込
 $('questionLoad').observe("click",function(e){
  setQuestionData();
 });

 // セーブデータ読込
 $('loadButton').observe("click",function(e){
  setUserData();
 });

 //問題開始
 $('TestStart').observe("click",function(e){
  startTest();
 });

 // セーブデータダウンロード
 $('saveButton').observe("click",function(e){
  generateUserDataFile();
 });

 $('input').blur();
 $('question').hide();
 $('answer').hide();
}

//間違い回答クラス
var WrongAnswer=function(id,wAnswer){
 this.id=id;
 this.wAnswer=wAnswer;
}

//間違いデータ
var MistookQuestionData=function(id){
 this.id=id;
 this.time=0;
}

//問題リストクラス
var QuestionMetaData=function(id,name,auther,version){
 this.ID=id;
 this.QuestionName=name;
 this.Auther=auther;
 this.Version=version;
}

//問題データ
var questionData=[];

//ユーザーの設定データ
var userResult={
 MistookQuestion:{},
 addMistookQuestion:function(id,no){
  var index=-1;
  if(Object.isUndefined(this.MistookQuestion[id])){
   console.log(this.MistookQuestion[id]);
   this.MistookQuestion[id]=new Array();
  }
  for(var i=0;i<this.MistookQuestion[id].length;i++){
   console.log(this.MistookQuestionData,id,no);
   if(this.MistookQuestion[id][i].id==no){
    index=i;
   }
  }
  if(index<0){
   index=this.MistookQuestion[id].length;
   this.MistookQuestion[id].push(new MistookQuestionData(no));
  }
  this.MistookQuestion[id][index].time++;
 }
};

//問題追加済み
installedQuestion=[];

//出題ごとの結果
var testingData={
 //全問題数
 allQuestionNumber:0,
 //現在の問題ID
 currentQuestion:-1,
 //出題する問題ID
 questionID:[],
 //間違った回答
 wrongAnswer:[]
};

//ユーザーデータ読込
function setUserData(){
 //セーブデータはひとつのみ
 var userFile=$('userData').files[0];
 $('saveLink').writeAttribute("download",userFile.name);
 var reader=new FileReader();
 reader.addEventListener('load',function(e){
  try{
   var userData=eval("("+reader.result+")");
   //ここにユーザーデータの処理
   addUserData(userData);
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
   console.log("Error:"+reader.error.code+":"+errorMessages[reader.error.code])
 },true);
 reader.addEventListener('progress',function(e){
  $('userDataLoading').update(Math.floor(e.loaded/e.total*100));
 },true);
 reader.readAsText(userFile,'UTF-8');
}

//ユーザーデータダウンロードボタン
function generateUserDataFile(){
 var json=JSON.stringify(userResult);
 $('saveLink').writeAttribute('href','data:application/json,'+json).update("Download it.");
 console.log(json);
}

//問題がファイル読込
function setQuestionData(){
 var files=$('questionData').files;
 for(var i=0;i<files.length;i++){
  var questionFile=files[i];
  var reader=new FileReader();
  reader.addEventListener('load',function(e){
   try{
    var questionData=eval("("+this.result+")");
    addQuestionData(questionData);
   }catch(exception){
    console.log(this.result);
    $('questionLoading').update("何かしらの例外が発生しました:"+exception.message+")");
    console.log(e);
    console.log(exception);
   }
  }.bindAsEventListener(reader),true);
  reader.addEventListener('error',function(e){
   var errorMessages=[
   "Error:0",
   "File Not Found",
   "Permission Error",
   "処理が中断された",
   "読込中にエラーが発生",
   "ファイルサイズが大きすぎる"
   ];
  alert("Error:"+this.error.code+":"+errorMessages[this.error.code]);
  }.bindAsEventListener(reader),true);
  reader.addEventListener('progress',function(e){
   $('questionLoading').update((Math.floor(e.loaded/e.total*100))+"%");
  },true);
  reader.readAsText(questionFile,'UTF-8');
 }
}

//qDataを問題に追加
function addQuestionData(qData) {
 var flag=false;

 for(i=0;i<installedQuestion.length;i++){
  if(installedQuestion[i].ID==qData.QuestionID){
   flag=true;
  }
 }
 //console.log(qData);
 if(flag){
  alert("追加済みです");
  return;
 }
 installedQuestion.push(new QuestionMetaData(qData.QuestionID,qData.QuestionName,qData.Auther,qData.version));
 showQuestionList(installedQuestion);
 for(var i=0;i<qData.question.length;i++){
  qData.question[i].questionNo=i;
  qData.question[i].questionID=qData.QuestionID;
  questionData.push(qData.question[i]);
 }
 if(questionData.length>0){
  $('TestStart').disabled=false;
 }else{
  $('TestStart').disabled=true;
 }
}

//ユーザーデータの追加
function addUserData(userData){
 if(Object.isUndefined(userData.DataType)&&(userData!="UserSaveData")){
  return;
 }

 userResult=Object.extend(userResult,userData);
}

//出題開始
function startTest(){
 //testingData初期化
 testingData.wrongAnswer.clear();
 testingData.questionID.clear();
 for(i=0;i<questionData.length;i++){
  testingData.questionID.push(i);
 }
 testingData.allQuestionNumber=testingData.questionID.length;

 //誤答リストを空に
 emptyWrongAnswers();

 //出題欄表示
 $('question').show();
 $('answer').show();
 $('input').focus();

 //設定欄を隠す
 $('settings').hide();

 //出題
 setQuestion();
}

//問題設定
function setQuestion(){
 if(0==testingData.questionID.length){
  endTest();
 }else{
  //statusに状態表示
  $('status').update(""+(Math.floor((testingData.allQuestionNumber-testingData.questionID.length)/testingData.allQuestionNumber*100))+"%,"+(testingData.allQuestionNumber-testingData.questionID.length)+"/"+testingData.allQuestionNumber);
  //取り出す問題名
  var id=Math.floor(Math.random()*testingData.questionID.length);
  testingData.currentQuestion=testingData.questionID[id];
  var questionStr=questionData[testingData.currentQuestion].questionSentence;
  var questionMisTookObj=userResult.MistookQuestion[questionData[testingData.currentQuestion].questionID];
  if((!Object.isUndefined(questionMisTookObj))&&(!Object.isUndefined(questionMisTookObj[questionData[testingData.currentQuestion].questionNo]))){
   questionStr+=("("+userResult.MistookQuestion[questionData[testingData.currentQuestion].questionID][questionData[testingData.currentQuestion].questionNo].time+"回)");
  }
  $('statement').update(questionStr);
  //出題した問題を外す
  testingData.questionID.splice(id,1);
 }
}

//出題終了
function endTest(){
 alert("テスト終了");
 //入力無効
 $('input').blur();
 $('question').hide();
 $('answer').hide();
 $('status').update("正解数"+(testingData.allQuestionNumber-testingData.wrongAnswer.length)+"/"+testingData.allQuestionNumber);
 //間違いと正解表示
 testingData.wrongAnswer.sort(function(a,b){
  return a.id-b.id;
 });
 testingData.wrongAnswer.each(function(item){
  addWrongAnswer(item.id,item.wAnswer);
  userResult.addMistookQuestion(questionData[item.id].questionID,questionData[item.id].questionNo);
 });
 generateUserDataFile();

 //設定表示
 $('settings').show();
}

//正誤チェック
function check(){
 var wFlag=false;
 //パス判定
 if($('input').value==""){
  $('correct').update("PASS");
  wFlag=true;
 }else{
  if($('input').value==questionData[testingData.currentQuestion].answer){
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
 tr.insertCell(-1).update(questionData[id].questionSentence);
 tr.insertCell(-1).update(wAnswer);
 tr.insertCell(-1).update(questionData[id].answer);
}

//一度空にして表示し直す
function showQuestionList(list) {
 var liList=$('QuestionDataList').childElements();
 for(var i=0;i<liList.length;i++){
  liList[i].remove();
 }

 for(var i=0;i<list.length;i++){
  $('QuestionDataList').insert(
    {
     bottom:new Element("li").update(""+list[i].QuestionName+"("+list[i].Auther+")")
    }
    );
 }
}

//IME判定用
var keypressCount=0;

document.observe("dom:loaded",init);
