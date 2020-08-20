import React from "react";
import { Container, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListAlt } from "@fortawesome/free-solid-svg-icons";
import CategoryType from "../../types/CategoryType";

interface CategoryPageProperties {
    match: {
        params: {
            cId: number; // the name of parameter in index.tsx Switch Route must be the same as here (cId = cId)
        }
    }
}

interface CategoryPageState {
    category?: CategoryType;
}

export default class CategoryPage extends React.Component<CategoryPageProperties> {

    state: CategoryPageState;

    constructor(props: Readonly<CategoryPageProperties>) {
        super(props);
        this.state = {};
    }

    render() {
        
        return (
            <Container>
                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon={faListAlt} />  {this.state.category?.name}
                        </Card.Title>
                        <Card.Text>
                            ... Here, we will have our articles ...
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Container>)
    }

    // works only with data from first mount
    componentWillMount() {
        this.getCategoryData();
    }

    // works with data after the first mount
    componentWillReceiveProps(newProperties : CategoryPageProperties){
        // check if new request match current request; 
        // if true return,no need to contact the server for same data
        
        if(newProperties.match.params.cId === this.props.match.params.cId){
            return;
        }
        this.getCategoryData();
    }

    private getCategoryData(){
        setTimeout(() => {
            // we simulate data here,or we can get it from some server....
            const data: CategoryType = {
                name: 'Category ' + this.props.match.params.cId,
                categoryId: this.props.match.params.cId,
                items: []
            };

            this.setState({
                category: data
            });
            
        }, 210);
    }
}