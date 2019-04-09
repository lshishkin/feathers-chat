$(document).ready(
    function () {
        var serverurl = "https://stark-wave-24634.herokuapp.com"

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

        //obtain messages service
        var messagesService = client.service('/messages')

        var populateMessagesOnPageLoad = async () => {
            var messages = null;
            var length = null;
            var html = ``;
            var message = null;

            var messages = await messagesService.find({
                query: {
                    $sort: {
                        createdAt: -1
                    }
                }
            });


            messages = messages.data.reverse();
            length = messages.length;

            for (var i = 0; i < length; i++) {
                message = messages[i];
                html += new Message(message).getMessageHtmlString();
            }

            $('#chat-area').append(html);

        };

        var populateUsersOnPageLoad = async () => {
            var users = null;
            var length = null;
            var html = ``;
            var user = null;

            var users = await usersService.find({
                query: {
                    isOnline:true
                }
            });


            users = users.data;
            length = users.length;

            for (var i = 0; i < length; i++) {
                user = users[i];
                if(!userIsDom(user._id)){
                    html += new User(user).getUserHtmlString();
                }
            }

            $('#users-window').append(html);

        };

        class Message {
            constructor( message ) {
                this.msgText   = message.text;
                this.msgUserId = message.userId;
                this.msgId     = message._id;
                this.createdAt = message.createdAt;
                this.username  = message.user.username;
            }
    
            getMessageHtmlString() {
                var deleteIconHtml = ``;
                var msgCreatedAt = new Date( this.createdAt ).toLocaleString();
    
                if( this.msgUserId === client.get('userId') ) {
                    deleteIconHtml = `
                        <div class="pull-right">
                            <span class="delete-comment" title="Delete Comment?"><i class="fa fa-times" aria-hidden="true"></i></span>
                        </div>
                    `;
                }
    
                var msgHtmlString = `
                    <div class="media" data-id="${this.msgId}">
                        <div class="media-left">
                            <a href="#">
                                <img src="https://www.iconexperience.com/_img/o_collection_png/green_dark_grey/512x512/plain/user.png" alt="64x64 user image" class="media-object" style="width: 64px; height: 64px;">
                            </a>
                        </div>
                        <div class="media-body">
                            ${deleteIconHtml}
                            <h4 class="media-heading">${this.username}</h4>
                            <span class="comment-date">${msgCreatedAt}</span>
                            <br><br>
                            ${this.msgText}
                        </div>
                    </div>
                `;
    
                return msgHtmlString;
            }
    
        }//end message class

        class User {
            constructor(user) {
                this._id = user._id;
                this.username = user.username;
            }

            getUserHtmlString() {
                var userHtmlString = `<div class="media user-name-object" data-id="${this._id}">
                <div class="media-left media-middle">
                  <a href="#">
                    <img src="https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/256x256/plain/user.png" alt="32X32 user image"
                      class="media-object" style="width:32px; height:32px">
                  </a>
                </div>
                <div class="media-body">
                  <h4 class="media-heading">${this.username}</h4>
                </div>
              </div>`;

                return userHtmlString;
            }

        }

        function userIsDom(userId) {
            if ($(`.user-name-object[data-id="${userId}"`).length) {
                return true
            } else { return false }
        }

        function removeUserFromDom(userId) {
            $(`.user-name-object[data-id="${userId}"`).remove()
        }

        function addUserDom(user) {
            var user = new User(user)
            var html = user.getUserHtmlString()
            $('#user-window').append(html)
        }

        client.authenticate()
            .then((response) => {

                return client.passport.verifyJWT(response.accessToken)

            }).then((payload) => {
                const { userId } = payload
                client.set('userId', userId)
                main()
            })
            .catch((err) => {
                window.location.href = `${serverurl}/login.html`
            })

        /**
 * Function runs all page load scripts after authentication is completed.
 */

        function main() {
            populateMessagesOnPageLoad()
            populateUsersOnPageLoad()

            messagesService.on("removed", (message) => {
                var msgId = message._id
                $(`.media[data-id="${msgId}"]`).remove()
            })

            $("#chat-area").on("click", ".delete-comment", function () {
                var msgId = $(this).closest(".media").attr("data-id")
                messagesService.remove(msgId)
            })

            $("#logout-icon").on("click", function () {
                client.logout()
                window.location.href = `${serverurl}/login.html`
            })

            /*
            create new message code
            */
            $("#submit-message-form").submit(function (e) {
                e.preventDefault();
                var $msgText = $("#msg-text");
                var msgText = $msgText.val();
                $msgText.val("");

                if (msgText.trim().length) {
                    messagesService.create({
                        text: msgText
                    }).catch((err) => {
                        alert('There was an error!')
                    })
                }
            })


            messagesService.on('created', (message) => {
                var newMessage = new Message(message)

                $("#chat-area").append(newMessage.getMessageHtmlString());
                $('html,body').animate({ scrollTop: $(document).height() }, "slow")

            })
            usersService.on('patch', user => {
                const userId = user._id
                const userName = user.userName
                if (user.isOnline === false) {
                    if (userIsDom(userId)) {
                        removeUserFromDom(userId)
                    }
                }
                if (user.isOnline === true) {
                    if (!userIsDom(userId)) {
                        addUserDom(user)
                    }
                }
            })


        }


    }
)