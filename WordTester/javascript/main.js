$(function(){
 //隠したり表示したり
 $(".myhead>button.mystatus").on("click",function(e){
  var mybody=$(this).parent().nextAll(".mybody");
  mybody.slideToggle("",function(){
   var button=$(this).prev(".myhead").children("button.mystatus");
   if($(this).is(":hidden")){
    button.text("show");
   }else{
    button.text("hide");
   }
  });
 });

 //FileAPI使用できるか確認
 if(!window.FileReader){
  alert("File APIがサポートされていません");
  return false;
 }

 $("#questionNumber").on("keydown",function(e){
  if(e.which==13){
   e.preventDefault();
   $("#testStart").focus();
  }
 });

 //ファイルドロップ処理
 (function(droppable){
  var cancelEvent=function(event){
   event.preventDefault();
   event.stopPropagation();
   return false;
  };
  droppable.bind("dragenter",cancelEvent);
  droppable.bind("dragover",cancelEvent);

  //このeはjquery独自オブジェクト originalEventでもとのオブジェクトを取得できる
  //ドロップされたファイル一覧を取得する
  var handlerDroppedFile=function(e){
   var files=e.originalEvent.dataTransfer.files;
   for(var i=0;i<files.length;i++){
    var f=files[i];
    var reader=new FileReader();
    //closure
    //readerのイベント設定
    (function(file,reader){
     var progressSr=$("<span />").addClass("sr-only").text("0% Complete");
     var progressBar=$("<div />").addClass("progress-bar").attr("role","progressbar").attr("aria-valuemin","0").attr("aria-valuemax","100").css("width","0%").append(progressSr);
     var progressDiv=$("<div />").addClass("progress").addClass("progress-striped").append(progressBar);
     var progressWrapper=$("<div />").text(file.name).append(progressDiv).css("display","none");
     reader.onloadstart=function(e){
      progressWrapper.appendTo($("#FileReadProgress")).slideDown();
      progressDiv.addClass("active");
     };
     reader.onprogress=function(e){
      if(e.lengthComputable){
       var percentLoaded=Math.round((e.loaded/e.total)*100);
       progressBar.attr("aria-valuenow",percentLoaded).css("width",percentLoaded+"%");
       progressSr.text(percentLoaded+"% Complete");
      }
     };
     reader.onload=function(e){
      progressDiv.removeClass("active").removeClass("progress-striped");
      progressBar.addClass("progress-bar-success");
      progressWrapper.slideUp(1000,function(){
      });
      addQuestion(this.result,file.name);
     };
     reader.onerror=function(e){
      progressDiv.removeClass("active").removeClass("progress-striped");
      progressBar.addClass("progress-bar-danger");
      alert("エラーが発生しました");
      console.log(e);
     };
    })(f,reader);
    reader.readAsText(f);
   }
   //デフォルトの挙動をキャンセル
   cancelEvent(event);
   return false;
  };
  droppable.bind("drop",handlerDroppedFile);
 })($("#FileDropBox"));

 //問題開始時
 $("#testStart").on("click",function(){
  testStart();
 });

 //正解の確認と次に進める
 $("#answer").on("keydown","input",function(e){
  if(e.keyCode==13){
   checkAnswer();
   e.preventDefault();
  }
 });

 $("#testResult>button").on("click",function(e){
   testSettingShow();
 });

 //File読込欄の表示
 $("#FileDropArea>.myhead>button").click();
});

// データ定義 
var WrongAnswer=function(id,number){
 this.id=id;
 this.number=number;
 this.counter=0;
};

//問題データ
//id:QuestionID
//number:問題番号
var QuestionClass=function(id,number){
 this.id=id;
 this.number=number;
};

//numberに現在のデータ
var MistookQuestionData=function(number,answer){
 this.number=number;
 this.answer=answer;
};

//ファイル名はエラー表示用
function addQuestion(text,fileName){
 var object;
 try{
  object=JSON.parse(text);
 }catch(e){
  alert("ERROR OCCURED");
  console.log(e);
  return false;
 }

 //ID確認
 if(object.QuestionID==void(0)||object.QuestionID==""){
  alert(fileName+":QuestionIDが設定されていません");
  return false;
 }
 //addedDataIDにこのIDがあるかどうか
 if($.inArray(object.QuestionID,addedDataID)<0){
  addedDataID.push(object.QuestionID);
  questionData[object.QuestionID]={};
  questionData[object.QuestionID].questions=new Array();
  questionData[object.QuestionID].questionName=(object.QuestionName||object.QuestionID);
  for(var i=0;i<object.question.length;i++){
   questionData[object.QuestionID].questions.push(object.question[i]);
  }
 }else{
  alert(fileName+":そのファイルは読み込みました\nQuestionData ID:"+object.QuestionID);
  return false;
 }

 //questionIDListに問題名を追加
 var name=object.QuestionName||object.QuestionID;
 $(document.createElement("div")).addClass("checkbox").append(
   $(document.createElement("label")).append(
    $(document.createElement("input")).attr("type","checkbox").attr("value",object.QuestionID)
    ).append(name).append("("+object.question.length+"問)")
   ).appendTo("#questionIDList");
}

