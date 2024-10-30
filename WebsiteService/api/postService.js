const { callback } = require("chart.js/helpers");

const url = "https://07x4o7m31c.execute-api.us-east-1.amazonaws.com/Prod/";

const getPosts = async (callback, page = 1) => { 
    try {
        const response = await fetch(`${url}GetPosts?page=${page}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
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
    createPost: createPost,
    getPosts: getPosts
}