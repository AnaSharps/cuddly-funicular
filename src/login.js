import React, { Component } from 'react';

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state ={
            logInPressed: false,
            usernameInput: null,
            passwordInput: null
        };
    }
    logInPressHandler = ()=> {
        this.setState({logInPressed: true,  });
    }
    render() {
        return (
            <>
                {!logInPressed && (
                    <>
                        <div>
                            <input placeholder='username' id='username' />
                            <input placeholder='password' type='password' id='password' />
                            <input type='submit' onClick={this.logInPressHandler} />
                        </div>
                    </>
                )}
                {logInPressed && (

                )}
            </>
        );
    }
};