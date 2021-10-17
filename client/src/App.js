import { gql, useMutation, useQuery } from "@apollo/client";
import React from "react";

const getUserDetails = gql`
  query GetCurrentUserDetails {
    currentUser {
      id
      name
      email
    }
  }
`;

const getCurrentUserLocations = gql`
  query GetCurrentUserLocations {
    currentUser {
      id
      locations {
        id
        address
        city
      }
    }
  }
`;

const addLocation = gql`
  mutation AddLocation($city: String!, $address: String!) {
    addLocation(city: $city, address: $address) {
      id
      city
      address
    }
  }
`;

function App() {
  const { data: userDetailsData, loading } = useQuery(getUserDetails);
  const { data: locationsData, loading: locLoading } = useQuery(
    getCurrentUserLocations
  );

  const [addLoc] = useMutation(addLocation, {
    onCompleted: () => alert("Location added"),
    update: (cache, { data: { addLocation } }) => {
      cache.modify({
        id: `User:${userDetailsData.currentUser.id}`,
        fields: {
          locations: (currentLocations = []) => {
            const newLocRef = cache.writeFragment({
              data: addLocation,
              fragment: gql`
                fragment NewLocation on Location {
                  id
                  city
                  address
                }
              `,
            });
            return [...currentLocations, newLocRef];
          },
        },
      });
    },
  });

  const [newLocation, setNewLocation] = React.useState({
    city: "",
    address: "",
  });

  const handleCityChange = (e) => {
    const value = e.target.value;
    setNewLocation((curr) => ({
      ...curr,
      city: value,
    }));
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setNewLocation((curr) => ({
      ...curr,
      address: value,
    }));
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    addLoc({
      variables: {
        city: newLocation.city,
        address: newLocation.address,
      },
    });
    setNewLocation({
      city: "",
      address: "",
    });
  };

  if (loading || locLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>User Details</h2>
      <span>Name:</span>&nbsp;<span>{userDetailsData.currentUser.name}</span>
      <br />
      <span>Email:</span>&nbsp;<span>{userDetailsData.currentUser.email}</span>
      <p>User Locations</p>
      <ul>
        {locationsData.currentUser.locations.map((loc) => (
          <li key={loc.id}>
            {loc.address}, {loc.city}
          </li>
        ))}
      </ul>
      <div>
        <form onSubmit={handleAddLocation} method="POST">
          <input
            type="text"
            placeholder="City"
            name="city"
            value={newLocation.city}
            onChange={handleCityChange}
          />
          <input
            type="text"
            placeholder="Address"
            name="address"
            value={newLocation.address}
            onChange={handleAddressChange}
          />
          <button type="submit">Add Location</button>
        </form>
      </div>
    </div>
  );
}

export default App;
