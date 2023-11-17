document.addEventListener("DOMContentLoaded", function() {
    console.log("Document loaded");
    getMe();

    function getMe(){
        fetch('/api/getMe')
        .then( res => {
            return res.json();
        })
        .then( data => {
            console.log(data);
            console.log(data.user_info.displayName);
            if (data.result == 'ok'){
                document.querySelector('#meName').textContent = data.user_info.displayName;
                document.querySelector('#meMessage').textContent = data.user_info.message;
                document.querySelector('#mePresence').textContent = data.user_info.aanwezig;
            }else{
                window.location.replace('/about');
            }
        })
        .catch (err => {
            console.warn('getMe oeps', err);
        });
    }
  });