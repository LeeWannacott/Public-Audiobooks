import React, { useState } from "react";
import { StyleSheet, Text, View, Alert, Linking } from "react-native";
import SettingsList from "react-native-settings-list";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  storeAsyncData,
  getAsyncData,
} from "../db/database_functions";
import { openDatabase } from "../db/utils";
const db = openDatabase();

const UserSettings = () => {
  const [audioModeSettings, setAudioModeSettings] = useState({
    interruptionModeAndroid: 1,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  React.useEffect(() => {
    getAsyncData("audioModeSettings").then(
      (audioModeSettingsRetrieved: any) => {
        audioModeSettingsRetrieved;
        if (audioModeSettingsRetrieved) {
          return setAudioModeSettings(audioModeSettingsRetrieved);
        }
      }
    );
  }, []);

  const storeAudioModeSettings = (tempApiSettings: object) => {
    storeAsyncData("audioModeSettings", tempApiSettings);
  };

  function staysActiveInBackgroundToggle() {
    setAudioModeSettings({
      ...audioModeSettings,
      staysActiveInBackground: !audioModeSettings.staysActiveInBackground,
    });
    storeAudioModeSettings({
      ...audioModeSettings,
      staysActiveInBackground: !audioModeSettings.staysActiveInBackground,
    });
  }

  function shouldDuckAndroidToggle() {
    setAudioModeSettings({
      ...audioModeSettings,
      shouldDuckAndroid: !audioModeSettings.shouldDuckAndroid,
    });
    storeAudioModeSettings({
      ...audioModeSettings,
      shouldDuckAndroid: !audioModeSettings.shouldDuckAndroid,
    });
  }

  function playThroughEarpieceAndroidToggle() {
    setAudioModeSettings({
      ...audioModeSettings,
      playThroughEarpieceAndroid: !audioModeSettings.playThroughEarpieceAndroid,
    });
    storeAudioModeSettings({
      ...audioModeSettings,
      playThroughEarpieceAndroid: !audioModeSettings.playThroughEarpieceAndroid,
    });
  }

  const deleteAudiobookHistory = (db: any) => {
    deleteAudiobookHistoryDB(db);
  };
  const deleteAudiobookProgress = (db: any) => {
    deleteAudiobookProgressDB(db);
  };

  return (
    <View style={styles.container}>
      <View style={styles.settingsStyleBlock}>
        <Text style={styles.settingsTitleText}>Settings</Text>
      </View>
      <View style={styles.sectionHeadings}>
        <SettingsList backgroundColor="#F9F6EE">
          <SettingsList.Header
            headerText="Audiobook settings"
            headerStyle={styles.audiobookSettingsSubHeading}
          />
          {/*<SettingsList.Item
            icon={
              <MaterialCommunityIcons
                name="theme-light-dark"
                size={50}
                color={"black"}
              />
            }
            itemWidth={50}
            title="Color scheme"
            hasNavArrow={false}
            hasSwitch={false}
          />*/}
          <SettingsList.Item
            icon={
              <MaterialCommunityIcons
                name="run-fast"
                size={50}
                color={"black"}
              />
            }
            hasNavArrow={false}
            title="Stays active in background."
            itemWidth={50}
            switchState={audioModeSettings.staysActiveInBackground}
            switchOnValueChange={staysActiveInBackgroundToggle}
            hasSwitch={true}
            onPress={() =>
              Alert.alert(
                "Stays active in background.",
                "Select if the audio session playback should stay active even when the app goes into the background. Default: On",
                [
                  {
                    text: "Close",
                    style: "cancel",
                  },
                ]
              )
            }
          />
          <SettingsList.Item
            icon={
              <MaterialCommunityIcons name="duck" size={50} color={"black"} />
            }
            hasNavArrow={false}
            title="Duck Audio"
            itemWidth={50}
            switchState={audioModeSettings.shouldDuckAndroid}
            switchOnValueChange={shouldDuckAndroidToggle}
            hasSwitch={true}
            onPress={() =>
              Alert.alert(
                "Duck Audio",
                "Select if your experience's audio should automatically be lowered in volume (duck), if audio from another app interrupts your experience. If false, audio from other apps will pause your audio. Default: On",
                [
                  {
                    text: "Close",
                    style: "cancel",
                  },
                ]
              )
            }
          />
          <SettingsList.Item
            icon={
              <MaterialCommunityIcons
                name="headset"
                size={50}
                color={"black"}
              />
            }
            hasNavArrow={false}
            title="Play through earpiece"
            itemWidth={50}
            switchState={audioModeSettings.playThroughEarpieceAndroid}
            switchOnValueChange={playThroughEarpieceAndroidToggle}
            hasSwitch={true}
            onPress={() =>
              Alert.alert(
                "Play through earpiece",
                "Selecting if the audio is routed to earpiece. Default: Off",
                [
                  {
                    text: "Close",
                    style: "cancel",
                  },
                ]
              )
            }
          />

          {/*<SettingsList.Item
            icon={
              <MaterialCommunityIcons name="history" size={50} color={"black"} />
            }
            hasNavArrow={true}
            title="Delete viewing history"
            onPress={() =>
              Alert.alert(
                "Delete history",
                "Are you sure you want to delete audiobook viewing history?",
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                  },
                  {
                    text: "Delete History",
                    onPress: () => deleteAudiobookHistory(db),
                  },
                ],
                {
                  cancelable: true,
                }
              )
            }
        />*/}

          {/*
          <SettingsList.Item
            icon={
              <MaterialCommunityIcons
                name="history"
                size={50}
                color={"black"}
              />
            }
            hasNavArrow={true}
            title="Delete audiobook progress"
            onPress={() =>
              Alert.alert(
                "Delete audiobook progress",
                "Are you sure you want to delete audiobook progress ?",
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                  },
                  {
                    text: "Delete audiobook progress",
                    onPress: () => deleteAudiobookProgress(db),
                  },
                ],
                {
                  cancelable: true,
                }
              )
            }
          />*/}
          <SettingsList.Header
            headerText="About"
            headerStyle={styles.audiobookSettingsSubHeading}
          />
          <SettingsList.Item
            icon={
              <MaterialCommunityIcons
                name="information-variant"
                size={50}
                color={"green"}
              />
            }
            titleInfo="0.1.0"
            hasNavArrow={false}
            title="Version: "
          />
          <SettingsList.Item
            hasNavArrow={true}
            icon={
              <MaterialCommunityIcons name="github" size={50} color={"black"} />
            }
            title="GitHub: LeeWannacott"
            onPress={() =>
              Alert.alert(
                "GitHub",
                "Checkout my GitHub to open issues, contribute, or request features.",
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                  },
                  {
                    text: "github",
                    onPress: () => {
                      Linking.openURL("https://github.com/LeeWannacott");
                    },
                  },
                ]
              )
            }
          />
          <SettingsList.Item
            hasNavArrow={true}
            icon={
              <MaterialCommunityIcons
                name="account-tie-voice"
                size={50}
                color={"black"}
              />
            }
            title="LibriVox"
            onPress={() =>
              Alert.alert(
                "GitHub",
                "The audiobooks contained in this application are public domain and read by volunteers from LibriVox",
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                  },
                  {
                    text: "LibriVox website.",
                    onPress: () => {
                      Linking.openURL("https://librivox.org/");
                    },
                  },
                ]
              )
            }
          />
        </SettingsList>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#331800", flex: 1 },
  title: {
    fontSize: 24,
  },
  sectionHeadings: { backgroundColor: "#F9F6EE", flex: 1 },
  settingsTitleText: {
    color: "#F9F6EE",
    marginTop: 35,
    marginBottom: 15,
    marginLeft: 15,
    fontWeight: "bold",
    fontSize: 25,
  },
  audiobookSettingsSubHeading: { color: "#009688", marginTop: 20 },
  settingsStyleBlock: {
    borderBottomWidth: 1,
    backgroundColor: "#263238",
    borderColor: "red",
  },
});

export default UserSettings;
