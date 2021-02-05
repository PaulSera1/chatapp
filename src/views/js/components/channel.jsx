const { Component } = React;

function Channel(props) {
    return (
        <div className="channel-view">
             <h2><a href={props.data.ChannelId}>{props.data.name}</a></h2>
            <p>{props.data.ChannelId}</p>
        </div>
    );
}
