import React from "react";
import { Col,  Form, Row, Button } from "react-bootstrap";
import api, { ApiResponse } from "../../api/api";
import ArticleType from "../../types/ArticleType";

interface AddToCartInputProperties {
    article: ArticleType;
}

interface AddToCartInputState {
    quantity: number;
}

export default class  AddToCartInput extends React.Component<AddToCartInputProperties> {

    state: AddToCartInputState;

    constructor(props: Readonly<AddToCartInputProperties>) {
        super(props);

        this.state = {
            quantity: 1,
        }
    }

    private quantityChanged(event: React.ChangeEvent<HTMLInputElement>) {
        // No need for Object.assign function because we have only one property in the state!!! 
        this.setState({
            quantity: Number(event.target.value),
        })
    }

    private addToCart() {
        const data = {
            articleId: this.props.article.articleId,
            quantity: this.state.quantity,
        }

        api('api/user/cart/addToCart/', "post", data)
            .then((res: ApiResponse) => {
                if (res.status === 'error' || res.status === 'login') {
                    return;
                }

                const event = new CustomEvent('cart.update');
                window.dispatchEvent(event);

            });
    }

    render() {
        return (
                        <Form.Group>
                            <Row>
                                <Col xs="7">
                                    <Form.Control type="number" min="1"
                                        step="1" value={this.state.quantity}
                                         onChange = {(e) => this.quantityChanged(e as any)} />
                                </Col>
                                <Col xs="5">
                                    <Button variant="secondary" block
                                    onClick = { () => this.addToCart()}
                                    >Buy</Button>
                                </Col>
                            </Row>
                        </Form.Group>
        )
    }
}