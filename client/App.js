import React from 'react';
import YourSocialsApp from './src/YourSocialsApp';
import { AuthProvider } from './src/context/AuthContext';
import { PostProvider } from './src/context/PostContext';
import { FriendsProvider } from './src/context/FriendsContext';
class App extends React.Component {
  render() {
    return (
      <AuthProvider>
        <FriendsProvider>
          <PostProvider>
            <YourSocialsApp />
          </PostProvider>
        </FriendsProvider>
      </AuthProvider>
    );
  }
}

export default App;
