#!/usr/local/bin/perl

use strict;
use warnings;
use utf8;

use JSON qw/encode_json decode_json/ ;
use Encode;

#問題<>回答

my ($tmp,$filename,$inputFileName,$metafile);
my %data=();
my @questionsList;
my $jsonStr;
my $flag=0;

$flag=( defined($ARGV[0]) && defined($ARGV[1]) );

if(!defined($ARGV[0])){
 print("Input File Name> ");
 $inputFileName=<STDIN>;
 chomp($inputFileName);
}else{
 $inputFileName=$ARGV[0];
}
open(FH,"< $inputFileName") || die("File Open Error");

if(! $flag ){
 print("Output File Name> ");
 $filename=<STDIN>; 
 chomp($filename);
 open(OUTFILE,">$filename") || die ("Cannot open $filename");
}

if(!defined($ARGV[1])){
 print("Metadata File Name> ");
 $metafile=<STDIN>;
 if(!(open(META,"< $metafile"))){
  print("METAFILE LOAD ERROR\n");
  print("INPUT MANUALLY\n");
  print("AUTHER NAME> ");
  $tmp=<STDIN>;
  chomp($tmp);
  $data{"Auther"}=$tmp;
  print("Question ID(string)> ");
  $tmp=<STDIN>;
  chomp($tmp);
  $data{"QuestionID"}=$tmp;
  print("Question Name> ");
  $tmp=<STDIN>;
  chomp($tmp);
  $data{"QuestionName"}=$tmp;
  print("This Question's version> ");
  $tmp=<STDIN>;
  chomp($tmp);
  $data{"version"}=$tmp;
  $data{"memo"}="備考";
 }else{
  my @text=<META>;
  my $str=join('',@text);
  $str=Encode::decode_utf8($str);
  my $metaData=decode_json($str);
  $data{"version"}=$metaData->{"version"};
  $data{"Auther"}=$metaData->{"Auther"};
  $data{"QuestionName"}=$metaData->{"QuestionName"};
  $data{"QuestionIDName"}=$metaData->{"QuestionIDName"};
  if(defined($metaData->{"memo"})){
   $data{"memo"}=$metaData->{"memo"};
  }else{
   $data{"memo"}="備考";
  }
 }
}

if(! $flag){
 print("FILE LOADING...\n");
}
while(my $line = <FH>){
 $line=Encode::decode_utf8($line);
 my ($question,$answer);
 my %questionData;
 my @tmp;

 chomp($line);
 @tmp=split(/<>/,$line,2);
 $questionData{"questionSentence"}=shift(@tmp);
 $questionData{"answer"}=shift(@tmp);
 push(@questionsList,\%questionData);
}
$data{"question"}=\@questionsList;
close(FH);

$jsonStr= encode_json(\%data);

if(! $flag){
 print OUTFILE $jsonStr;
 close(OUTFILE);
}else{
 print $jsonStr;
}
print("\n");

