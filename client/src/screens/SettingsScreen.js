import React from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  Alert,
  TouchableHighlight,
} from 'react-native';
import Icon from '../components/Icon';
import { AuthContext } from '../context/AuthContext';

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Settings',
  };
  static contextType = AuthContext;

  logout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'No',
      },
      {
        text: 'Yes',
        onPress: async () => {
          await this.context.logout();
          this.props.navigation.navigate('Auth');
        },
      },
    ]);
  };

  settings = [
    {
      title: 'General',
      data: [
        {
          icon: 'color-palette',
          title: 'Change theme',
        },
      ],
    },
    {
      title: 'User',
      data: [
        {
          icon: 'man',
          title: 'Change username',
          onPress: () => console.log('change username'),
        },
        {
          icon: 'lock-closed',
          title: 'Change password',
          onPress: () => console.log('change password'),
        },
        {
          icon: 'exit',
          title: 'Logout',
          onPress: this.logout,
        },
      ],
    },
    {
      title: 'Privacy',
      data: [
        {
          icon: 'navigate',
          title: 'Hide location',
          onPress: () => console.log('hiding location'),
        },
      ],
    },
  ];

  render() {
    return (
      <View style={styles.container}>
        <SectionList
          sections={this.settings}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => (
            <Item onPress={item.onPress} icon={item.icon} title={item.title} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.header}>{title}</Text>
          )}
        />
      </View>
    );
  }
}

function Item({ title, icon, onPress }) {
  return (
    <TouchableHighlight onPress={onPress}>
      <View style={styles.item}>
        <View style={{ flexDirection: 'row', padding: 0, margin: 0 }}>
          <Icon
            name={icon}
            style={{
              color: '#333',
              alignSelf: 'center',
              fontSize: 32,
              marginRight: 16,
            }}
          />
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  item: {
    backgroundColor: '#fff',
    padding: 12,
  },
  header: {
    backgroundColor: 'white',
    padding: 10,
    fontSize: 22,
    fontWeight: 'bold',
    paddingVertical: 10,
  },
  title: {
    fontSize: 16,
    alignSelf: 'center',
  },
});
