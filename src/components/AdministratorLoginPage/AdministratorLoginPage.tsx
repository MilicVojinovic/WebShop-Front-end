import React from "react";
import { Container, Card, Form, Button, Col, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import api, { ApiResponse, saveToken, saveRefreshToken, saveIdentity } from "../../api/api";
import { Redirect } from "react-router-dom";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";

interface AdministratorLoginPageState {
    username: string;
    password: string;
    errorMessage: string;
    isLoggedIn: boolean;
}

export class AdministratorLoginPage extends React.Component {

    state: AdministratorLoginPageState;

    constructor(props: Readonly<{}>) {
        super(props);

        this.state = {
            username: '',
            password: '',
            errorMessage: '',
            isLoggedIn: false,
        }
    }

    // setState props: username and password for current administrator
    private formInputChange(event: React.ChangeEvent<HTMLInputElement>) {

        // let newState: AdministratorLoginPageState = {
        //     username: '',
        //     password: ''
        // };

        // if (event.target.id === "username") {
        //     newState.username = event.target.value;
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
        api('auth/administrator/login/',
            'post',
            { username: this.state.username, password: this.state.password }
        ).then((res: ApiResponse) => {

            // check if api.ts sent error status  
            if (res.status === 'error') {
                this.setErrorMessage("System error... Try again");
                return;
            }

            // check if api.ts sent ok status 
            if (res.status === 'ok') {
                if (res.data.statusCode !== undefined) {
                    let message = '';
                    switch (res.data.statusCode) {
                        case -3001: message = 'Unknown username!'; break;
                        case -3002: message = 'Bad password!'; break;
                    }
                    this.setErrorMessage(message);
                    return;
                }

                // Log in went without issue,save token and refresh token in local storage,
                // change login state of Component to true
                saveToken('administrator', res.data.token);
                saveRefreshToken('administrator', res.data.refreshToken);

                saveIdentity('administrator', res.data.identity);

                // redirect administrator after successful login to homepage ...     /#/
                this.setLoginState(true);
            }
        });
    }



    render() {
        if (this.state.isLoggedIn === true) {
            return (<Redirect to="/administrator/dashboard" />);
        }

        return (
            <Container>

                <RoledMainMenu role='visitor' />
                <Col md={{ span: 6, offset: 3 }}>
                    <Card >
                        <Card.Body>
                            <Card.Title>
                                <FontAwesomeIcon icon={faSignInAlt} />  Administrator Login
                        </Card.Title>

                            <Form>
                                <Form.Group>
                                    <Form.Label htmlFor="username"> Username  </Form.Label>
                                    <Form.Control type="text" id="username"
                                        value={this.state.username}
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
                                className={this.state.errorMessage ? '' : 'd-none'}>
                                {this.state.errorMessage}
                            </Alert>
                        </Card.Body>
                    </Card>
                </Col>
            </Container>)

    }
}