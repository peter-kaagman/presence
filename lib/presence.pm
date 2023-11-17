package presence;
use feature ":5.10";
use Dancer2;
use Dancer2::Plugin::Auth::OAuth;
use Dancer2::Plugin::Database;
use Dancer2::Session::YAML;
use LWP::UserAgent;
use JSON;
use URI::Encode qw(uri_encode);
use Data::Dumper;

our $VERSION = '0.1';
# Routes
get '/' => sub {
    my $session_data = session->read('oauth');
    my $groepen_data = session->read('locaties');
    if ($session_data->{'azuread'}{'login_info'}{'roles'}){
        # Medewerker en presence hier ophalen, anders is het niet op tijd aanwezig
        # Alleen de mederwerkers ophalen indien die nog niet in de sessie staan
        if (! $session_data->{'locaties'}){
            _getLocatieMedewerkers();
        }
        # Altijd de aanwezigheid checken
        _getPresence();
        template 'index' => { 
            'title' => 'presence',
        };
    }else{
        return redirect '/about';
    }
};

get '/about' => sub {
    template 'about' => { 'title' => 'presence' };
};
# Api routes
get '/api/getMe' => sub {
    my $user_data = session->read('oauth');
    my $result;
    if ( $user_data->{'azuread'}{'login_info'}{'roles'} ){
        $result->{'result'} = 'ok';
        # Me tonen?
        $result->{'me'} = 0;
        for (my $i=0; $i < @{ $user_data->{'azuread'}{'login_info'}{'roles'} }; $i++ ){
            $result->{'me'} = 1 if ($user_data->{'azuread'}{'login_info'}{'roles'}[$i] =~ /.*\.writer$/);
        }
        $result->{'user_info'}{'displayName'} = $user_data->{'azuread'}{'user_info'}{'displayName'};
        if ($result->{'me'}){
            $result->{'user_info'}{'aanwezig'} = $user_data->{'azuread'}{'user_info'}{'aanwezig'};
            $result->{'user_info'}{'message'} = $user_data->{'azuread'}{'user_info'}{'message'};

        }
    }else{
        $result->{'result'} = "geen groepen";
    }
    send_as JSON => $result, { content_type => 'application/json; charset=UTF-8' };
};
hook before => sub {
    my $session_data = session->read('oauth');
    my $provider = "azuread"; # Lower case of the authentication plugin used
    my $now = DateTime->now->epoch;
 
    if (
            (
                !defined $session_data || !defined $session_data->{$provider} || 
                !defined $session_data->{$provider}{id_token}
            ) && 
            request->path !~ m{^/auth}
        ) {
      return forward "/auth/$provider";
     } elsif (
            defined $session_data->{$provider}{refresh_token} && 
            defined $session_data->{$provider}{expires} && 
            $session_data->{$provider}{expires} < $now && 
            request->path !~ m{^/auth}
        ) {
      return forward "/auth/$provider/refresh";
     }

};
sub _getLocatieMedewerkers{
    my $session_data = session->read('oauth');
    # Ik moet een search string in elkaar zetten
    # een persoon kan op verschillende locaties zitten
    my $or_string = join "\' or naam Like \'", @{ $session_data->{'azuread'}{'login_info'}{'roles'} };
    $or_string = "\'". $or_string . "\'";
    my $qry = "Select * From locaties Where naam Like $or_string";
    #say $qry;
    my $sth = database->prepare($qry) or warn(database->errstr);
    $sth->execute();
    # Zoek per locatie de collega's erbij
    my %groups;
    #say "Medewerkers zoeken per gevonden locatie";
    while (my $row = $sth->fetchrow_hashref()){
        # Locatie naam moet zonder presence prefix en reader|write suffix
        $row->{'naam'} =~ /^presence\.(\w+)\..+/;
        my $group = $1;
        # Checken of de group al niet in de sessie staat
        # Kan dat de gebruiker writer en reader is
        if (! $groups{'locaties'}{$group}){
            say "Zoeken naar leden van $group";
            $groups{'locaties'}{$group}{'medewerkers'} = _findMedewerkers($row->{'group_staf'});
        }
    }
    $sth->finish;
    session->write(%groups) if %groups;
}
sub _findMedewerkers{
    my $group = shift;
    my @group_leden;
    say "We gaan op zoek naar $group";
    my $appCnf = setting('AppSettings');
    # Eerst de ID zoeken van de AU in kwestie
    # Ik moet filteren met "startswith"
    # er kunnen dus meerdere resultaten ziij
    my $url = $appCnf->{'GraphEndpoint'}."/v1.0/groups";
    $url .= "?\$filter=startswith(displayName,\'$group\')";
    $url .= "&\$select=displayName,id";
    #say $url;
    my @groups;
    _doGetItems($url,\@groups);
    my $group_id;
    # Zoek de group met de exacte match
    for my $item ( @groups){
        #say "Vergelijk ".$item->{'displayName'}." met $group";
        $group_id = $item->{'id'} if ($item->{'displayName'} eq $group);
    }
    # Return lege lijst indien de group niet gevonden is 
    return \@group_leden unless $group_id;
    $url = $appCnf->{'GraphEndpoint'}."/v1.0/groups/$group_id/members";
    $url .= '?$select=displayName,userPrincipalName';
    #say $url;
    _doGetItems($url,\@group_leden);
    # UPN moet lowercase zijn
    for (my $i=0; $i < @group_leden; $i++){
        #say "Is deze lowercase? ";
        $group_leden[$i]->{'userPrincipalName'} = lc($group_leden[$i]->{'userPrincipalName'});
    }
    my @sorted = sort{$a->{'displayName'} cmp $b->{'displayName'}} @group_leden;
    #say Dumper \@group_leden;
    #say Dumper \@sorted;
    return \@sorted;
}
sub _getPresence{
    my $locaties_data = session->read('locaties');
    my $oauth_data = session->read('oauth');
    # Medewerkers staan in $locaties_data
    # Presence ophalen vanuit de db
    my $qry = "Select * From medewerkers";
    my $sth = database->prepare($qry);
    $sth->execute();
    my $medewerkers_db = $sth->fetchall_hashref('upn');
    $sth->finish;
    #say "Medewerkers vanuit de db";
    #print Dumper $medewerkers_db;
    # Itterate de locaties_data 
    foreach my $locatie (keys %{$locaties_data}){
        # $locaties_data->{$locatie}{'medewerkers'} is een aoh
        for (my $i = 0; $i < @{$locaties_data->{$locatie}{'medewerkers'}}; $i++){
            my $upn = $locaties_data->{$locatie}{'medewerkers'}[$i]{'userPrincipalName'};
            if ($medewerkers_db->{$upn}){
                # Als de medewerker in de db staat
                # lees dan zijn presence
                $locaties_data->{$locatie}{'medewerkers'}[$i]{'presence'} = $medewerkers_db->{$upn}{'aanwezig'};
                $locaties_data->{$locatie}{'medewerkers'}[$i]{'message'} =  $medewerkers_db->{$upn}{'opmerking'};
                # Als dit ikzelf ben dan ook opnemen in user_info
                if ($upn eq lc($oauth_data->{'azuread'}{'login_info'}{'upn'})){
                    $oauth_data->{'azuread'}{'user_info'}{'aanwezig'} = $medewerkers_db->{$upn}{'aanwezig'};
                    $oauth_data->{'azuread'}{'user_info'}{'message'} = $medewerkers_db->{$upn}{'opmerking'};
                }
            }else{
                $locaties_data->{$locatie}{'medewerkers'}[$i]{'presence'} = 0;
                $locaties_data->{$locatie}{'medewerkers'}[$i]{'message'} =  "";
            }
        }
    }
}
# _doGetItem 
# Generieke recursive function om items te laden bij graph
# Indien er een nextLink is roept hij zichzelf aan.
# Geeft de items terug via de $items reference
sub _doGetItems {
        my $url = shift;
        my $items = shift;
        my $result = _callAPI($url, 'GET');
        if ($result->is_success){
                my $reply =  decode_json($result->decoded_content);
                if ($reply->{'value'}){
                    # Een lijst
                    # Stop ze stuk voor stuk in $items
                    while (my ($i, $el) = each @{$reply->{'value'}}) {
                            #print Dumper $el;
                            push @{$items}, $el;
                    }
                } else {
                    # Een enkel element
                    # Direct in $reply
                    push @{$items}, $reply;
                }
                if ($$reply{'@odata.nextLink'}){
                        _doGetItems($reply->{'@odata.nextLink'}, $items);
                }
        }else{
                print Dumper $result;
                die $result->status_line
        }
} 
#  _callAPI 
# Generieke functie om een request te sturen
sub _callAPI {
        my $url = shift;
        my $method = shift;
        my $content = shift || undef;
        my $session_data = session->read('oauth');
        my $provider = 'azuread';
        my $token = $session_data->{$provider}{access_token};
        my $ua = LWP::UserAgent->new(
                'send_te' => '0',
        );
        my $req = HTTP::Request->new();
        $req->method($method);
        $req->uri($url);
        $req->header('Accept'        => '*/*',            );
        $req->header('Authorization' => "Bearer $token", );
        $req->header('User-Agent'    => 'Perl/LWP',    );
        $req->header('Content-Type'  => 'application/json');
        if (defined $content){
          #say "====== content";
          #say $content;
          $req->content($content);
          $req->content_length(length($content));
          #say "=====request";
          #print Dumper $req;
        }
        my $result = $ua->request($req);
        return $result;
}

true;
