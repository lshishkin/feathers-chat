$(document).ready(
    function () {
        var serverurl = "http://localhost:3030"

        /*
            Feathers boilerplate
        */

        var socket = io(serverurl)
        //initialize our feathers client application through socket.io
        var client = feathers()
        client.configure(feathers.socketio(socket))
        //use localstorage to store jwt
        client.configure(feathers.authentication({
            storage: window.localStorage
        }))

        //obtain users service
        var usersService = client.service('/users')

        /*
            Get user Credentials
        */
        function getCredentials() {
            var user = {
                email: $('#email').val(),
                password: $('#password').val(),
                username: $('#username').val(),
                isOnline: false
            }
            return user
        }

        /* 
             Handle form submittal
        */

        $('#new-user-form').submit(
            function(e){
                e.preventDefault()
                var userCredentials=getCredentials()
                console.log(userCredentials)

                //create a new user using the feathers client

                usersService.create(userCredentials)
                .then((res)=>{
                    console.log(res)
                    window.location.href=`${serverurl}/login.html`
                }).catch((err)=>{
                    $('#error-message')
                    .text(`There was an error! ${err}.`)
                    .show()
                })
            }
        )
    }
)