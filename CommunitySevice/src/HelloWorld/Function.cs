using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using HelloWorld.Models;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace HelloWorld
{
    public class Function
    {
        public async Task<APIGatewayProxyResponse> CreateCommunity(APIGatewayProxyRequest request, ILambdaContext context)
        {
            try
            {
                var input = JsonSerializer.Deserialize<Dictionary<string, string>>(request.Body);
                if (!input.ContainsKey("communityName") || !input.ContainsKey("userId"))
                {
                    return new APIGatewayProxyResponse
                    {
                        StatusCode = 400,
                        Body = JsonSerializer.Serialize(new { error = "communityName and userId are required" }),
                        Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                    };
                }

                var communityName = input["communityName"];
                var userId = input["userId"];

                var newCommunity = await CommunitiesDatabase.CreateCommunity(communityName, userId);

                return new APIGatewayProxyResponse
                {
                    StatusCode = 201,
                    Body = JsonSerializer.Serialize(new { message = "Community created successfully", Community = newCommunity }),
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
            catch (Exception ex)
            {
                LambdaLogger.Log($"Error in CreateCommunity: {ex}");
                return new APIGatewayProxyResponse
                {
                    StatusCode = 500,
                    Body = JsonSerializer.Serialize(new { error = ex.Message }),
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
        }

        public async Task<APIGatewayProxyResponse> EditCommunityName(APIGatewayProxyRequest request, ILambdaContext context)
        {
            try
            {
                var input = JsonSerializer.Deserialize<Dictionary<string, string>>(request.Body);
                if (!input.ContainsKey("communityId") || !input.ContainsKey("newName"))
                {
                    return new APIGatewayProxyResponse
                    {
                        StatusCode = 400,
                        Body = JsonSerializer.Serialize(new { error = "communityId and newName are required" }),
                        Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                    };
                }

                var communityId = input["communityId"];
                var newName = input["newName"];
                
                var success = await CommunitiesDatabase.EditCommunityName(communityId, newName);

                return new APIGatewayProxyResponse
                {
                    StatusCode = success ? 200 : 404,
                    Body = JsonSerializer.Serialize(new { message = success ? "Community name updated successfully" : "Community not found" }),
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
            catch (Exception ex)
            {
                LambdaLogger.Log($"Error in EditCommunityName: {ex}");
                return new APIGatewayProxyResponse
                {
                    StatusCode = 500,
                    Body = JsonSerializer.Serialize(new { error = ex.Message }),
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
        }

        public async Task<APIGatewayProxyResponse> EditAdmins(APIGatewayProxyRequest request, ILambdaContext context)
        {
            return await EditRole(request, context, "admins", CommunitiesDatabase.EditAdmins);
        }

        public async Task<APIGatewayProxyResponse> EditMods(APIGatewayProxyRequest request, ILambdaContext context)
        {
            return await EditRole(request, context, "mods", CommunitiesDatabase.EditMods);
        }

        public async Task<APIGatewayProxyResponse> EditMembers(APIGatewayProxyRequest request, ILambdaContext context)
        {
            return await EditRole(request, context, "members", CommunitiesDatabase.EditMembers);
        }

        private async Task<APIGatewayProxyResponse> EditRole(
            APIGatewayProxyRequest request, 
            ILambdaContext context, 
            string roleType, 
            Func<string, string, bool, Task<bool>> roleEditFunction)
        {
            try
            {
                var input = JsonSerializer.Deserialize<Dictionary<string, object>>(request.Body);
                if (!input.ContainsKey("communityId") || !input.ContainsKey("userId") || !input.ContainsKey("add"))
                {
                    return new APIGatewayProxyResponse
                    {
                        StatusCode = 400,
                        Body = JsonSerializer.Serialize(new { error = "communityId, userId, and add are required" }),
                        Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                    };
                }

                var communityId = input["communityId"].ToString();
                var userId = input["userId"].ToString();
                var add = bool.Parse(input["add"].ToString());

                var success = await roleEditFunction(communityId, userId, add);

                return new APIGatewayProxyResponse
                {
                    StatusCode = success ? 200 : 404,
                    Body = JsonSerializer.Serialize(new { message = success ? $"{roleType} updated successfully" : "Community not found" }),
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
            catch (Exception ex)
            {
                LambdaLogger.Log($"Error in Edit{roleType}: {ex}");
                return new APIGatewayProxyResponse
                {
                    StatusCode = 500,
                    Body = JsonSerializer.Serialize(new { error = ex.Message }),
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
        }

        public async Task<APIGatewayProxyResponse> GetAllCommunities(APIGatewayProxyRequest request, ILambdaContext context)
    {
        try
        {
            int page = request.QueryStringParameters != null && request.QueryStringParameters.ContainsKey("page")
                ? int.Parse(request.QueryStringParameters["page"])
                : 1;

            int pageSize = request.QueryStringParameters != null && request.QueryStringParameters.ContainsKey("pageSize")
                ? int.Parse(request.QueryStringParameters["pageSize"])
                : 30;

            var communities = await CommunitiesDatabase.GetAllCommunities(page, pageSize);

            return new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Body = JsonSerializer.Serialize(communities),
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
        catch (Exception ex)
        {
            LambdaLogger.Log($"Error in GetAllCommunities: {ex}");
            return new APIGatewayProxyResponse
            {
                StatusCode = 500,
                Body = JsonSerializer.Serialize(new { error = ex.Message }),
                Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
            };
        }
    }

        public async Task<APIGatewayProxyResponse> GetCommunityById(APIGatewayProxyRequest request, ILambdaContext context)
        {
            try
            {
                var communityId = request.PathParameters["communityId"];
                var community = await CommunitiesDatabase.GetCommunityById(communityId);

                if (community == null)
                {
                    return new APIGatewayProxyResponse
                    {
                        StatusCode = 404,
                        Body = JsonSerializer.Serialize(new { error = "Community not found" }),
                        Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                    };
                }

                return new APIGatewayProxyResponse
                {
                    StatusCode = 200,
                    Body = JsonSerializer.Serialize(community),
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
            catch (Exception ex)
            {
                LambdaLogger.Log($"Error in GetCommunityById: {ex}");
                return new APIGatewayProxyResponse
                {
                    StatusCode = 500,
                    Body = JsonSerializer.Serialize(new { error = ex.Message }),
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
        }

        public async Task<APIGatewayProxyResponse> GetCommunityByName(APIGatewayProxyRequest request, ILambdaContext context)
        {
            try
            {
                var communityName = request.QueryStringParameters["communityName"];
                var community = await CommunitiesDatabase.GetCommunityByName(communityName);

                if (community == null)
                {
                    return new APIGatewayProxyResponse
                    {
                        StatusCode = 404,
                        Body = JsonSerializer.Serialize(new { error = "Community not found" }),
                        Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                    };
                }

                return new APIGatewayProxyResponse
                {
                    StatusCode = 200,
                    Body = JsonSerializer.Serialize(community),
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
            catch (Exception ex)
            {
                LambdaLogger.Log($"Error in GetCommunityByName: {ex}");
                return new APIGatewayProxyResponse
                {
                    StatusCode = 500,
                    Body = JsonSerializer.Serialize(new { error = ex.Message }),
                    Headers = new Dictionary<string, string> { { "Content-Type", "application/json" } }
                };
            }
        }
    }

    


}
