const { Component, Fragment } = React;

class Panel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            channels: this.props.channels,
            user: this.props.user,
            error: ''
        };
    }
    triggerChange = event => {
        event.preventDefault();
        $(document.getElementById('avatar-change')).click();
    }
    changeAvatar = event => {
        var setState = this.setState.bind(this);
        event.preventDefault();
        var fd = new FormData();
        if(event.target.files.length > 0) {
            fd.append('avatar', event.target.files[0]);
        }
        $.ajax({
            url: 'http://localhost:8080/channels/dashboard',
            type: 'post',
            data: fd,
            contentType: false,
            processData: false,
            success: function(data) {
                $('#avatar')[0].src = `./../assets/${data.newAvatar}`;
                setState({
                    error: ''
                });
            },
            error: function(xhr, ajaxOptions, thrownError) {
                setState({
                    error: JSON.parse(xhr.responseText).error
                });
            }
        });
    }
    render() {
        return (
            <Fragment>
                <h1>Welcome {this.state.user.name}</h1>
                <img id="avatar" src={`./../../assets/${this.state.user.avatar}`} onClick={this.triggerChange} />
                <input type="file" id="avatar-change" style={{display: "none"}} onChange={this.changeAvatar} />
                <p style={{color: "red"}}>{this.state.error}</p>
                {this.state.channels.map(channel =>
                    <Channel key={channel.ChannelId} data={channel} />
                )}
            </Fragment>
        );
    }
}

var root = document.getElementById("root");
ReactDOM.render(<Panel channels={channels} user={user} />, root);