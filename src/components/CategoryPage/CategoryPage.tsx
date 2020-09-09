import React from "react";
import { Container, Card, Col, Row, Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListAlt, faSearch } from "@fortawesome/free-solid-svg-icons";
import CategoryType from "../../types/CategoryType";
import api, { ApiResponse } from "../../api/api";
import ArticleType from "../../types/ArticleType";
import { Redirect, Link } from "react-router-dom";
import { ApiConfig } from "../../config/api.config";

interface CategoryPageProperties {
    match: {
        params: {
            cId: number; // the name of parameter in index.tsx Switch Route must be the same as here (cId = cId)
        }
    }
}

interface CategoryPageState {
    isUserLoggedIn: boolean;  // setLoginState
    category?: CategoryType;  // setCategoryData
    subcategories?: CategoryType[];  // setSubcategories
    articles?: ArticleType[];  // setArticles
    message: string;   // setMessage
    filters: {
        keywords: string;
        priceMinimum: number;
        priceMaximum: number;
        order: "name asc" | "name desc" | "price asc" | "price desc";

    };
}

// data that we are getting from backend server api for subcategory
interface ApiSubcategoryDto {
    categoryId: number,
    name: string,
}

// data that we are getting from backend server api for article search
interface ArticleDto {
    articleId: number;
    name: string;
    excerpt: string;
    description: string;
    articlePrices?: {
        price: number,
        createdAt: string
    }[];
    photos?: {
        imagePath: string;
    }[];
}

export default class CategoryPage extends React.Component<CategoryPageProperties> {

    state: CategoryPageState;

    constructor(props: Readonly<CategoryPageProperties>) {
        super(props);
        this.state = {
            isUserLoggedIn: true,
            message: "",
            filters: {
                keywords: '',
                priceMinimum: 0.01,
                priceMaximum: 100000,
                order: "price asc",
            }
        };
    }

    private setLoginState(isUserLoggedIn: boolean) {
        this.setState(Object.assign(this.state, {
            isUserLoggedIn: isUserLoggedIn
        }));
    }

    private setMessage(message: string) {
        this.setState(Object.assign(this.state, {
            message: message
        }));
    }

    private setCategoryData(category: CategoryType) {
        this.setState(Object.assign(this.state, {
            category: category
        }));
    }

    private setSubcategories(subcategories: CategoryType[]) {
        this.setState(Object.assign(this.state, {
            subcategories: subcategories
        }));
    }

    private setArticles(articles: ArticleType[]) {
        this.setState(Object.assign(this.state, {
            articles: articles,
        }));
    }

    render() {

        if (this.state.isUserLoggedIn === false) {
            return (<Redirect to="/user/login" />);
        }

        return (
            <Container>
                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon={faListAlt} />  {this.state.category?.name}
                        </Card.Title>
                        {this.printOptionalMessage()}

                        {this.showSubcategories()}

                        <Row>
                            <Col xs="12" md="4" lg="3">
                                {this.printFilters()}
                            </Col>
                            <Col xs="12" md="8" lg="9">
                                {this.showArticles()}
                            </Col>
                        </Row>


                    </Card.Body>
                </Card>
            </Container>)
    }

    // start
    // functions for render method
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    private setNewFilter(newFilter: any) {
        this.setState(Object.assign(this.state, {
            filter: newFilter,
        }))
    }

    private filterKeywordsChanged(event: React.ChangeEvent<HTMLInputElement>) {
        this.setNewFilter(Object.assign(this.state.filters, {
            keywords: event.target.value,
        }));

    }

    private filterPriceMinChanged(event: React.ChangeEvent<HTMLInputElement>) {
        this.setNewFilter(Object.assign(this.state.filters, {
            priceMinimum: Number(event.target.value),
        }));

    }

    private filterPriceMaxChanged(event: React.ChangeEvent<HTMLInputElement>) {
        this.setNewFilter(Object.assign(this.state.filters, {
            priceMaximum: Number(event.target.value),
        }));

    }

    private filterOrderChanged(event: React.ChangeEvent<HTMLSelectElement>) {
        this.setNewFilter(Object.assign(this.state.filters, {
            order: event.target.value,
        }));

    }

    // for Button event function no need to pass event as argument 
    private applyFilters() {
        this.getCategoryData();
    }

    private printFilters() {

        return (
            <>
                <Form.Group>
                    <Form.Label htmlFor="keywords">
                        Search keywords:
                    </Form.Label>
                    <Form.Control type="text" id="keywords" value={this.state.filters.keywords}
                        onChange={(e) => this.filterKeywordsChanged(e as any)} />
                </Form.Group>

                <Form.Group>
                    <Row>
                        <Col xs="12" sm="6">
                            <Form.Label htmlFor="priceMin">
                                Min. price:
                            </Form.Label>
                            <Form.Control
                                type="number" id="priceMin"
                                step="0.01" min="0.01" max="99999.99"
                                value={this.state.filters.priceMinimum}
                                onChange={(e) => this.filterPriceMinChanged(e as any)} />
                        </Col>
                        <Col xs="12" sm="6">
                            <Form.Label htmlFor="priceMax">
                                Max. price:
                            </Form.Label>
                            <Form.Control
                                type="number" id="priceMax"
                                step="0.01" min="0.02" max="100000"
                                value={this.state.filters.priceMaximum}
                                onChange={(e) => this.filterPriceMaxChanged(e as any)} />
                        </Col>
                    </Row>
                </Form.Group>

                <Form.Group>
                    <Form.Control as="select" id="sortOrder"
                        value={this.state.filters.order}
                        onChange={(e) => this.filterOrderChanged(e as any)}>
                        <option value="name asc">Sort by name - ascending</option>
                        <option value="name desc">Sort by name - descending</option>
                        <option value="price asc">Sort by price - ascending</option>
                        <option value="price desc">Sort by price - descending</option>

                    </Form.Control>
                </Form.Group>

                <Form.Group>
                    <Button variant="primary" block
                        onClick={() => this.applyFilters()}>
                        <FontAwesomeIcon icon={faSearch} /> Search
                    </Button>
                </Form.Group>



            </>
        )
    }

