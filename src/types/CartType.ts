import { StringLiteral } from "typescript";

export default interface CartType  {
    cartId : number ;
    userId : number ;
    createdAt : string;
    user: string;
    cartArticles : {
        cartArticleId : number;
        articleId : number;
        quantity : number;
        article : {
            articleId : number;
            name : string;
            category : {
                categoryId : number;
                name : string;
            };
            articlePrices : {
                articlePriceId : number;
                createdAt : string;
                price : number;
            }[];
        }

    }[]
} 