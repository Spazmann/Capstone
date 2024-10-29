const { callback } = require("chart.js/helpers");

const url = "https://4epsnoth44.execute-api.us-east-1.amazonaws.com/Prod/";

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

const createPost = async (callback, postData) => {
    try {
        const response = await fetch(`${url}CreatePost`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
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

module.exports = {
    createPost: createPost
}