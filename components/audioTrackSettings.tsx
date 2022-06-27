import React from "react";
import { StyleSheet, Text, View, Switch } from "react-native";
import { Overlay } from "@rneui/themed";
import { Button } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons.js";
import Slider from "@react-native-community/slider";

function AudioTrackSettings(props: any) {
  const {
    visible,
    toggleOverlay,
    audioPlayerSettings,
    setAudioPlayerSettings,
    sound,
  } = props;

  async function onToggleMuteSwitch(muteToggled: boolean) {
    try {
      props.setAudioPlayerSettings({
        ...props.audioPlayerSettings,
        isMuted: !props.audioPlayerSettings.isMuted,
      });
      const result = await props.sound.current.getStatusAsync();
      if (muteToggled) {
        if (result.isLoaded === true) {
          await props.sound.current.setIsMutedAsync(true);
        }
      } else if (!muteToggled) {
        if (result.isLoaded === true) {
          await props.sound.current.setIsMutedAsync(false);
        }
      }
      await props.storeAudioTrackSettings({
        ...props.audioPlayerSettings,
        isMuted: !props.audioPlayerSettings.isMuted,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function onTogglePitchSwitch(pitchToggled: boolean) {
    try {
      props.setAudioPlayerSettings({
        ...props.audioPlayerSettings,
        shouldCorrectPitch: !props.audioPlayerSettings.shouldCorrectPitch,
      });
      const result = await props.sound.current.getStatusAsync();
      if (pitchToggled) {
        if (result.isLoaded === true) {
          await props.sound.current.setRateAsync(
            props.audioPlayerSettings.rate,
            true
          );
        }
      } else if (!pitchToggled) {
        if (result.isLoaded === true) {
          await props.sound.current.setRateAsync(
            props.audioPlayerSettings.rate,
            false
          );
        }
      }
      await props.storeAudioTrackSettings({
        ...props.audioPlayerSettings,
        shouldCorrectPitch: !props.audioPlayerSettings.shouldCorrectPitch,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function onToggleLoopSwitch(loopToggled: boolean) {
    try {
      props.setAudioPlayerSettings({
        ...props.audioPlayerSettings,
        isLooping: !props.audioPlayerSettings.isLooping,
      });
      const result = await props.sound.current.getStatusAsync();
      if (loopToggled) {
        if (result.isLoaded === true) {
          await props.sound.current.setIsLoopingAsync(true);
        }
      } else if (!loopToggled) {
        if (result.isLoaded === true) {
          await props.sound.current.setIsLoopingAsync(false);
        }
      }
      await props.storeAudioTrackSettings({
        ...props.audioPlayerSettings,
        isLooping: !props.audioPlayerSettings.isLooping,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function updateAudtiotrackSpeed(updateRate: number) {
    try {
      props.setAudioPlayerSettings({
        ...props.audioPlayerSettings,
        rate: updateRate,
      });
      const result = await props.sound.current.getStatusAsync();
      if (result.isLoaded === true) {
        await props.sound.current.setRateAsync(
          updateRate,
          props.audioPlayerSettings.shouldCorrectPitch
        );
      }
      await props.storeAudioTrackSettings({
        ...props.audioPlayerSettings,
        rate: updateRate,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function updateAudiotrackVolume(newVolumeLevel: number) {
    try {
      const result = await props.sound.current.getStatusAsync();
      props.setAudioPlayerSettings({
        ...props.audioPlayerSettings,
        volume: newVolumeLevel,
      });
      if (result.isLoaded === true) {
        await props.sound.current.setVolumeAsync(newVolumeLevel);
      }
      await props.storeAudioTrackSettings({
        ...props.audioPlayerSettings,
        volume: newVolumeLevel,
      });
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <Overlay
      isVisible={props.visible}
      onBackdropPress={props.toggleOverlay}
      fullScreen={false}
      overlayStyle={{ backgroundColor: "#F9F6EE" }}
    >
      <View style={{ backgroundColor: "#F9F6EE" }}>
        <Text style={{ marginBottom: 10 }}>
          Volume of Audiotrack: {props.audioPlayerSettings.volume}
        </Text>
        <View style={styles.sliderWithIconsOnSides}>
          <Button
            accessibilityLabel="Decrease Volume"
            accessibilityHint={`Current volume level: ${props.audioPlayerSettings.volume} `}
            onPress={() => {
              audioPlayerSettings.volume >= 0.25
                ? updateAudiotrackVolume(
                    props.audioPlayerSettings.volume - 0.25
                  )
                : undefined;
            }}
            style={{ backgroundColor: "#F9F6EE" }}
            mode="contained"
          >
            <MaterialCommunityIcons
              name="volume-minus"
              size={30}
              color="black"
            />
          </Button>
          <Slider
            value={props.audioPlayerSettings.volume}
            style={{ width: 200, height: 40 }}
            minimumValue={0.0}
            maximumValue={1.0}
            minimumTrackTintColor="#50C878"
            thumbTintColor="#228B22"
            step={0.25}
            onValueChange={async (volumeLevel: number) => {
              updateAudiotrackVolume(volumeLevel);
            }}
          />
          <Button
            accessibilityLabel="Decrease Volume"
            accessibilityHint={`Current volume level: ${props.audioPlayerSettings.volume} `}
            onPress={() => {
              audioPlayerSettings.volume <= 0.75
                ? updateAudiotrackVolume(
                    props.audioPlayerSettings.volume + 0.25
                  )
                : undefined;
            }}
            style={{ backgroundColor: "#F9F6EE" }}
            mode="contained"
          >
            <MaterialCommunityIcons
              name="volume-plus"
              size={30}
              color="black"
            />
          </Button>
        </View>
        <Text style={{ marginBottom: 10, marginTop: 10 }}>
          Pitch Correction: {props.audioPlayerSettings.shouldCorrectPitch}
        </Text>
        <Switch
          accessibilityLabel={`pitch switch: currently: ${props.audioPlayerSettings.shouldCorrectPitch}`}
          value={props.audioPlayerSettings.shouldCorrectPitch}
          onValueChange={onTogglePitchSwitch}
        />
        <Text style={{ marginBottom: 10 }}>
          Mute : {props.audioPlayerSettings.isMuted}
        </Text>
        <Switch
          accessibilityLabel={`mute switch: currently ${props.audioPlayerSettings.isMuted}`}
          value={props.audioPlayerSettings.isMuted}
          onValueChange={onToggleMuteSwitch}
        />
        {/*
      <Text>looping: {props.audioPlayerSettings.isLooping}</Text>
      <Switch
        value={props.audioPlayerSettings.isLooping}
        onValueChange={onToggleLoopSwitch}
      />
      */}
        <Text style={{ marginBottom: 10 }}>
          Speed of Audiotrack: {props.audioPlayerSettings.rate}X
        </Text>
        <View style={styles.sliderWithIconsOnSides}>
          <Button
            accessibilityLabel="Decrease speed of audiotrack"
            accessibilityHint={`Current speed: ${props.audioPlayerSettings.rate}X `}
            onPress={() => {
              audioPlayerSettings.rate >= 0.5
                ? updateAudtiotrackSpeed(props.audioPlayerSettings.rate - 0.25)
                : undefined;
            }}
            style={{ backgroundColor: "#F9F6EE" }}
            mode="contained"
          >
            <MaterialCommunityIcons name="tortoise" size={30} color="black" />
          </Button>
          <Slider
            value={props.audioPlayerSettings.rate}
            style={{ width: 200, height: 40 }}
            minimumValue={0.25}
            maximumValue={2.0}
            minimumTrackTintColor="#50C878"
            thumbTintColor="#228B22"
            step={0.25}
            onValueChange={async (speed: number) => {
              updateAudtiotrackSpeed(speed);
            }}
          />
          <Button
            accessibilityLabel="Decrease speed of audiotrack"
            accessibilityHint={`Current speed: ${props.audioPlayerSettings.rate}x `}
            onPress={() => {
              audioPlayerSettings.rate <= 1.75
                ? updateAudtiotrackSpeed(props.audioPlayerSettings.rate + 0.25)
                : undefined;
            }}
            style={{ backgroundColor: "#F9F6EE" }}
            mode="contained"
          >
            <MaterialCommunityIcons name="rabbit" size={30} color="black" />
          </Button>
        </View>
      </View>
    </Overlay>
  );
}

export default AudioTrackSettings;

const styles = StyleSheet.create({
  sliderWithIconsOnSides: {
    display: "flex",
    flexDirection: "row",
  },
});
