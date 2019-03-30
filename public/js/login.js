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
                password: $('#password').val()
            }
            return user
        }

        $("#login-user-form").submit(function (e) {
            e.preventDefault()
            var userCredentials = getCredentials()
            client.authenticate({
                strategy: 'local',
                email: userCredentials.email,
                password: userCredentials.password
            })
                .then((token) => {
                    window.location.href = `${serverurl}`
                })
                .catch((err) => {
                    $("#error-message")
                    .text(`Error login. ${err.message}`)
                    .show()
                })
        })


    }
)