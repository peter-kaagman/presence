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
    # check met een regex
    return ($date =~ /^$today .*/);

}

my $date = "2023-11-21 08:11";
say "Is $date vandaag?: ". _isToday($date);