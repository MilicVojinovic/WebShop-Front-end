import React from "react";
import { Container, Card, Form, Button, Col, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import api, { ApiResponse, saveToken, saveRefreshToken } from "../../api/api";
import { Redirect } from "react-router-dom";

interface UserLoginPageState {
    email: string;
    password: string;
    errorMessage: string;
    isLoggedIn: boolean;
}

export class UserLoginPage extends React.Component {

    state: UserLoginPageState;

    constructor(props: Readonly<{}>) {
        super(props);

        this.state = {
            email: '',
            password: '',
            errorMessage: '',
            isLoggedIn: false,
        }
    }

    // setState props: email and password for current user
    private formInputChange(event: React.ChangeEvent<HTMLInputElement>) {

        // let newState: UserLoginPageState = {
        //     email: '',
        //     password: ''
        // };

        // if (event.target.id === "email") {
        //     newState.email = event.target.value;
        // } else {
        //     newState.password = event.target.value;
        // }

        const newState = Object.assign(this.state, {
            // in place in this.state : new value in that place in this.state
            [event.target.id]: event.target.value,
        });

        this.setState(newState);

       }

    private setErrorMessage(message: string) {
        const newState = Object.assign(this.state, {
            errorMessage: message
        });

        this.setState(newState);
    }

    private setLoginState(isLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isLoggedIn: isLoggedIn
        });

        this.setState(newState);
    }

    // when Log In button is clicked
    private doLogin() {
        api('auth/user/login/',
            'post',
            { email: this.state.email, password: this.state.password }
        ).then((res: ApiResponse) => {
                        
            if (res.status === 'error') {
                this.setErrorMessage("Invalid format of email or password");
                return;
            }

            if (res.status === 'ok') {
                if (res.data.statusCode !== undefined) {
                    let message = '';
                    switch (res.data.statusCode) {
                        case -3001: message = 'Unknown e-mail!'; break;
                        case -3002: message = 'Bad password!'; break;
                    }
                    this.setErrorMessage(message);
                    return;
                }

                // Log in went without issue,save token and refresh token in local storage,
                // change login state of Component to true
                saveToken(res.data.token);
                saveRefreshToken(res.data.refreshToken);
                
                // redirect user after successful login to homepage ...     /#/
                this.setLoginState(true);
            }
        });
    }



    render() {
        if (this.state.isLoggedIn === true) {
            return (<Redirect to = "/" />);
        }

        return (
            <Container>
                <Col md={{ span: 6, offset: 3 }}>
                    <Card >
                        <Card.Body>
                            <Card.Title>
                                <FontAwesomeIcon icon={faSignInAlt} />  User Login
                        </Card.Title>

                            <Form>
                                <Form.Group>
                                    <Form.Label htmlFor="email"> E-mail:  </Form.Label>
                                    <Form.Control type="email" id="email"
                                        value={this.state.email}
                                        onChange={event => this.formInputChange(event as any)} />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label htmlFor="password"> Password  </Form.Label>
                                    <Form.Control type="password" id="password"
                                        value={this.state.password}
                                        onChange={event => this.formInputChange(event as any)} />
                                </Form.Group>
                                <Form.Group>
                                    <Button variant="primary" onClick={() => this.doLogin()}>
                                        Log in
                                    </Button>
                                </Form.Group>
                            </Form>
                            <Alert variant="danger" 
                                className = {this.state.errorMessage ? '' : 'd-none'}>
                                {this.state.errorMessage}
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Container>)

    }
}