import React from "react";
import { StyleSheet, Dimensions, Text } from "react-native";
import { List, Divider } from "react-native-paper";
import { ListItem } from "@rneui/themed";
import MaterialIconCommunity from "react-native-vector-icons/MaterialCommunityIcons.js";
import useColorScheme from "../hooks/useColorScheme";
import Colors from "../constants/Colors";

function AudiobookAccordionList(props: any) {
  const colorScheme = useColorScheme();
  const currentColorScheme = Colors[colorScheme];
  return (
    <List.Accordion
      titleStyle={[
        styles.accordionTitleStyle,
        { color: currentColorScheme.listAccordionTextColor },
        { backgroundColor: currentColorScheme.listAccordionTextHighlightColor },
      ]}
      title={props.accordionTitle}
      style={[
        styles.accordionStyle,
        { backgroundColor: currentColorScheme.listAccordionDropdownBGColor },
      ]}
      titleNumberOfLines={1}
      accessibilityLabel={`${props.accordionTitle}`}
      theme={{
        colors: { text: currentColorScheme.listAccordionDropdownIconColor },
      }}
    >
      <List.Section
        style={[
          styles.accordianItemsStyle,
          { color: currentColorScheme.accordionItemsTextColor },
          { backgroundColor: currentColorScheme.accordionItemsBGColor },
        ]}
      >
        <ListItem.Subtitle
          style={[
            styles.accordianItemsStyle,
            { color: currentColorScheme.accordionItemsTextColor },
            { backgroundColor: currentColorScheme.accordionItemsBGColor },
          ]}
        >
          <MaterialIconCommunity
            name="format-title"
            size={20}
          ></MaterialIconCommunity>
          {": "}
          {props.audiobookTitle}
        </ListItem.Subtitle>
        <Divider />

        <ListItem.Subtitle
          style={[
            styles.accordianItemsStyle,
            { color: currentColorScheme.accordionItemsTextColor },
            { backgroundColor: currentColorScheme.accordionItemsBGColor },
          ]}
        >
          <MaterialIconCommunity
            name="feather"
            size={20}
          ></MaterialIconCommunity>
          {": "}
          {props.audiobookAuthorFirstName} {props.audiobookAuthorLastName}
        </ListItem.Subtitle>
        <Divider />

        <ListItem.Subtitle
          style={[
            styles.accordianItemsStyle,
            { color: currentColorScheme.accordionItemsTextColor },
            { backgroundColor: currentColorScheme.accordionItemsBGColor },
          ]}
        >
          <MaterialIconCommunity
            name="timer-sand"
            size={20}
          ></MaterialIconCommunity>
          {": "}
          {props.audiobookTotalTime}
        </ListItem.Subtitle>
        <Divider />
        <ListItem.Subtitle
          style={[
            styles.accordianItemsStyle,
            { color: currentColorScheme.accordionItemsTextColor },
            { backgroundColor: currentColorScheme.accordionItemsBGColor },
          ]}
        >
          <MaterialIconCommunity
            name="account-voice"
            size={20}
          ></MaterialIconCommunity>
          {": "}
          {props.audiobookLanguage}
        </ListItem.Subtitle>
        <Divider />
        <ListItem.Subtitle
          style={[
            styles.accordianItemsStyle,
            { color: currentColorScheme.accordionItemsTextColor },
            { backgroundColor: currentColorScheme.accordionItemsBGColor },
          ]}
        >
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
        <ListItem.Subtitle
          style={[
            styles.accordianItemsStyle,
            { color: currentColorScheme.accordionItemsTextColor },
            { backgroundColor: currentColorScheme.accordionItemsBGColor },
          ]}
        >
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
    width: accordionStyleWidth,
    justifyContent: "center",
    height: 60,
  },
  accordionTitleStyle: {
    width: accordionTitleWidth,
    flex: 1,
    height: 80,
  },
  accordianItemsStyle: {
    width: windowWidth / 2 - 15,
  },
});
