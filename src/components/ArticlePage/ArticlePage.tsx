import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Container, Card, Col, Row } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import api, { ApiResponse } from "../../api/api";
import { ApiConfig } from "../../config/api.config";
import ApiArticleDto from "../../dtos/ApiArticleDto";
import AddToCartInput from "../AddToCartInput/AddToCartInput";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";

interface ArticlePageProperties {
    match: {
        params: {
            aId: number; // the name of parameter in index.tsx Switch Route must be the same as here (aId = aId)
        }
    }
}

interface FeatureData {
    name: string;
    value: string;
}

interface ArticlePageState {
    isUserLoggedIn: boolean;
    message: string;

    article?: ApiArticleDto;
    features: FeatureData[];

}



export default class ArticlePage extends React.Component<ArticlePageProperties> {
    state: ArticlePageState;

    constructor(props: Readonly<ArticlePageProperties>) {
        super(props);

        this.state = {
            isUserLoggedIn: true,
            message: '',
            features: [],
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

    private setArticleData(articleData: ApiArticleDto | undefined) {
        this.setState(Object.assign(this.state, {
            article: articleData,
        }));
    }

    private setFeatureData(features: FeatureData[]) {
        this.setState(Object.assign(this.state, {
            features: features,
        }));
    }

    // works only with data from first mount
    componentDidMount() {
        this.getArticleData();
    }

    // works with data after the first mount
    componentDidUpdate(oldProperties: ArticlePageProperties) {
        // check if new request match current request; 
        // if true return,no need to contact the server for same data

        if (oldProperties.match.params.aId === this.props.match.params.aId) {
            return;
        }
        this.getArticleData();
    }

    private getArticleData() {
        api('api/article/' + this.props.match.params.aId, "get", {})
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    return this.setLoginState(false);
                }

                if (res.status === 'error') {

                    this.setArticleData(undefined);
                    this.setFeatureData([]);
                    this.setMessage('This article does not exist!');

                    return;

                }

                const data: ApiArticleDto = res.data;

                this.setArticleData(data);

                const features: FeatureData[] = [];

                // find a name and value of each feature from this article                 
                for (const articleFeature of data.articleFeatures) {
                    const value = articleFeature.value;
                    let name = '';

                    for (const feature of data.features) {
                        if (feature.featureId === articleFeature.featureId) {
                            name = feature.name;
                            break;
                        }
                    }
                    // option one
                    // features.push({
                    //     name : name,
                    //     value : value,
                    // })

                    // option two
                    features.push({
                        name,
                        value,
                    })

                }


                this.setFeatureData(features);
            });
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


    render() {

        if (this.state.isUserLoggedIn === false) {
            return (<Redirect to="/user/login" />);
        }

        return (
            <Container>
                <RoledMainMenu role='user' />
                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon={faBoxOpen} />  {this.state.article?.name}
                        </Card.Title>

                        {this.printOptionalMessage()}

                        {
                            this.state.article ?
                                this.renderArticleData(this.state.article) : ""
                        }


                    </Card.Body>
                </Card>
            </Container>
        );
    }

    private renderArticleData(article: ApiArticleDto) {
        return (
            <Row>
                { /* Article description and features column */}
                <Col xs="12" lg="8">
                    <div className='excerpt'>
                        {article.excerpt}
                    </div>

                    <hr />

                    <div className='description'>
                        {article.description}
                    </div>

                    <hr />

                    <b>Features:</b> <br />

                    <ul>
                        {this.state.features.map(feature => (
                            <li>
                                {feature.name}:{feature.value}
                            </li>
                        ),
                            this)}
                    </ul>

                </Col>

                { /* Article photos and price column */}
                <Col xs="12" lg="4">
                    <Row>
                        <Col xs='12' className="mb-3">
                            <img alt={'Image - ' + article.photos[0].photosId}
                                src={ApiConfig.PHOTO_PATH + 'small/' + article.photos[0].imagePath}
                                className='w-100'
                            />
                        </Col>
                    </Row>
                    <Row>
                        {article.photos.slice(1)
                            .map(photo => (
                                <Col xs='12' sm='6'>
                                    <img alt={'Image - ' + photo.photosId}
                                        src={ApiConfig.PHOTO_PATH + 'small/' + photo.imagePath}
                                        className='w-100 mb-3'
                                    />
                                </Col>
                            ), this)}
                    </Row>

                    <Row>
                        <Col xs='12' className="text-center mb-3" >
                            <b>
                                Price : {Number(article.articlePrices[article.articlePrices.length - 1].price).toFixed() + ' EUR'}
                            </b>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs='12' className="mt-3" >
                            <AddToCartInput article={article} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }


}