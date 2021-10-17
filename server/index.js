const { gql, ApolloServer } = require("apollo-server");

const users = [
  {
    id: 1,
    name: "James",
    email: "james@example.com",
    locations: [
      {
        id: 21,
        address: "Example Address 1",
        city: "Example City 1",
      },
    ],
  },
];

const typeDefs = gql`
  type Query {
    currentUser: User!
  }

  type Mutation {
    addLocation(city: String!, address: String!): Location!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    locations: [Location!]!
  }

  type Location {
    id: ID!
    address: String!
    city: String!
  }
`;

const resolvers = {
  Query: {
    currentUser: () => users[0],
  },
  Mutation: {
    addLocation: (_, { city, address }) => {
      const newLocation = {
        city,
        address,
        id: 21 + users[0].locations.length,
      };
      users[0].locations.push(newLocation);
      return newLocation;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => console.log("Server has started at " + url));
