import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    globalContainer:{
      flex: 1,
      backgroundColor: "#555555"
    },
    container: {
      flex: 1,
      // justifyContent: 'center',
      marginHorizontal: 16,
      marginVertical: 100,
    },
    text: {
      textAlign: "center",
      fontSize: 20,
      color: "#eeeeee"
    },
    separator: {
      marginVertical: 8
    }
  });

export default styles;