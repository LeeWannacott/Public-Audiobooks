import React from "react";
import { StyleSheet, Dimensions, Text } from "react-native";
import { List, Divider } from "react-native-paper";
import { ListItem } from "@rneui/themed";
import MaterialIconCommunity from "react-native-vector-icons/MaterialCommunityIcons.js";

function AudiobookAccordionList(props: any) {
  return (
    <List.Accordion
      titleStyle={styles.accordionTitleStyle}
      title={props.accordionTitle}
      style={styles.accordionStyle}
      titleNumberOfLines={1}
      accessibilityLabel={`${props.accordionTitle}`}
      theme={{ colors: { text: "white" } }}
    >
      <List.Section style={styles.accordianItemsStyle}>
        <ListItem.Subtitle style={styles.accordianItemsStyle}>
          <MaterialIconCommunity
            name="format-title"
            size={20}
          ></MaterialIconCommunity>
          {": "}
          {props.audiobookTitle}
        </ListItem.Subtitle>
        <Divider />

        <ListItem.Subtitle style={styles.accordianItemsStyle}>
          <MaterialIconCommunity
            name="feather"
            size={20}
          ></MaterialIconCommunity>
          {": "}
          {props.audiobookAuthorFirstName} {props.audiobookAuthorLastName}
        </ListItem.Subtitle>
        <Divider />

        <ListItem.Subtitle style={styles.accordianItemsStyle}>
          <MaterialIconCommunity
            name="timer-sand"
            size={20}
          ></MaterialIconCommunity>
          {": "}
          {props.audiobookTotalTime}
        </ListItem.Subtitle>
        <Divider />
        <ListItem.Subtitle style={styles.accordianItemsStyle}>
          <MaterialIconCommunity
            name="account-voice"
            size={20}
          ></MaterialIconCommunity>
          {": "}
          {props.audiobookLanguage}
        </ListItem.Subtitle>
        <Divider />
        <ListItem.Subtitle style={styles.accordianItemsStyle}>
          <MaterialIconCommunity
            name="guy-fawkes-mask"
            size={20}
          ></MaterialIconCommunity>
          {": "}
          {JSON.parse(props?.audiobookGenres).map((genre) => {
            return `${genre?.name} `;
          })}
        </ListItem.Subtitle>
        <Divider />
        <ListItem.Subtitle style={styles.accordianItemsStyle}>
          <MaterialIconCommunity
            name="copyright"
            size={20}
          ></MaterialIconCommunity>
          {": "}
          {props.audiobookCopyrightYear}
        </ListItem.Subtitle>
      </List.Section>
    </List.Accordion>
  );
}

export default AudiobookAccordionList;

const windowWidth = Dimensions.get("window").width;
const accordionTitleWidth = windowWidth / 2 - 8 - 60;
const accordionStyleWidth = windowWidth / 2 - 8;

const styles = StyleSheet.create({
  accordionStyle: {
    flex: 1,
    color: "white",
    backgroundColor: "#331800",
    width: accordionStyleWidth,
    justifyContent: "center",
    height: 60,
  },
  accordionTitleStyle: {
    color: "white",
    backgroundColor: "#331800",
    width: accordionTitleWidth,
    flex: 1,
    height: 80,
  },
  accordianItemsStyle: {
    color: "white",
    backgroundColor: "#51361a",
    width: windowWidth / 2 - 15,
  },
});
