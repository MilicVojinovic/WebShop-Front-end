import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { ApiConfig } from '../config/api.config';

export default function api(
    path: string,
    method: 'get' | 'post' | 'patch' | 'delete',
    body: any | undefined,
    role : 'user' | 'administrator' = 'user',
) {
    return new Promise<ApiResponse>((resolve) => {

        const requestData = {
            method: method,
            url: path,
            baseURL: ApiConfig.API_URL,
            data: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getToken(role),
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

                    const newToken = await refreshToken(role);

                    if (!newToken) {
                        const response: ApiResponse = {
                            status: 'login',
                            data: null
                        };

                        return resolve(response);
                    }

                    saveToken(role , newToken);

                    requestData.headers['Authorization'] = getToken(role);

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
      
    if (res.status < 200 || res.status >= 300) {

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




function getToken(role : 'user' | 'administrator'): string {
    const token = localStorage.getItem('api_token' + role)
    return 'Bearer ' + token;
}

export function saveToken(role : 'user' | 'administrator' , token: string) {
    localStorage.setItem('api_token' + role , token);
}

function getRefreshToken(role : 'user' | 'administrator'): string {
    const token = localStorage.getItem('api_refresh_token' + role)
    return token + '';
}

export function saveRefreshToken(role : 'user' | 'administrator' , token: string) {
    localStorage.setItem('api_refresh_token' + role, token);
}

export function saveIdentity(role : 'user' | 'administrator' , identity: string) {
    localStorage.setItem('api_identity' + role,identity );
}

export function getIdentity(role : 'user' | 'administrator'): string {
    const token = localStorage.getItem('api_identity' + role)
    return 'Bearer ' + token;
}


async function refreshToken(role : 'user' | 'administrator'): Promise<string | null> {

    const path = 'auth/' + role + '/refresh';

    const data = {
        token: getRefreshToken(role)
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
