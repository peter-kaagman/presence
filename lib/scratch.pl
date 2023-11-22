#! /usr/bin/env perl

use feature ":5.10";
use warnings;
use strict;
use Data::Dumper;
use DateTime;

sub _isToday {
    my $date = shift;
    my $dt = DateTime->now();
    my $today = $dt->ymd;
    say "Vandaag is: ".$today;
    say '$date is: '. $date;
    # check met een regex
    my $result = 0;
    $result = 1 if ($date =~ /^$today .*/);
    say "Result is: $result";
    return $result;
}

my $date = "2023-11-21 08:11";
say "Is $date vandaag?: ". _isToday($date);

if ( (1) && (_isToday($date))){
    say "Aanwezig"
}else{
    say "Afwezig";
}