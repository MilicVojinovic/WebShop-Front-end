import React from "react";
import { Redirect } from "react-router-dom";
import { removeTokenData } from "../../api/api";

interface AdministratorLogoutPageState {
    done: boolean;
}

export class AdministratorLogoutPage extends React.Component {
    state: AdministratorLogoutPageState;

    constructor(props: Readonly<{}>) {
        super(props);

        this.state = {
            done: false,
        }
    }

    finished() {
        this.setState({
            done: true,
        })
    }

    componentDidMount(){
      this.doLogout();
    }

    componentDidUpdate(){
        this.doLogout();
      }

    private doLogout(){
        removeTokenData('administrator');
        this.finished();
    }

    render() {
        if (this.state.done){
            return <Redirect to='/administrator/login/' />
        }

        return (
            <p>Logging out......</p>
        )


    }



}