import React from "react";
import { StyleSheet, View } from "react-native";
import Explore from "../components/Explore";

function HomeScreen() {
  return (
    <View style={styles.container}>
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
    backgroundColor: "#331800",
  },
});
