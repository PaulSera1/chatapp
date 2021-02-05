class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            error: ''
        };
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
            url: 'login',
            type: 'POST',
            data: {
                password: this.state.password,
                email: this.state.email
            },
            success: function(response) {
                window.localStorage.setItem('jwt', response.token);
                location.href = 'http://localhost:8080/channels/dashboard';
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                return this.setState({error: 'invalid credentials'});
            }
        });
    }
    render() {
        return (
            <React.Fragment>
                <h1>Log In</h1>
                <form className="user-creation-form" onSubmit={this.handleSubmit}>
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
ReactDOM.render(<LoginForm />, root);
