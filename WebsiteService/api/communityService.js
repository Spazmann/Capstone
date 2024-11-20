const { callback } = require("chart.js/helpers");

const baseUrl = "https://qra76b4b67.execute-api.us-east-1.amazonaws.com/Prod/";

const createCommunity = async (callback, communityName, userId) => {
    try {
        const response = await fetch(`${baseUrl}communities/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ communityName, userId }),
        });

        const result = await response.json();

        if (response.ok) {
            callback(null, result);
        } else {
            const errorMessage = result.error || "Failed to create community";
            callback(new Error(errorMessage), null);
        }
    } catch (error) {
        callback(error, null);
    }
};

const editCommunityName = async (callback, communityId, newName) => {
    try {
        const response = await fetch(`${baseUrl}communities/${communityId}/editname`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ communityId, newName }),
        });

        const result = await response.json();

        if (response.ok) {
            callback(null, result);
        } else {
            const errorMessage = result.error || "Failed to edit community name";
            callback(new Error(errorMessage), null);
        }
    } catch (error) {
        callback(error, null);
    }
};

const editRole = async (callback, communityId, userId, add, roleType) => {
    try {
        const response = await fetch(`${baseUrl}communities/${communityId}/${roleType}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ communityId, userId, add }),
        });

        const result = await response.json();

        if (response.ok) {
            callback(null, result);
        } else {
            const errorMessage = result.error || `Failed to edit ${roleType}`;
            callback(new Error(errorMessage), null);
        }
    } catch (error) {
        callback(error, null);
    }
};

const editAdmins = async (callback, communityId, userId, add) => {
    return editRole(callback, communityId, userId, add, "admins");
};

const editMods = async (callback, communityId, userId, add) => {
    return editRole(callback, communityId, userId, add, "mods");
};

const editMembers = async (callback, communityId, userId, add) => {
    return editRole(callback, communityId, userId, add, "members");
};

const getAllCommunities = async (callback, page = 1, pageSize = 30) => {
    try {
        const response = await fetch(`${baseUrl}communities?page=${page}&pageSize=${pageSize}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (response.ok) {
            callback(null, result);
        } else {
            const errorMessage = result.error || "Failed to fetch communities";
            callback(new Error(errorMessage), null);
        }
    } catch (error) {
        callback(error, null);
    }
};

const getCommunityById = async (callback, communityId) => {
    try {
        const response = await fetch(`${baseUrl}communities/${communityId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (response.ok) {
            callback(null, result);
        } else {
            const errorMessage = result.error || "Community not found";
            callback(new Error(errorMessage), null);
        }
    } catch (error) {
        callback(error, null);
    }
};

const getCommunityByName = async (callback, communityName) => {
    try {
        const response = await fetch(`${baseUrl}communities/search?communityName=${encodeURIComponent(communityName)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (response.ok) {
            callback(null, result);
        } else {
            const errorMessage = result.error || "Community not found";
            callback(new Error(errorMessage), null);
        }
    } catch (error) {
        callback(error, null);
    }
};

module.exports = {
    createCommunity,
    editCommunityName,
    editAdmins,
    editMods,
    editMembers,
    getAllCommunities,
    getCommunityById,
    getCommunityByName,
};
