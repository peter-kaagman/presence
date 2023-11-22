document.addEventListener("DOMContentLoaded", function() {
    console.log("Document loaded");
    getMe();
    getGroepen();

    function getMe(){
        console.log('getMe');
        fetch('/api/getMe')
        .then( res => {
            return res.json();
        })
        .then( data => {
            console.log(data);
            if (data.result == 'ok'){
                document.querySelector('#meName').textContent = data.user_info.displayName;
                document.querySelector('#meImage').setAttribute('src',`/api/getProfilePic/${data.user_info.upn}` );
                if (data.me){
                    //console.log("aanwezig",data.user_info.aanwezig)
                    document.querySelector('#meMessage').innerHTML = `<input type="text" id="edMeMessage" wat="opmerking" upn="${data.user_info.upn}" value="${data.user_info.message}">`;
                    document.querySelector('#mePresence').setAttribute('upn', data.user_info.upn);
                    document.querySelector('#mePresence').setAttribute('wat', 'timestamp_aanwezig');
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
                postData( { value: e.target.value, upn: e.target.getAttribute('upn'), wat:e.target.getAttribute('wat') })
                .then( (response) => {
                    e.target.classList.remove('dirty');
                    console.log('Dit krijgen we terug');
                    console.log(response); 
                });
            }
        }else{
            console.log("adding dirty");
            console.log(e.keyCode);
            e.target.classList.add("dirty");
        }
    }
    // Evenlistener voor edMessage, set dirty on keyup
    var handlePresence = function(e){
        console.log(e.type);
        let value;
        if(e.target.checked){
            const date = new Date();
            value = date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes();
            document.querySelector('#meImage').classList.add('aanwezig');
            document.querySelector('#meImage').classList.remove('afwezig');
        }else{
            document.querySelector('#meImage').classList.add('afwezig');
            document.querySelector('#meImage').classList.remove('aanwezig');
            value = ''
        }
        postData( { value: value, upn: e.target.getAttribute('upn'), wat:e.target.getAttribute('wat') })
        .then( (response) => {
            console.log('Dit krijgen we terug');
            console.log(response); 
        });

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
        <button class="accordion-button" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#collapse_${locatie}" 
                aria-expanded="true" 
                aria-controls="collapse_${locatie}
        ">
        Aanwezigheid groep ${locatie}
        </button>
    </h2>
    <div id="collapse_${locatie}" 
        class="accordion-collapse collapse ${show}" 
        aria-labelledby="heading_${locatie}" 
        data-bs-parent="#accordionGroepen"
    >
        <div class="accordion-body">
                `;
                // Start of a row
                let rowToggle = "row_even";
                accordionItems += `<div class="row">`;
                let colIndex = 0;
                // Itterate de medewerkers van de locatie
                for (const [index, medewerker] of Object.entries(medewerkers.medewerkers)){
                    //console.log(medewerker);
                    // Medewerker in een col
                    //console.log(medewerker);
                    let aanwezigClass;
                    if (medewerker.presence){
                        aanwezigClass = "aanwezig";
                    }else{
                        aanwezigClass = "afwezig";
                    }
                    accordionItems +=
                  `
    <div class="col-sm">
        <div class="card flex-row">
            <img class="card-img-left example-card-img-responsive ${aanwezigClass}" 
                src="/api/getProfilePic/${medewerker.userPrincipalName}"
                height=75 width=75
            >
            <div class="card-body">
                <h4 class="card-title h5 h4-sm">${medewerker.displayName}</h4>
                <p class="card-text">${medewerker.message}</p>
            </div>
        </div>
    </div>
                    `;
                    colIndex++;
                    // Nieuwe row na 3 cols
                    if (colIndex == 3){
                        colIndex = 0;
                        if (rowToggle == 'row_even'){ rowToggle = 'row_odd';}else{ rowToggle = 'row_even';}
                        accordionItems += `</div><div class="row">`;
                    }
                }
                // Sluit de laatste row
                accordionItems+= "</div>";
                `
        </div>
    </div>
</div>
                `;
                show = '';
            }
            document.querySelector('#accordionGroepen').innerHTML = accordionItems;
        })
        .catch( err => {
            console.warn('Oeps getGroepen', err);
        });
    }

    async function postData(data = {}){
        console.log("Dit is postData");
        console.log('Data is ',data);
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
            return {
                ok: response.ok,
                status: response.status,
                statusText: response.statusText
            };
        }
    }
  });