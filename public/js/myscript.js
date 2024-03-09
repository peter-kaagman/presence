document.addEventListener("DOMContentLoaded", function() {
    console.log("Document loaded");
    let me = "";
    console.log(window.location.pathname);
    console.log('blaat');
    getMe();
    getGroepen();
    // Interval function to do a refresh
    setInterval( function(){
        console.log("refresh triggered");
        doRefresh();
    }, 1000 * 60 * 5);


    // Haal de Me dat op en maak de output
    function getMe(){
        console.log('getMe');
        fetch('/api/getMe')
        .then( res => {
            return res.json();
        })
        .then( data => {
            if (data.result == 'ok'){
                me = data.user_info.upn; // Global voor algemeen gebruik
                document.querySelector('#meName').textContent = data.user_info.displayName;
                document.querySelector('#meImage').setAttribute('src',`/api/getProfilePic/${data.user_info.upn}` );
                if (data.me){
                    //console.log("aanwezig",data.user_info.aanwezig)
                    let chkClass = cleanId('presence_' + data.user_info.upn);
                    let msgClass = cleanId('message_' + data.user_info.upn);
                    //console.log(`msgClass is ${msgClass}`)
                    document.querySelector('#meMessage').innerHTML = `<input type="text" id="edMeMessage" class="${msgClass}" wat="opmerking" upn="${data.user_info.upn}" value="${data.user_info.message}" org_value="${data.user_info.message}">`;
                    document.querySelector('#meStickyMessage').setAttribute('upn', data.user_info.upn);
                    document.querySelector('#meStickyMessage').setAttribute('wat', 'sticky_opmerking');
                    document.querySelector('#mePresence').setAttribute('upn', data.user_info.upn);
                    document.querySelector('#mePresence').setAttribute('wat', 'timestamp_aanwezig');
                    document.querySelector('#mePresence').classList.add(chkClass);
                    console.log(data);
                    // Set Presence
                    if(data.user_info.aanwezig == 1){
                        console.log("aanwezig");
                        document.querySelector('#meImage').classList.remove('afwezig');
                        document.querySelector('#meImage').classList.add('aanwezig');
                        document.querySelector('#mePresence').checked = true;
                        //document.querySelector('#mePresence').classList.add('aanwezig');
                    }else{
                        //console.log("afwezig");
                        document.querySelector('#meImage').classList.remove('aanwezig');
                        document.querySelector('#meImage').classList.add('afwezig');
                        document.querySelector('#mePresence').checked = false;
                        //document.querySelector('#mePresence').classList.add('afwezig');
                    }
                    // Set Sticky
                    if(data.user_info.sticky_message == 1){
                        //console.log("sticky");
                        document.querySelector('#meStickyMessage').checked = true;
                    }else{
                        //console.log("not sticky");
                        document.querySelector('#meStickyMessage').checked = false;
                    }
                    // Add eventlisteners on #edMeMessage
                    document.querySelector("#edMeMessage").addEventListener("keydown", handleMessageEdit, false);
                    document.querySelector("#edMeMessage").addEventListener("focusout", handleMessageEdit, false);
                    // Add eventlistener on #mePresence
                    document.querySelector("#mePresence").addEventListener("change", handlePresence, false );
                    // Add eventlistener on #meStickyMessage
                    document.querySelector("#meStickyMessage").addEventListener("change", handleMeStickyMessage, false );
                }else{
                    document.querySelector('#meMessage').textContent = `Jouw aanwezigheid wordt niet bijgehouden`;
                    document.querySelector('#mePresence').textContent = "";
                    document.querySelector('#collapseMe').classList.remove('show');
                }
            }else{
                window.location.replace('/about');
            }
        })
        .catch (err => {
            console.warn('getMe oeps', err);
        });
    }
    // Evenlistener voor edMessage, set dirty on keyup
    var handleMessageEdit = function(e){
        //console.log(e.type);
        if ( (e.keyCode == 13) || (e.type == 'focusout') ){
            if (e.target.classList.contains('dirty')){
                console.log("Enter of Focusout en is dirty");
                postData( { value: e.target.value, upn: e.target.getAttribute('upn'), wat: e.target.getAttribute('wat') })
                .then( (response) => {
                    if (response.ok){
                        e.target.classList.remove('dirty');
                        //console.log('Dit krijgen we terug');
                        //console.log(response); 
                        let msgClass = cleanId('message_' + e.target.getAttribute('upn'));
                        let newMsg = e.target.value;
                        //console.log(`msgClass: ${msgClass}, newMsg ${newMsg}`);
                        document.querySelectorAll('.'+msgClass).forEach((input) =>{
                            input.value = newMsg;
                        });
                    }
                });
            }
        }else{
            console.log("adding dirty");
            console.log(`keycode is ${e.keyCode}`);
            e.target.classList.add("dirty");
        }
    }
    // Evenlistener voor edMessage, set dirty on keyup
    var handlePresence = function(e){
        //console.log(e.type);
        //console.log(e.target);
        const targetMe = e.target.getAttribute('upn');
        // Alleen toestaan als de gebruiker het zelf is
        if (targetMe == me){
            // Set dirty
            console.log("setting dirty");
            e.target.classList.add('dirty');
            let value;
            if(e.target.checked){
                const date = new Date();
                value = date.toISOString().slice(0, 10);//.replace('T', ' ');
                value += ' ';
                value += date.toLocaleTimeString('nl-NL');
                document.querySelector('#meImage').classList.add('aanwezig');
                document.querySelector('#meImage').classList.remove('afwezig');
            }else{
                document.querySelector('#meImage').classList.add('afwezig');
                document.querySelector('#meImage').classList.remove('aanwezig');
                value = '00-00-00 00:00'
            }
            let upn = e.target.getAttribute('upn');
            postData( { value: value, upn: upn, wat:e.target.getAttribute('wat') })
            .then( (response) => {
                //console.log('Dit krijgen we terug');
                console.log(response); 
                if(response.ok){
                    // Cascade veranderingen
                    let chkClass = cleanId('presence_' + upn);
                    let newState = e.target.checked;
                    document.querySelectorAll('.'+chkClass).forEach((checkbox) =>{
                        checkbox.checked = newState;
                    });
                    let imgClass = cleanId(`gridImg_${upn}`);
                    document.querySelectorAll('.'+imgClass).forEach((img) => {
                        if (newState){
                            img.classList.add('aanwezig');
                            img.classList.remove('afwezig');
                        }else{
                            img.classList.add('afwezig');
                            img.classList.remove('aanwezig');
                        }
                    });
                }else{
                    // Herstel de checkbox
                    e.target.checked = !e.target.checked
                }
     
            });
            // Remove dirty
            console.log('removing dirty');
            e.target.classList.remove('dirty');
        }else{
            // Herstel de checkbox
            e.target.checked = !e.target.checked
        }
    }
    // Evenlistener voor MeStickyMessage
    var handleMeStickyMessage = function(e){
        // Alleen toestaan als de gebruiker het zelf is
        if (e.target.getAttribute('upn') == me){
            let value;
            if(e.target.checked){
                value = 1;
            }else{
                value = 0;
            }
            postData( { value: value, upn: e.target.getAttribute('upn'), wat: e.target.getAttribute('wat') })
            .then( (response) => {
                console.log('Dit krijgen we terug');
                console.log(response); 
                if(response.ok){
                    // Cascade veranderingen
                }else{
                    // Herstel de checkbox
                    e.target.checked = !e.target.checked
                }
            });
            doRefresh();
        }else{
            // Herstel de checkbox
            e.target.checked = !e.target.checked
        }
    }

    // Haal de groepen op en maak de grid
    function getGroepen(){
        console.log('getGroepen');
        fetch('/api/getGroepen')
        .then( res => {
            return res.json();
        })
        .then( data => {
            let accordionItems='';
            let show = "show";
            for (const [locatie, medewerkers] of Object.entries(data.groepen)){
                // Hier hebben we 1 of meerdere locatie en kunnen 
                // we accordion items gaan toevoegen
                accordionItems += 
                `
    <div class="accordion-item">
        <h2 class="accordion-header" id="heading_${locatie}">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_${locatie}" aria-expanded="true" aria-controls="collapse_${locatie}">
                Aanwezigheid groep ${locatie}
            </button>
        </h2>
        <div id="collapse_${locatie}" class="accordion-collapse collapse ${show}" aria-labelledby="heading_${locatie}" data-bs-parent="#accordionGroepen">
            <div class="accordion-body">
                `;
                // Start of a row
                accordionItems += `<div class="row">`;
                let colIndex = 0;
                // Itterate de medewerkers van de locatie
                for (const [index, medewerker] of Object.entries(medewerkers.medewerkers)){
                    // Medewerker in een col
                    //console.log(medewerker);
                    let aanwezigClass;
                    let checked;
                    if (medewerker.presence){
                        aanwezigClass = "aanwezig";
                        checked = 'checked'
                    }else{
                        aanwezigClass = "afwezig";  
                        checked = ''
                    }
                    let chkClass = cleanId('presence_' + medewerker.userPrincipalName);
                    let chkId = cleanId(`${locatie}gridPresence${medewerker.userPrincipalName}`);
                    let msgClass = cleanId('message_' + medewerker.userPrincipalName);
                    let msgId = cleanId(`${locatie}gridMessage${medewerker.userPrincipalName}`);
                    let imgClass = cleanId(`gridImg_${medewerker.userPrincipalName}`);
                    let readonly = 'readonly'
                    if (medewerker.userPrincipalName == me){
                        readonly = '';
                    }
                    accordionItems +=
                    `
    <div class="col-sm">
        <div id="card${medewerker.upn}" class="card flex-row">
            <img class="card-img-left example-card-img-responsive ${aanwezigClass} ${imgClass}" src="/api/getProfilePic/${medewerker.userPrincipalName}" height=75 width=75>
            <div class="card-body">
                <h4 class="card-title h5 h4-sm">${medewerker.displayName}</h4>
                <input type="text "id="${msgId}" wat="opmerking" upn="${medewerker.userPrincipalName}" class="gridEdit ${msgClass}" value='${medewerker.message}' org_value='${medewerker.message}' ${readonly}><br>
                <label class="switch">
                  <input id="${chkId}" class="gridCheckbox ${chkClass}" wat="timestamp_aanwezig" upn="${medewerker.userPrincipalName}" type="checkbox" ${checked} ${readonly}>
                  <span class="slider round"></span>
                </label>
            </div>
        </div>
    </div>
                    `;
                    colIndex++;
                    // Nieuwe row na 3 cols
                    if (colIndex == 3){
                        colIndex = 0;
                        accordionItems += `</div><div class="row">`;
                    }
                }
                // Sluit de laatste row
                accordionItems+= "</div>";
                accordionItems+=
                `
            </div>
        </div>
    </div>
                `;
                show = '';
            }
            document.querySelector('#accordionGroepen').innerHTML = accordionItems;
            // Change event handler op de grid checkboxen
            document.querySelectorAll(".gridCheckbox").forEach((checkbox) =>{
                //if (!checkbox.readOnly){
                    checkbox.addEventListener("change", handlePresence, false);
                //}
            });
            // Change event handler op de grid text inputs
            document.querySelectorAll(".gridEdit").forEach((input) =>{
                //if (!input.readOnly){
                    //console.log(`adding eventhandler ${input.getAttribute('upn')}`);
                    input.addEventListener("keydown", handleMessageEdit, false);
                    input.addEventListener("focusout", handleMessageEdit, false);
                //}
            });
        })
        .catch( err => {
            console.warn('Oeps getGroepen', err);
        });
    }

    // Refresh function
    // Lijkt erg op getGroepen, echter:
    // Status van elementen updaten, NIET opnieuw maken
    // Ook geen update als controll dirty is
    function doRefresh(){
        console.log('doRefresh');
        fetch('/api/getGroepen')
        .then( res => {
            return res.json();
        })
        .then( data => {
            //console.log(data);
            for (const [locatie, medewerkers] of Object.entries(data.groepen)){
                for (const [index, medewerker] of Object.entries(medewerkers.medewerkers)){
                    //console.log(`${locatie} => ${medewerker.userPrincipalName}`);
                    // Message controll
                    const messageId = cleanId(`${locatie}gridMessage${medewerker.userPrincipalName}`);
                    const message = document.querySelector(`#${messageId}`);
                    //console.log(message.classList.contains('dirty'));
                    if (!message.classList.contains('dirty')){
                        if (medewerker.message != message.value){
                            console.log('is verandert');
                            message.value = medewerker.message;
                            if (me == medewerker.userPrincipalName){
                                let meMessage = document.querySelector('#edMeMessage');
                                if (!meMessage.classList.contains('dirty')){
                                    meMessage.value = medewerker.message;
                                }
                            }
                        }
                    }
                    // SLider controll
                    const sliderId = cleanId(`${locatie}gridPresence${medewerker.userPrincipalName}`);
                    const slider = document.querySelector(`#${sliderId}`);
                    //console.log(message.classList.contains('dirty'));
                    if (!slider.classList.contains('dirty')){
                        //console.log(`${slider.checked} => ${medewerker.presence}`);
                        if (medewerker.presence != slider.checked){
                            console.log('is niet hetzelfde');
                            slider.checked = medewerker.presence;
                            if (me == medewerker.userPrincipalName){
                                let me = document.querySelector('#edMeMessage');
                                if (!me.classList.contains('dirty')){
                                    me.value = medewerker.message;
                                    if (me == medewerker.userPrincipalName){
                                        let mePresence = document.querySelector('#edMePresence');
                                        if (!mePresence.classList.contains('dirty')){
                                            mePresence.value = medewerker.message;
                                        }
                                    }
                                            
                                }
                            }
                            
                        }
                        
                    }
                    // Img presence syncen met slider
                    let imgClass = cleanId(`gridImg_${medewerker.userPrincipalName}`);
                    document.querySelectorAll('.'+imgClass).forEach((img) =>{
                        if (slider.checked){
                            img.classList.add('aanwezig');
                            img.classList.remove('afwezig');
                        }else{
                            img.classList.add('afwezig');
                            img.classList.remove('aanwezig');
                        }
                    });
                }

            }
        })
        .catch( err => {
            console.warn('Oeps doRefresh', err);
        });

    }

    // Remove . and @ uit ID
    function cleanId(id){
        //console.log(`Id voor ${id}`);
        let tmp = id.replaceAll(/\./gi,'_');
        tmp = tmp.replaceAll(/\@/gi, '_');
        //console.log(`Id na ${tmp}`);
        return tmp;
    }

    //Generic functie om data te posten
    async function postData(data = {}){
        //console.log("Dit is postData");
        //console.log('Data is ',data);
        //data.upn='blaat';
        const response = await fetch('/api/postData', {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
              "Content-Type": "application/json",
            },
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        });
        if (response.ok === true){
            return response;
        }else{
            alert(`Er gaat iets fout: ${response.statusText}`);
            return {
                ok: response.ok,
                status: response.status,
                statusText: response.statusText
            };
        }
    }
  });
