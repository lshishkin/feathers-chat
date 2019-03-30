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
                        createdAt: 1
                    }
                }
            });


            messages = messages.data;
            length = messages.length;

            for (var i = 0; i < length; i++) {
                message = messages[i];
                html += new Message(message.text, message._id, message.userId).getMessageHtmlString();
            }

            $('#chat-area').append(html);

        };

        class Message {
            constructor(msgText, msgId, msgUserId = null) {
                this.msgText = msgText
                this.msgId=msgId
                this.msgUserId = msgUserId
            }

            getMessageHtmlString() {
                var deleteIconHtml = ``;

                if (this.msgUserId === client.get('userId')) {
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
                    <h4 class="media-heading">John Smith</h4>
                    <span class="comment-date">03-04-2016 10:43am</span>
                    <br><br>
                    ${this.msgText}
                </div>
            </div>
        `;

                return msgHtmlString;
            }

        }//end message class

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

            messagesService.on("removed",(message)=>{
                var msgId=message._id
                $(`.media[data-id="${msgId}"]`).remove()
            })

            $("#chat-area").on("click", ".delete-comment",function(){
                var msgId=$(this).closest(".media").attr("data-id")
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
                var msgText = message.text
                var msgId=message._id
                var msgUserId = message.userId
                var newMessage = new Message(msgText, msgId, msgUserId)

                $("#chat-area").append(newMessage.getMessageHtmlString());
                $('html,body').animate({ scrollTop: $(document).height() }, "slow")

            })



        }


    }
)