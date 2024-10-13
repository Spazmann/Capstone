const { callback } = require("chart.js/helpers");

const url = "https://h2xina3og7.execute-api.us-east-1.amazonaws.com/Prod/";

const getUser = async (callback, email, password) => {
    try {
        const response = await fetch(`${url}person/Login/${email}/${password}`, {
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

const updateUser = async (callback, userData, email) => {
    try {
        const response = await fetch(`${url}person/${email}`, {
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

module.exports = {
    getUser: getUser,
    addUser: addUser,
    updateUser: updateUser
}