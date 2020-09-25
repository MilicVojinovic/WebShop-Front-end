import { faBoxOpen, faCartArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react"
import { Container, Card, Table, Modal, Button, Tab, Tabs } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import api, { ApiResponse } from "../../api/api";
import ApiOrderDto from "../../dtos/ApiOrderDto"
import CartType from "../../types/CartType";
import OrderType from "../../types/OrderType";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";

interface AdministratorDashboardOrderState {
    isAdministratorLoggedIn: boolean;
    cartVisible: boolean;
    orders: ApiOrderDto[];
    cart?: CartType;



}

export default class AdministratorDashboardOrder extends React.Component {

    state: AdministratorDashboardOrderState;

    constructor(props: Readonly<{}>) {
        super(props);

        this.state = {
            isAdministratorLoggedIn: true,
            cartVisible: false,
            orders: [],

        }


    }

    private setOrders(orders: ApiOrderDto[]) {
        this.setState(Object.assign(this.state, {
            orders: orders,
        }));
    }

    private setLoginState(isAdministratorLoggedIn: boolean) {
        const newState = Object.assign(this.state, {
            isAdministratorLoggedIn: isAdministratorLoggedIn
        });

        this.setState(newState);
    }

    private setCartVisibleState(state: boolean) {
        this.setState(Object.assign(this.state, {
            cartVisible: state
        }));
    }

    private setCartState(cart: CartType) {
        this.setState(Object.assign(this.state, {
            cart: cart
        }));
    }

    private hideCart() {
        this.setCartVisibleState(false);
    }

    private showCart() {
        this.setCartVisibleState(true);
    }


    private getLatestPriceBeforeDate(article: any, latestDate: any) {
        const cartTimeStamp = new Date(latestDate).getTime();

        let price = article.articlePrices[0];

        for (let ap of article.articlePrices) {
            const articlePriceTimeStamp = new Date(ap.createdAt).getTime();

            if (articlePriceTimeStamp < cartTimeStamp) {
                price = ap;
            } else {
                break;
            }
        }

        return price;
    }

    private calculateSum(): number {
        let sum: number = 0;

        if (!this.state.cart) {
            return sum;
        } else {

            for (const item of this.state.cart?.cartArticles) {

                let price = this.getLatestPriceBeforeDate(item.article, this.state.cart.createdAt);

                sum += price.price * item.quantity;
            }
        }

        return sum;
    }

    private setAndShowCart(cart: CartType) {
        this.setCartState(cart);
        this.showCart();
    }



    componentDidMount() {
        this.reloadOrders();
    }

    private changeStatus(orderId: number, newStatus: "rejected" | "accepted" | "shipped" | "pending") {
        api("/api/order/" + orderId, "patch", {
            newStatus
        }, "administrator")
            .then(async (res: ApiResponse) => {
                if (res.status === "login" || res.status === "error") {
                    this.setLoginState(false);
                    return;
                };

                this.reloadOrders();
            });
    }

    private reloadOrders() {
        api("/api/order", "get", {}, "administrator")
            .then(async (res: ApiResponse) => {
                if (res.status === "login" || res.status === "error") {
                    this.setLoginState(false);
                    return;
                };

                const data: ApiOrderDto[] = res.data;

                this.setOrders(data);
            });
    }

    private renderOrders(withStatus: "rejected" | "accepted" | "shipped" | "pending") {
        return (
            <Table hover size='sm' bordered>
                <thead>
                    <tr>
                        <th className="text-right  pr-2">OrderId</th>
                        <th>Date</th>
                        <th>Cart</th>
                        <th>Options</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.orders
                        .filter(order => (order.status === withStatus))
                        .map(order => (
                            <tr>
                                <td className="text-right pr-2">{order.orderId}</td>
                                <td>{order.createdAt.substring(0, 10)}</td>
                                <td>
                                    <Button size="sm" variant="primary"
                                        onClick={() => this.setAndShowCart(order.cart)}>
                                        <FontAwesomeIcon icon={faBoxOpen} />
                                    </Button>
                                </td>
                                <td>{this.printStatusChangeButtons(order)}</td>

                            </tr>
                        ), this)}
                </tbody>
            </Table>
        );
    }



    render() {

        if (this.state.isAdministratorLoggedIn === false) {
            return (<Redirect to="/administrator/login" />);
        }

        const sum = this.calculateSum();

        return (
            <Container>
                <RoledMainMenu role='administrator' />
                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon={faCartArrowDown} /> Orders
                        </Card.Title>

                        <Tabs defaultActiveKey='pending' id="order-tabs" className='ml-0 mb-0'>
                            <Tab eventKey="pending" title="Pending">
                                {this.renderOrders("pending")}
                            </Tab>
                            <Tab eventKey="accepted" title="Accepted">
                                {this.renderOrders("accepted")}
                            </Tab>
                            <Tab eventKey="shipped" title="Shipped">
                                {this.renderOrders("shipped")}
                            </Tab>
                            <Tab eventKey="rejected" title="Rejected">
                                {this.renderOrders("rejected")}
                            </Tab>
                        </Tabs>



                    </Card.Body>
                </Card>

                {/* Modal for content of each order  */}
                <Modal size='lg' centered show={this.state.cartVisible}
                    onHide={() => this.hideCart()} >
                    <Modal.Header closeButton>
                        <Modal.Title>Order content</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table hover size="sm">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Article</th>
                                    <th className="text-right">Quantity</th>
                                    <th className="text-right">Price</th>
                                    <th className="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.cart?.cartArticles.map(item => {
                                    const articlePrice = this.getLatestPriceBeforeDate(
                                        item.article,
                                        this.state.cart?.createdAt
                                    )

                                    return (
                                        <tr>
                                            <td>{item.article.category.name}</td>
                                            <td>{item.article.name}</td>
                                            <td className="text-right">{item.quantity}</td>
                                            <td className="text-right">
                                                {Number(articlePrice.price).toFixed(2)} EUR
                                            </td>
                                            <td className="text-right">
                                                {Number(articlePrice.price
                                                    * item.quantity).toFixed(2)} EUR
                                            </td>
                                        </tr>
                                    )
                                }, this)}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td className="text-right">
                                        <strong>Total: </strong>
                                    </td>
                                    <td className="text-right">{Number(sum).toFixed(2)} EUR</td>
                                </tr>
                            </tfoot>
                        </Table>
                    </Modal.Body>
                </Modal>


            </Container >
        );
    }

    private printStatusChangeButtons(order: OrderType) {
        if (order.status === "pending") {
            return (
                <>
                    <Button type='button' variant='primary' size='sm' className='mr-1' 
                    onClick={()=> this.changeStatus(order.orderId , "accepted")}>Accept</Button>
                    <Button type='button' variant='danger' size='sm'
                      onClick={()=>this.changeStatus(order.orderId , "rejected")}>Reject</Button>
                </>
            )
        }

        if (order.status === "accepted") {
            return (
                <>
                    <Button type='button' variant='primary' size='sm' className='mr-1'
                      onClick={()=>this.changeStatus(order.orderId , "shipped")}>Ship</Button>
                    <Button type='button' variant='secondary' size='sm'
                      onClick={()=>this.changeStatus(order.orderId , "pending")}>Return to Pending</Button>
                </>
            )
        }

        if (order.status === "shipped") {
            return (
                <>
                </>
            )
        }

        if (order.status === "rejected") {
            return (
                <>
                    <Button type='button' variant='secondary' size='sm'
                     onClick={()=>this.changeStatus(order.orderId , "pending")}>Return to Pending</Button>
                </>
            )
        }
    }
}



