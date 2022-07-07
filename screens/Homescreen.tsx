import React from "react";
import { StyleSheet, View } from "react-native";
import Explore from "../components/Explore";
import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";

function HomeScreen() {
  const colorScheme = useColorScheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <Explore />
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    padding: 10,
    paddingTop: 0,
  },
});
