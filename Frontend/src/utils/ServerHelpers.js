import { backendURL } from "./Config";

export const makeUnauthenticatedPOSTRequest = async (route , body) => {
    const responce = await fetch(backendURL + route , {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
        },
        body : JSON.stringify(body),
    });

    const formattedResponce = await responce.json();
    return formattedResponce;
}

export const makeAuthenticatedPOSTRequest = async (route , body) => {
    const token = getToken();

    const responce = await fetch(backendURL + route , {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            Authorization : `Bearer ${token}`
        },
        body : JSON.stringify(body),
    });

    const formattedResponce = await responce.json();
    return formattedResponce;
}

export const makeAuthenticatedGETRequest = async (route) => {
    const token = getToken();

    const responce = await fetch(backendURL + route , {
        method : "GET",
        headers : {
            "Content-Type" : "application/json",
            Authorization : `Bearer ${token}`
        },
    });

    const formattedResponce = await responce.json();
    return formattedResponce;
}

export const makeAuthenticatedDELETERequest = async (route) => {
    const token = getToken();

    const response = await fetch(backendURL + route, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
    });

    const formattedResponse = await response.json();
    return formattedResponse;
};


export const makeAuthenticatedPUTRequest = async (route, body, isFormData = false) => {
    const token = getToken();
    
    const headers = {
        Authorization: `Bearer ${token}`
    };
    
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }
    
    const response = await fetch(backendURL + route, {
        method: "PUT",
        headers,
        body: isFormData ? body : JSON.stringify(body)
    });
    
    return await response.json();
};

const getToken = () => {
    const accessToken = document.cookie.replace(
        /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
        "$1"
    );
    return accessToken;
};