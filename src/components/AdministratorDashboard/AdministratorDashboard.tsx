

import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Redirect } from 'react-router-dom';
import api, { ApiResponse } from '../../api/api';

interface AdministratorDashboardState {
    isAdministratorLoggedIn: boolean;
}

class AdministratorDashboard extends React.Component {

    state: AdministratorDashboardState;

    constructor(props: Readonly<{}>) {
        super(props);

        this.state = {
            isAdministratorLoggedIn: true,
        }
    }

    componentWillMount() {
        this.getMyData();
    }

    componentWillUpdate() {
        this.getMyData();
    }

    private getMyData(){
        api('/api/administrator/' , 'get' , {} , 'administrator')
        .then((res: ApiResponse) => {
            if (res.status === "error" || res.status === "login") {
                this.setLoginState(false);
                return;
            };

            // ....
        });
    }


   
    private setLoginState(isAdministratorLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isAdministratorLoggedIn: isAdministratorLoggedIn
        });

        this.setState(newState);
    }

    render() {

        if (this.state.isAdministratorLoggedIn === false) {
            return (<Redirect to="/administrator/login" />);
        }


        return (
            <Container>
                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon={faHome} /> AdministratorDashboard
                        </Card.Title>
                        ...pera zdera
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    
}

export default AdministratorDashboard;
