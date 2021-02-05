class SignupForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            password: '',
            error: ''
        };
    }
    handleUsernameChange = event => {
        this.setState({
            username: event.target.value
        });
    }
    handleEmailChange = event => {
        this.setState({
            email: event.target.value
        });
    }
    handlePasswdChange = event => {
        this.setState({
            password: event.target.value
        });
    }
    handleSubmit = event => {
        event.preventDefault();
        $.ajax({
            url: 'validate',
            type: 'POST',
            data: {
                username: this.state.username,
                password: this.state.password,
                email: this.state.email,
                avatar: 'black.png'
            },
            success: function(data) {
                location.href = 'http://localhost:8080';
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                this.setState({
                    error: 'an error occurred'
                });
            }
        });
    }
    render() {
        return (
            <React.Fragment>
                <h1>Sign up</h1>
                <form className="user-creation-form" onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input onChange={this.handleUsernameChange} type="text" className="form-control" placeholder="Enter username" required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input onChange={this.handleEmailChange} type="email" className="form-control" placeholder="Enter email" required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input onChange={this.handlePasswdChange} type="password" className="form-control" placeholder="Password" required />
                    </div>
                    <p style={{color: "red"}}>{this.state.error}</p>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </React.Fragment>
        );
    }
}
var root = document.getElementsByClassName("user-form")[0];
ReactDOM.render(<SignupForm />, root);