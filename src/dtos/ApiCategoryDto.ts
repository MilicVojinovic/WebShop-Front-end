// data that we are getting from backend server api
export default interface ApiCategoryDto {
    categoryId: number;
    name: string;
    imagePath : string;
    parentCategoryId : number | null;
}