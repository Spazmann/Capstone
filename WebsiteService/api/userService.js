const { callback } = require("chart.js/helpers");

const url = "https://h2xina3og7.execute-api.us-east-1.amazonaws.com/Prod/";

const getUser = async (callback, username, password) => {
    try {
        const response = await fetch(`${url}Login/${username}/${password}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (response.ok) {
            if (result.body) {
                const data = JSON.parse(result.body);
                callback(null, data); 
            } else {
                callback(null, null); 
            }
        } else {
            if (result.body) {
                const errorData = JSON.parse(result.body);
                callback(new Error(errorData.error), null);
            } else {
                callback(new Error("Unknown error occurred"), null);
            }
        }
    } catch (error) {
        callback(error, null); 
    }
};

const addUser = async (callback, userData) => {
    try {
        const response = await fetch(`${url}CreateUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        callback(null, data);
    } catch (error) {
        callback(error, null);
    }
};

const updateUser = async (callback, userData, id) => {
    try {
        const response = await fetch(`${url}UpdateUser/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        callback(null, data);
    } catch (error) {
        callback(error, null);
    }
};

const checkUserEmail = async (callback, username, email) => {
    try {
        const response = await fetch(`${url}checkuseremail?username=${username}&email=${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (response.ok) {
            callback(null, result); 
        } else {
            const errorMessage = result.message || 'An error occurred';
            callback(new Error(errorMessage), null); 
        }
    } catch (error) {
        callback(error, null); 
    }
};

const findUser = async (username) => {
    try {
        const response = await fetch(`${url}FindUser/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (response.ok) {
            return result; 
        } else {
            if (result.body) {
                const errorData = JSON.parse(result.body);
                throw new Error(errorData.error);
            } else {
                throw new Error("Unknown error occurred");
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};

const findUserId = async (username) => {
    try {
        const response = await fetch(`${url}FindUserId/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (response.ok) {
            return result; 
        } else {
            if (result.body) {
                const errorData = JSON.parse(result.body);
                throw new Error(errorData.error);
            } else {
                throw new Error("Unknown error occurred");
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};

module.exports = {
    getUser: getUser,
    addUser: addUser,
    updateUser: updateUser,
    checkUserEmail: checkUserEmail,
    findUser: findUser,
    findUserId: findUserId
}