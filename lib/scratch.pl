#! /usr/bin/env perl

use feature ":5.10";
use warnings;
use strict;
use Data::Dumper;
my $cache_dir = './cache';

sub _sendProfilePic {
    my $file = shift;
    say "Sending profilePic: $file";
}

sub _getProfilePic {
    my $name = shift;
    say "Getting PIC $name";
    if(0){ # picGevonden
        say "Pic gevonden online";
        say "Storing pic ../cache/$name.jpg";
        say "Sending pic ..cache/$name.jpg";

    }else{
        say "Geen pic gevonden online";
        say "Sending Dummy";
        _sendProfilePic("../cache/dummy450x450.jpg");
    }
}

if (1){ # valid role
    my $now = time();
    my $name = 'p.kaagman@atascollege.nl';
    my $fn = "$cache_dir/$name.jpg";
    #my $info = stat($fn);
    #say Dumper $info;
    if(
        (-e $fn) && 
        ( (stat($fn))[9] > ( $now - (24*60*60) ) ) ){
        say "$fn gevonden";
        say "$fn ctime:",(stat($fn))[9];
        say "_sendProfilePic($fn)";
        _sendProfilePic($fn);
    }else{
        say "$fn niet gevonden";
        say "_getProfilePic($name)";
        _getProfilePic($name);
        
    }
}else{
    say "Sending dummy";
    _sendProfilePic("$cache_dir/dummy450x450.jpg");
}

