import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { ApiConfig } from '../config/api.config';

export default function api(
    path: string,
    method: 'get' | 'post' | 'patch' | 'delete',
    body: any | undefined,
) {
    return new Promise<ApiResponse>((resolve) => {

        const requestData = {
            method: method,
            url: path,
            baseURL: ApiConfig.API_URL,
            data: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken(),
            }
        }

        // response (res) is type of LoginInfoDto or some other Dto object,
        // depends on which front-end component is sending request 
        // to corresponding backend api
        axios(requestData)
            .then(res => responseHandler(res, resolve))
            .catch(async err => {

                if(err.response.status === 400){
                    const response: ApiResponse = {
                        status: 'error',
                        data: err.response.data.message
                    };

                    return  resolve(response);
                }

                // STATUS CODE 401 - Bad Token :
                // TODO : Refresh Token and retry
                // If we can't Refresh Token we must redirect user to Log In,
                // because Token and Refresh Token has expired
                if (err.response.status === 401) {

                    const newToken = await refreshToken();

                    if (!newToken) {
                        const response: ApiResponse = {
                            status: 'login',
                            data: null
                        };

                        return resolve(response);
                    }

                    saveToken(newToken);

                    requestData.headers['Authorization'] = getToken();

                    return await repeatRequest(requestData, resolve);
                }

                const response: ApiResponse = {
                    status: 'error',
                    data: err
                }
                resolve(response);
            });
    });
}

export interface ApiResponse {
    status: 'ok' | 'error' | 'login';
    data: any;
}

async function responseHandler(
    res: AxiosResponse<any>,
    resolve: (value?: ApiResponse) => void,
) {

    console.log('in responseHandler');
     
    if (res.status < 200 || res.status >= 300) {

        console.log('in if (res.status < 200 || res.status >= 300)');
        const response: ApiResponse = {
            status: 'error',
            data: res.data
        };

        return resolve(response);
    }
 
    // everything went OK
    const response : ApiResponse = {
        status : 'ok',
        data: res.data
    }

    return resolve(response);
}




function getToken(): string {
    const token = localStorage.getItem('api_token')
    return 'Bearer ' + token;
}

export function saveToken(token: string) {
    localStorage.setItem('api_token', token);
}

function getRefreshToken(): string {
    const token = localStorage.getItem('api_refresh_token')
    return token + '';
}

export function saveRefreshToken(token: string) {
    localStorage.setItem('api_refresh_token', token);
}


async function refreshToken(): Promise<string | null> {

    const path = 'auth/user/refresh';

    const data = {
        token: getRefreshToken()
    };

    const refreshTokenRequestData: AxiosRequestConfig = {
        method: 'post',
        url: path,
        baseURL: ApiConfig.API_URL,
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }

    // rtr = Refresh Token Response
    const rtr: { data: { token: string | undefined } } = await axios(refreshTokenRequestData);
    if (!rtr.data.token) {
        return null;
    }

    return rtr.data.token;

}

async function repeatRequest(
    requestData: AxiosRequestConfig,
    resolve: (value?: ApiResponse) => void
) {
    // send a request with request data
    axios(requestData)
        // res (response) has arrived 
        .then(res => {

            let response: ApiResponse;

            // if res.status === 401 we redirect client to Log in page
            if (res.status === 401) {
                response = {
                    status: 'login',
                    data: null
                };
                // if res.status is not === 401 everything is ok,
                // and client can continue to use the app
            } else {
                response = {
                    status: 'ok',
                    data: res
                };
            }

            return resolve(response);

        })
        // if there is communication error or server is not found...
        // we tell client that there is a error 
        .catch(err => {
            const response: ApiResponse = {
                status: 'error',
                data: err
            }
            resolve(response);
        })
}