    private printOptionalMessage() {
        if (this.state.message === '') {
            return;
        }
        return (
            <Card.Text>
                {this.state.message}
            </Card.Text>
        )
    }

    private showSubcategories() {
        if (this.state.subcategories?.length === 0) {
            return;
        }

        return (
            <Row>
                {this.state.subcategories?.map(this.singleCategory)}
            </Row>
        );

    }

    private singleCategory(category: CategoryType) {
        return (
            <Col lg="3" md="4" sm="6" xs="12">
                <Card className="mb-3">
                    <Card.Body>
                        <Card.Title as="p">{category.name}</Card.Title>
                        <Link to={`/category/${category.categoryId}`}
                            className="btn btn-primary btn-block btn-sm" >
                            Open category
                            </Link>
                    </Card.Body>
                </Card>
            </Col>
        )
    }

    private showArticles() {
        if (this.state.articles?.length === 0) {
            return (
                <div>There are no articles in this category</div>
            );
        }

        return (
            <Row>
                {this.state.articles?.map(this.singleArticle)}
            </Row>
        );
    }

    private singleArticle(article: ArticleType) {
        return (
            <Col lg="4" md="6" sm="6" xs="12">
                <Card className="mb-3">
                    <Card.Header>
                        <img alt={article.name}
                            src={ApiConfig.PHOTO_PATH + 'small/' + article.imageUrl}
                            className="w-100" />
                    </Card.Header>
                    <Card.Body>
                        <Card.Title as="p">
                            <strong> {article.name}</strong>
                        </Card.Title>
                        <Card.Text>
                            {article.excerpt}
                        </Card.Text>
                        <Card.Text>
                            Price : {Number(article.price).toFixed(2)} EUR
                        </Card.Text>
                        <Link to={`/article/${article.articleId}`}
                            className="btn btn-primary btn-block btn-sm" >
                            Open article page
                            </Link>
                    </Card.Body>
                </Card>
            </Col>
        )
    }

    // end
    // functions for render method
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // works only with data from first mount
    componentDidMount() {
        this.getCategoryData();
    }

    // works with data after the first mount
    componentDidUpdate(oldProperties: CategoryPageProperties) {
        // check if new request match current request; 
        // if true return,no need to contact the server for same data

        if (oldProperties.match.params.cId === this.props.match.params.cId) {
            return;
        }
        this.getCategoryData();
    }


    private getCategoryData() {
        api('api/category/' + this.props.match.params.cId, "get", {})
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    return this.setLoginState(false);
                }

                if (res.status === 'error') {
                    return this.setMessage('Request error.Please try to refresh the page.');
                }

                const categoryData: CategoryType = {
                    categoryId: res.data.categoryId,
                    name: res.data.name,
                };

                this.setCategoryData(categoryData);

                const subcategories: CategoryType[] =
                    res.data.categories.map((category: ApiSubcategoryDto) => {
                        return {
                            categoryId: category.categoryId,
                            name: category.name
                        }
                    });

                this.setSubcategories(subcategories);

            });


        // search articles

        const orderParts = this.state.filters.order.split(' ');
            const orderBy = orderParts[0];
            const orderDirection = orderParts[1].toUpperCase();

        api('api/article/search', 'post', {
            categoryId: Number(this.props.match.params.cId),
            keywords: this.state.filters.keywords,
            priceMin: this.state.filters.priceMinimum,
            priceMax: this.state.filters.priceMaximum,
            features: [],
            orderBy: orderBy,
            orderDirection: orderDirection
        })
            .then((res: ApiResponse) => {

                if (res.status === 'login') {
                    return this.setLoginState(false);
                }

                if (res.status === 'error') {
                    return this.setMessage('Request error.Please try to refresh the page.');
                }

                if (res.data.statusCode === 0) {
                    this.setMessage('');
                    this.setArticles([]);
                    return;
                }

                const articles: ArticleType[] =
                    res.data.map((article: ArticleDto) => {
                        const object: ArticleType = {
                            articleId: article.articleId,
                            name: article.name,
                            excerpt: article.excerpt,
                            description: article.description,
                            imageUrl: "",
                            price: 0,
                        };

                        if (article.photos !== undefined && article.photos.length > 0) {
                            object.imageUrl = article.photos[article.photos.length - 1].imagePath;
                        }

                        if (article.articlePrices !== undefined && article.articlePrices.length > 0) {
                            object.price = article.articlePrices[article.articlePrices.length - 1].price;
                        }

                        return object;


                    });

                this.setArticles(articles);

            });
    };
}


