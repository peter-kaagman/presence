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
                if (data.me){
                    document.querySelector('#meMessage').innerHTML = 
                    `<input type="text" id="edMeMessage" value="${data.user_info.message}">
                    <button type="button" id="btnMeMessage">Ok</button>`;
                    document.querySelector('#mePresence').textContent = data.user_info.aanwezig;
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
                    accordionItems +=
                  `
    <div class="col-sm">
        <div class="card flex-row">
            <img class="card-img-left example-card-img-responsive" 
                src="/api/getProfilePic/${medewerker.userPrincipalName}"
                height=75 width=75
            >
            <div class="card-body">
                <h4 class="card-title h5 h4-sm">${medewerker.displayName}</h4>
                <p class="card-text">${medewerker.message}</p>
                <p class="card-text">${medewerker.presence}</p>
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
                accordionItems +=
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

  });