import React, { useEffect, useContext, useState } from 'react';
import { PostContext } from '../context/PostContext';
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import { FlatList } from 'react-navigation';
import PostListItem from '../components/PostListItem';
import Search from '../components/Search';
import { AuthContext } from '../context/AuthContext';

HomeScreen.navigationOptions = {
  title: 'Home',
};
export default function HomeScreen({ navigation }) {
  const postCtx = useContext(PostContext);
  const auth = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (auth.user && auth.user.uid) {
      fetchHome();
      navigation.addListener('willFocus', fetchHome);
    }
  }, [auth]);

  function EmptyList() {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ padding: 12 }}>No posts available.</Text>
      </View>
    );
  }

  function fetchHome() {
    postCtx.fetchHome().then(setPosts);
  }

  function getPosts() {
    setRefreshing(true);
    postCtx.fetchHome().then((data) => {
      setPosts(data);
      setRefreshing(false);
    });
  }

  return (
    <View style={{ flex: 1 }}>
      {
        <ImageBackground style={styles.background}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/Your.png')}
              style={styles.logo}
            />
            <Text style={{ marginRight: 30, marginLeft: 30 }}>
              To test posts, click icon in the middle and click the feed (Listed
              B) to test posts (other features in app still being developed for
              future demonstration)
            </Text>
          </View>
        </ImageBackground>
        /* <FlatList
        // ListEmptyComponent={EmptyList()}
        refreshing={refreshing}
        onRefresh={getPosts}
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostListItem showFeed={true} feedId={item.feed} postId={item._id} />
        )}
      /> */
      }
    </View>
  );
}
const styles = StyleSheet.create({
  background: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  logo: {
    width: 250,
    height: 250,
  },
  logoContainer: {
    position: 'absolute',
    top: 50,
    alignItems: 'center',
  },
});
