import { makeExecutableSchema } from "graphql-tools";
import { resolvers } from "./resolvers";

const typeDefs = `#graphql
    type Friend {
        id: ID
        firstName: String 
        lastName: String
        email: String
        role: String
    }



    type Point {
        type: String
        coordinates: [Float]
    }

    type FriendPosition {
        email: String
        name: String
        location: Point
    }
    
     
    """
    Queries available for Friends
    """
     type Query {
        """
        Returns all details for all Friends
        (Should probably require 'admin' rights if your are using authentication)
        """
        getAllFriends : [Friend]!
        """
        Only required if you ALSO wan't to try a version where the result is fetched from the existing endpoint
        """
        getAllFriendsProxy: [Friend]!
        getOneFriend(input: String): Friend
        
    }
    input FriendInput {
        firstName: String!
        lastName: String!
        password: String!
        email: String!
    }
    input FriendEditInput {
        firstName: String
        lastName: String
        password: String
        email: String!
    }

    input PositionInput {
        email: String!
        longitude: Float!
        latitude: Float!
    } 

    input FindNearByFriendsInput {
        email: String
        password: String
        latitude: Float
        longitude: Float
        distance: Float
    }


    type Mutation {
        """
        Allows anyone (non authenticated users) to create a new friend
        """
        createFriend(input: FriendInput): Friend
        editFriend(input: FriendEditInput ): Friend
        deleteFriend(input: String): Boolean
        addOrUpdatePosition(input: PositionInput): Boolean
        findNearByFriends(input: FindNearByFriendsInput):[FriendPosition]!
    }
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export { schema };
