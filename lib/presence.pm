package presence;
use Dancer2;
use Dancer2::Plugin::Auth::OAuth;
use Dancer2::Plugin::Database;
use Dancer2::Session::YAML;

our $VERSION = '0.1';

get '/' => sub {
    template 'index' => { 'title' => 'presence' };
};

hook before => sub {
    my $session_data = session->read('oauth');
    my $provider = "azuread"; # Lower case of the authentication plugin used
 
    my $now = DateTime->now->epoch;
 
    if ((!defined $session_data || !defined $session_data->{$provider} || !defined $session_data->{$provider}{id_token}) && request->path !~ m{^/auth}) {
      return forward "/auth/$provider";
 
    } elsif (defined $session_data->{$provider}{refresh_token} && defined $session_data->{$provider}{expires} && $session_data->{$provider}{expires} < $now && request->path !~ m{^/auth}) {
      return forward "/auth/$provider/refresh";
 
    }
};
true;
