import Storage from './Storage';
export default class Http {
    constructor(){
        this._transformError = this._transformError.bind(this);
    }
    static async get(url) {
        const token = await Storage.getItem('token');
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const statusOk = response.ok;
        response = await response.json();
        if (!statusOk) {
            Http._transformError(response);
            throw new Error(response.message);
        }
        return response;
    }
    static async post(url, data) {
        const token = await Storage.getItem('token');
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: data
        });
        const statusOk = response.ok;
        response = await response.json();
        if (!statusOk) {
            Http._transformError(response);
            throw new Error(response.message);
        }
        return response;
    }
    static async put(url, data) {
        const token = await Storage.getItem('token');
        let response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: data
        });
        const statusOk = response.ok;
        response = await response.json();
        if (!statusOk) {
            Http._transformError(response);
            throw new Error(response.message);
        }
        return response;
    }
    static async delete(url) {
        const token = await Storage.getItem('token');
        let response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const statusOk = response.ok;
        response = await response.json();
        if (!statusOk) {
            Http._transformError(response);
            throw new Error(response.message);
        }
        return response;
    }
    static _transformError(response){
        let error = response.Errors;
        if (error) {
            let errorMessages = [];
            for (let errorProperty in error) {
                //if it's really error property
                if (error.hasOwnProperty(errorProperty)) {
                    // if array, then iterate
                    if (Array.isArray(error[errorProperty])) {
                        error[errorProperty].forEach(e => {
                            console.log(e);
                            errorMessages.push(`${errorProperty}:${e.message} \n\r`);
                        });
                    }
                    else errorMessages.push(error[errorProperty]);
                }
                throw new Error(errorMessages[0]);
            }
        }
    }
}
