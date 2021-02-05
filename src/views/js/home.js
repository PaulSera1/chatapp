function Message(content, jwt) {
    this.content = content;
    this.jwt = jwt;
    this.channelId = channel.id;
    this.room = channel.ChannelId
}

var cookies = document.cookie.split(/(?:;|=)/).map(function(item) { return item.trim() }).map(decodeURIComponent);

var jwt = cookies[cookies.indexOf('jwt') + 1];

var socket = io.connect('http://localhost:8080');

var messageForm = $('#message-form').first();

var editingMsg = false;
var editedMsgHash = null;
var uneditedMsg = null;

if(window.location.href[window.location.href.length - 1] === '/') {
    var tmp = window.location.href.substr(0, window.location.href.length - 1);
    window.location.replace(tmp);
}
var brokenUrl = window.location.href.split('/');

$(document).ready(function() {
    if($message)
        $('.middle').animate({
            scrollTop: $(`#${$message.hash}`).offset().top
        }, 1000);
    else $('.middle').scrollTop($('.middle')[0].scrollHeight);
});

$('.input').first().keypress(function(event) {
    switch(event.keyCode) {
        case 13:
            messageForm.submit();
            break;
        default:
            break;
    }
});

$(document).on('mouseenter', '.message', function(event) {
    $(this).css('background-color', '#292940');
    $(this).find('.delete-btn').css('display', 'inline');
    $(this).find('.edit-btn').css('display', 'inline');
});

$(document).on('mouseleave', '.message', function(event) {
    $(this).css('background-color', '#292929');
    $(this).find('.delete-btn').css('display', 'none');
    $(this).find('.edit-btn').css('display', 'none');
});

$(document).on('click', '.delete-btn', function(event) {
    var parentMessage = $(this).parents().eq(3);
    var hash = parentMessage.attr('id');
    socket.emit('message delete', {
        hash: hash,
        user: jwt,
        room: channel.ChannelId
    });
    parentMessage.remove();
});

$(document).on('click', '.edit-btn', function(event) {
    if(editingMsg) return;
    var parentMessage = $(this).parents().eq(3);
    var prevContent = $(parentMessage.children()[1]);
    $('.input').val(prevContent.html());
    $('#editing-bar').html('(editing)');
    $('.input').select();
    editingMsg = true;
    editedMsgHash = parentMessage.attr('id');
    uneditedMsg = prevContent.html();
});

function addMessage(message) {
    messages.push(message);
    var newHTML = `
        <p>
            <span><img class="avatar" src="/assets/${message.author.avatar}"></span>
            <span><strong>${message.author.username}</strong><span>
            <span class="message-date">${(new Date(message.date)).toLocaleTimeString()}</span>
            ${message.author.id === currentUser &&
                `<button class="delete-btn">Delete</button>
                 <button class="edit-btn">Edit</button>`
            }
        </p>
        <p class="message-content">${message.content}</p>
    `;
    $('#message-container').append(`
        <div class="message" id="${message.id}" data-author="${message.author.id}" style="padding: 5px;">
            ${newHTML}
        </div>`
    );
};

function removeMessage(hash) {
    for(var i = messages.length - 1; i > -1; i--)
        if(messages[i].id === hash) {
            messages.splice(i, 1);
            break;
        }
    $(`#${hash}`).remove();
}

function editMessage(hash, newContent) {
    for(var i = messages.length - 1; i > -1; i--)
        if(messages[i].id === hash) {
            messages[i].content = newContent;
            break;
        }
    $(`#${hash}`).find('.message-content').html(newContent);
    if($(`#${hash}`).find('.edited-msg').length) return;
    var dateMsg = $(`#${hash}`).find('.message-date');
    dateMsg.append(`
        <small class="edited-msg"><code>(edited)</code></small>
    `);
}

socket.on('connect', () => socket.emit('room', channel.ChannelId));
socket.on('chat message', msg => {
    addMessage(msg);
    $('.middle').animate({
        scrollTop: $('.middle')[0].scrollHeight
    }, 500);
});
socket.on('message delete', hash => {
    removeMessage(hash);
});
socket.on('edited message', msg => {
    editMessage(msg.hash, msg.newContent);
});

messageForm.on('submit', function(event) {
    event.preventDefault();
    if(editingMsg) {
        var [first] = Object.values(this).map(item => item.value);
        if(!first) return;
        uneditedMsg !== first && socket.emit('edited message', {
            hash: editedMsgHash,
            user: jwt,
            room: channel.ChannelId,
            newContent: first
        });
        this[0].value = '';
        editingMsg = false;
        editedMsgHash = null;
        uneditedMsg = null;
        $('#editing-bar').html('&nbsp');
    }
    else {
        var [first] = Object.values(this).map(item => item.value);
        if(!first) return;
        socket.emit('chat message', new Message(first, jwt));
        this[0].value = '';
    }
});