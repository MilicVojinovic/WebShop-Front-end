import React from "react";
import { Nav } from "react-bootstrap";
import { HashRouter, Link } from "react-router-dom";
import Cart from "../Cart/Cart";

export class MainMenuItem {
    // label on tab
    text: string = '';
    // link if we click on tab
    link: string = '#';

    constructor(text: string, link: string) {
        this.text = text;
        this.link = link;
    }
}


interface MainMenuProperties {
    items: MainMenuItem[];
    showCart? : boolean;
}


interface MainMenuState {
    items: MainMenuItem[];
}

export class MainMenu extends React.Component<MainMenuProperties> {

    state: MainMenuState;

    constructor(props: Readonly<MainMenuProperties>) {
        super(props);

        //  default state (in the beginning); get value from props *
        this.state = {
            items: props.items,
        };

    }

    // set new values for items ** 
    setItems(items: MainMenuItem[]) {
        this.setState({
            items: items,
        });
    }

    render() {
        return (
                <Nav variant="tabs">
                    <HashRouter>
                        {this.state.items.map(this.makeNavLink)}
                        {this.props.showCart ? <Cart /> : ''}
                    </HashRouter>
                </Nav>
        );
    }

    // for every main menu tab (item) set link and text 
    private makeNavLink(item: MainMenuItem) {
        return (
            <Link to= {item.link} className="nav-link">
                {item.text}
            </Link>

        );
    }
}