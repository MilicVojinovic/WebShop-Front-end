import React from "react";
import { Redirect } from "react-router-dom";
import { removeTokenData } from "../../api/api";

interface UserLogoutPageState {
    done: boolean;
}

export class UserLogoutPage extends React.Component {
    state: UserLogoutPageState;

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
        removeTokenData('user');
        this.finished();
    }

    render() {
        if (this.state.done){
            return <Redirect to='/user/login/' />
        }

        return (
            <p>Logging out......</p>
        )


    }



}