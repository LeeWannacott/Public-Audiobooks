import Slider from "@react-native-community/slider";
import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { Dimensions } from "react-native";

function AudiotrackSliderWithCurrentPlaying(props: any) {
  return (
    <View style={styles.SliderStyle}>
      <Slider
        value={props.currentSliderPosition}
        disabled={false}
        minimumValue={0.0}
        maximumValue={100.0}
        minimumTrackTintColor="#50C878"
        thumbTintColor="#228B22"
        onSlidingComplete={(data) => props.SeekUpdate(data)}
      />
      <View style={styles.AudiobookTime}>
        <Text style={{ marginLeft: 10 }}>
          {" "}
          {props.GetDurationFormat(
            (props.currentSliderPosition * props.Duration) / 100
          )}{" "}
        </Text>
        <Text style={{ marginRight: 10 }}>
          {" "}
          {props.GetDurationFormat(props.Duration)}
        </Text>
      </View>
      <View style={styles.SliderContainer}>
        <Image
          source={{ uri: props.coverImage }}
          style={{
            width: 50,
            height: 50,
            marginRight: 5,
          }}
        />
        <View>
          <Text numberOfLines={2} ellipsizeMode="tail" style={{}}>
            {" "}
            {props.audioTrackChapterPlayingTitle}{" "}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail">
            {" "}
            {props.audioTrackReader}{" "}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default AudiotrackSliderWithCurrentPlaying;

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const styles = StyleSheet.create({
  AudiobookTime: {
    display: "flex",
    backgroundColor: "#F9F6EE",
    flexDirection: "row",
    justifyContent: "space-between",
    // top: -200,
    // padding: 10,
    minHeight: 20,
  },
  SliderStyle: {
    backgroundColor: "#F9F6EE",
  },
  SliderContainer: {
    backgroundColor: "#F9F6EE",
    flexDirection: "row",
    paddingLeft: 5,
    maxWidth: windowWidth - 70,
  },
});
