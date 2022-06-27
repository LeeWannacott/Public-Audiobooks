import React from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Button } from "react-native-paper";
import MaterialIconCommunity from "react-native-vector-icons/MaterialCommunityIcons.js";
import { storeAsyncData } from "../db/database_functions";

function PickerForHistoryAndBookShelf(props: any) {
  const {
    pickerAndQueryState,
    getShelvedBooks,
    setPickerAndQueryState,
    toggleAscOrDescSort,
    asyncDataKeyName,
  } = props;

  return (
    <View style={styles.SQLQueryPickerAndIcon}>
      <View style={styles.SQLQueryPicker}>
        <Picker
          style={{ color: "black", backgroundColor: "#F9F6EE" }}
          selectedValue={pickerAndQueryState.orderBy}
          mode={"dropdown"}
          dropdownIconRippleColor={"grey"}
          onValueChange={(itemValue, itemPosition) => {
            setPickerAndQueryState({
              ...pickerAndQueryState,
              orderBy: itemValue,
              pickerIndex: itemPosition,
            });
            getShelvedBooks({
              ...pickerAndQueryState,
              orderBy: itemValue,
              pickerIndex: itemPosition,
            });
            storeAsyncData(asyncDataKeyName, {
              ...pickerAndQueryState,
              orderBy: itemValue,
              pickerIndex: itemPosition,
            });
          }}
        >
          <Picker.Item
            label="Order Visited"
            value="order by id"
            style={{ fontSize: 18 }}
          />
          <Picker.Item
            label="Title"
            value="order by audiobook_title"
            style={{ fontSize: 18 }}
          />
          <Picker.Item
            label="Rating"
            value="order by audiobook_rating + 0"
            style={{ fontSize: 18 }}
          />
          <Picker.Item
            label="Listening Progress"
            value="order by listening_progress_percent"
            style={{ fontSize: 18 }}
          />
          <Picker.Item
            label="Author First Name"
            value="order by audiobook_author_first_name"
            style={{ fontSize: 18 }}
          />
          <Picker.Item
            label="Author Last Name"
            value="order by audiobook_author_last_name"
            style={{ fontSize: 18 }}
          />
          <Picker.Item
            label="Total Time"
            value="order by audiobook_total_time_secs"
            style={{ fontSize: 18 }}
          />
          <Picker.Item
            label="Language"
            value="order by audiobook_language"
            style={{ fontSize: 18 }}
          />
          <Picker.Item
            label="Genre"
            value="order by audiobook_genres"
            style={{ fontSize: 18 }}
          />
          <Picker.Item
            label="Copyright Year"
            value="order by audiobook_copyright_year"
            style={{ fontSize: 18 }}
          />
        </Picker>
      </View>
      <Button
        accessibilityLabel={`${
          pickerAndQueryState.toggle
            ? "sort ascending up arrow"
            : "sort descending down arrow"
        }`}
        mode="contained"
        style={{
          backgroundColor: "black",
          height: 62,
        }}
        onPress={() => {
          toggleAscOrDescSort();
        }}
      >
        <MaterialIconCommunity
          name={pickerAndQueryState.icon}
          size={40}
          color="white"
        />
      </Button>
    </View>
  );
}

export default PickerForHistoryAndBookShelf;

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  SQLQueryPicker: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 1,
    width: windowWidth - 100,
    margin: 5,
    height: 55,
    marginLeft: 0,
  },
  SQLQueryPickerAndIcon: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    height: 80,
    paddingTop: 10,
  },
});
