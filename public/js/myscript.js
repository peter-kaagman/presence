document.addEventListener("DOMContentLoaded", function() {
    console.log("Document loaded");
    let me = "";
    getMe();
    getGroepen();

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
                    // Ik heb een per gebruiker uniek klasse nodig voor de checkbox
                    // normaal gebruik ik de UPN daarvoor, echter:
                    // er mag echter geen @ in staan.
                    // Ik drop daarom de domein naam
                    let chkClass = 'presence' + data.user_info.upn.split('@')[0];
                    let msgClass = 'message_' + data.user_info.upn.replace('@','_');
                    // ik denk dat de punt ook niet kan
                    chkClass = chkClass.split('.')[0]+chkClass.split('.')[1];
                    msgClass = msgClass.replaceAll('.','_');
                    console.log(`msgClass is ${msgClass}`)
                    document.querySelector('#meMessage').innerHTML = `<input type="text" id="edMeMessage" class="${msgClass}" wat="opmerking" upn="${data.user_info.upn}" value="${data.user_info.message}" org_value="${data.user_info.message}">`;
                    document.querySelector('#mePresence').setAttribute('upn', data.user_info.upn);
                    document.querySelector('#mePresence').setAttribute('wat', 'timestamp_aanwezig');
                    document.querySelector('#mePresence').classList.add(chkClass);
                    console.log(data);
                    if(data.user_info.aanwezig == 1){
                        //console.log("aanwezig");
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
                    // Add eventlisteners on #edMeMessage
                    document.querySelector("#edMeMessage").addEventListener("keydown", handleMessageEdit, false);
                    document.querySelector("#edMeMessage").addEventListener("focusout", handleMessageEdit, false);
                    // Add eventlistener on #mePresence
                    document.querySelector("#mePresence").addEventListener("change", handlePresence, false );
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
                        let msgClass = 'message_' + e.target.getAttribute('upn').replace('@','_');
                        msgClass = msgClass.replaceAll('.','_');
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
            let value;
            if(e.target.checked){
                const date = new Date();
                value = date.toISOString();
                document.querySelector('#meImage').classList.add('aanwezig');
                document.querySelector('#meImage').classList.remove('afwezig');
            }else{
                document.querySelector('#meImage').classList.add('afwezig');
                document.querySelector('#meImage').classList.remove('aanwezig');
                value = ''
            }
            let upn = e.target.getAttribute('upn');
            postData( { value: value, upn: upn, wat:e.target.getAttribute('wat') })
            .then( (response) => {
                //console.log('Dit krijgen we terug');
                console.log(response); 
                if(response.ok){
                    // Syn beide checkboxen indien noodzakelijk
                    // Hier heb een per gebruiker uniek klasse nodig voor de checkbox
                    // normaal gebruik ik de UPN daarvoor, echter:
                    // er mag echter geen @ in staan.
                    // Ik drop daarom de domein naam
                    let chkClass = 'presence' + upn.split('@')[0];
                    // ik denk dat de punt ook niet kan
                    chkClass = chkClass.split('.')[0]+chkClass.split('.')[1];
                    let newState = e.target.checked;
                    document.querySelectorAll('.'+chkClass).forEach((checkbox) =>{
                        checkbox.checked = newState;
                    });
                }else{
                    // Herstel de checkbox
                    e.target.checked = !e.target.checked
                }
     
            });
            
        }else{
            // Herstel de checkbox
            e.target.checked = !e.target.checked
        }

    }

    
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
                    // Ik heb een per gebruiker unieke klasse nodig voor de checkbox
                    // normaal gebruik ik de UPN daarvoor, echter:
                    // er mag echter geen @ in staan.
                    // Ik drop daarom de domein naam
                    let chkClass = 'presence' + medewerker.userPrincipalName.split('@')[0];
                    // ik denk dat de punt ook niet kan
                    chkClass = chkClass.split('.')[0]+chkClass.split('.')[1];
                    let msgClass = 'message_' + medewerker.userPrincipalName.replace('@','_');
                    msgClass = msgClass.replaceAll('.','_');
                    let readonly = 'readonly'
                    if (medewerker.userPrincipalName == me){
                        readonly = '';
                    }
                    accordionItems +=
                    `
    <div class="col-sm">
        <div id="card${medewerker.upn}" class="card flex-row">
            <img class="card-img-left example-card-img-responsive ${aanwezigClass}" src="/api/getProfilePic/${medewerker.userPrincipalName}" height=75 width=75>
            <div class="card-body">
                <h4 class="card-title h5 h4-sm">${medewerker.displayName}</h4>
                <input type="text "id="${locatie}gridPresence${medewerker.userPrincipalName}" wat="opmerking" upn="${medewerker.userPrincipalName}" class="gridEdit ${msgClass}" value='${medewerker.message}' org_value='${medewerker.message}' ${readonly}><br>
                <label class="switch">
                  <input id="${locatie}gridPresence${medewerker.userPrincipalName}" class="gridCheckbox ${chkClass}" wat="timestamp_aanwezig" upn="${medewerker.userPrincipalName}" type="checkbox" ${checked} ${readonly}>
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
                if (!checkbox.readOnly){
                    checkbox.addEventListener("change", handlePresence, false);
                }
            });
            // Change event handler op de grid text inputs
            document.querySelectorAll(".gridEdit").forEach((input) =>{
                if (!input.readOnly){
                    console.log(`adding eventhandler ${input.getAttribute('upn')}`);
                    input.addEventListener("keydown", handleMessageEdit, false);
                    input.addEventListener("focusout", handleMessageEdit, false);
                }
            });
        })
        .catch( err => {
            console.warn('Oeps getGroepen', err);
        });
    }

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