#!/usr/local/bin/perl

use strict;
use warnings;
use utf8;

use JSON qw/encode_json/ ;

#問題<>回答

my ($tmp,$filename,$inputFileName);
my %data=();
my @questionsList;
my $jsonStr;

print("Input File Name> ");
$inputFileName=<STDIN>;
open(FH,"< $inputFileName") || die("File Open Error");

print("Output File Name> ");
$filename=<STDIN>; 
open(OUTFILE,">$filename")||die ("Cannot open $filename");

print("YOUR NAME> ");
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

print("FILE LOADING...\n");
while(my $line = <FH>){
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
print($jsonStr);

print("\n");

print OUTFILE $jsonStr;
close(OUTFILE);

