import React from "react";
import { Nav, Container } from "react-bootstrap";
import { HashRouter, Link } from "react-router-dom";

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

// initial values for state items *
interface MainMenuProperties {
    items: MainMenuItem[];
}

// new values for items,set by setItems method ** 
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

        // const novaLista : MainMenuItem[] = [] ;
        // setInterval(() => {
            
        //     novaLista.push(new MainMenuItem("Naslov", "/link"));
        //     this.setItems(novaLista);
        // }, 2000);
    }

    // set new values for items ** 
    setItems(items: MainMenuItem[]) {
        this.setState({
            items: items,
        });
    }

    render() {
        return (
            <Container>
                <Nav variant="tabs">
                    <HashRouter>
                        {this.state.items.map(this.makeNavLink)}
                    </HashRouter>
                </Nav>
            </Container>
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