//出題する問題を作成する
function createQuestionList(length,option){
 //問題の個数を取得する
 var allLen=0;
 //length以下ならId
 var lenIdList=new Array();
 var idLenghtClass=function(id,length){
  this.id=id;
  this.length=length;
 };

 //実際のデータ(QuestionClass)
 var questionList=new Array();

 //addに含まれている問題IDをlenIdListに
 for(var i=0;i<option.add.length;i++){
  var id=option.add[i];
  if(questionData[id]!==void(0)){
   allLen+=questionData[id].questions.length;
   lenIdList.push(new idLenghtClass(id,allLen) );
  }
 }

 if(length>allLen){
  makeAlert("問題のデータが足りません");
  return void(0);
 }

 //ユニークな数値のリストを作成する
 var qIdList=(function(len,max){
  var tmp=new Array(max);
  var ret=new Array(len);

  for(var i=0;i<max;i++){
   tmp[i]=i;
  }

  for(var i=0;i<len;i++){
   var id=Math.floor(Math.random()*tmp.length);
   ret[i]=tmp[id];
   tmp.splice(id,1);
  }

  return ret;
 })(length,allLen);

 //lenIdListのiを返す
 var getId=function(qNum){
  var id=0;
  for(var i=0;i<lenIdList.length;i++){
   if(qNum<lenIdList[i].length){
    id=i;
    break;
   }
  }
  return id;
 };
 for(var i=0;i<qIdList.length;i++){
  var id=getId(qIdList[i]);
  if(id===void(0)){
   makeAlert("Something wrong");
   return void(0);
  }
  questionList.push(new QuestionClass(lenIdList[id].id,qIdList[i]-((id==0)?0:lenIdList[id-1].length)));
 }

 return questionList;
}

//グローバルオブジェクト

//全ての問題データ一覧
//連想配列
//questionData[ID].question[Number];
//で問題にアクセスできる
var questionData=new Object();

// 読み込んだデータ
var addedDataID=new Array();

//セーブするデータ
var userData={
 userName:"",
 wrongAnswerData:(new Array())
};

//実際にテスト時に使う物
var testingData={
 questionList:[],
 questionCurrentNumber:0,
 wrongAnswerList:[]
}

//開始時の関数
function testStart(){
 //問題数
 var length=$("#questionNumber").val();
 var option={
  add:[]
 };
 if(length==""){
  length=10;
 }else{
  length=parseInt(length,10);
 }
 if(length<1){
  makeAlert("問題数が1以下です");
  return false;
 }
 //使用する問題を取得
 var checkedList=$("#questionIDList input:checked");
 if(checkedList.length<1){
  makeAlert("最低一つは問題を指定してください");
  return false;
 }
 for(var i=0;i<checkedList.length;i++){
  option.add.push(checkedList.eq(i).val());
 }

 testingData.questionList=createQuestionList(length,option);
 if(testingData.questionList===void(0)){
  return false;
 }
 testingData.questionCurrentNumber=0;
 //間違っている問題のリストを空に
 testingData.wrongAnswerList.length=0;

 //progressbarの設定
 $("#answerProgress .progress .progress-bar").attr("aria-valuemax",testingData.questionList.length).attr("aria-valuenow",0).css('width',""+0+'%').text(""+0+"/"+testingData.questionList);

 $("#testSetting").slideUp();
 $("#testDisplay").slideDown();
 displayQuestion();
}

function makeAlert(messages){
 alert(messages);
}

function displayQuestion(){
 var number=testingData.questionCurrentNumber;
 var data=testingData.questionList[number];
 var objData=questionData[data.id].questions[data.number];
 $("#question").text(objData.questionSentence);
 //$("#answer")の中のinputを全て空に
 $("#answer input").each(function(){
  $(this).val("");
 });
 //progress表示
 $("#answerProgress .progress .progress-bar").text(""+(number+1)+"/"+testingData.questionList.length).attr("aria-valuenow",(number+1)).css('width',""+((number+1)/testingData.questionList.length*100)+"%");

 //フォーカス
 $("#answer input").eq(0).focus();
}

function checkAnswer(){
 var inputs=$("#answer input");
 var answer=inputs.val();
 var qIdData=testingData.questionList[testingData.questionCurrentNumber];
 var qData=questionData[qIdData.id].questions[qIdData.number];
 console.log(qData.answer);
 if(answer!=qData.answer){
  console.log("Wrong");
  testingData.wrongAnswerList.push(new MistookQuestionData(testingData.questionCurrentNumber,answer));
 }
 
 testingData.questionCurrentNumber++;
 //もし終わってたら結果表示
 if(testingData.questionList.length>testingData.questionCurrentNumber){
  displayQuestion();
 }else{
  testEnd();
 }
}

function testEnd(){
 $("#testDisplay").slideUp();
 var table=$("#testResult>table");
 var tbody=table.children("tbody");
 if(testingData.wrongAnswerList.length==0){
  $("#testResultPerfect").css("display","block");
 }else{
  //tableを空に
  tbody.empty();
  //間違えた問題表示
  $.each(testingData.wrongAnswerList,function(index,object){
    var qIdData=testingData.questionList[object.number];
    console.log(qIdData);
    var qData=questionData[qIdData.id].questions[qIdData.number];
    var qName=questionData[qIdData.id].questionName;
    var tableRow=$(document.createElement('tr')).append(
     $(document.createElement('td')).text(qName)
    ).append(
     $(document.createElement('td')).text(qIdData.number)
    ).append(
     $(document.createElement('td')).text(qData.questionSentence)
    ).append(
     $(document.createElement('td')).text(qData.answer)
    ).append(
     $(document.createElement('td')).text(object.answer)
    ).appendTo(tbody);
  });
  table.css("display","table");
 }
 $("#testResult").slideDown();
}

//終了から設定画面へ
function testSettingShow(){
 $("#testResult").slideUp(function(){
   $("#testResult>table").css("display","none");
   $("#testResultPerfect").css("display","none");
 });
 $("#testSetting").slideDown();
}

