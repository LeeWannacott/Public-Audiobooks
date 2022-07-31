import React, { useState, useRef, useEffect } from "react";

import { SearchBar, Overlay } from "@rneui/themed";
import Slider from "@react-native-community/slider";
import AudioBooks from "../components/Audiobooks";
import { View, Dimensions, Text, FlatList } from "react-native";
import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import authorsListJson from "../assets/resources/audiobookAuthorsList.json";
import { genreList } from "../assets/resources/audiobookGenreList";
import { getAsyncData, storeAsyncData } from "../db/database_functions";
import { Divider, Button } from "react-native-paper";
import useColorScheme from "../hooks/useColorScheme";
import Colors from "../constants/Colors";
import * as NavigationBar from "expo-navigation-bar";
import Fuse from "fuse.js";

function Search(props: any) {
  const colorScheme = useColorScheme();
  const currentColorScheme = Colors[colorScheme];
  const [search, setSearch] = useState("");
  const [userInputEntered, setUserInputEntered] = useState("");
  const [visible, setVisible] = useState(false);
  const [audiobookAmountRequested, setAudiobooksAmountRequested] = useState(64);
  const [genreFuse, setGenreFuse] = useState<Fuse>("");
  const [authorFuse, setAuthorFuse] = useState<Fuse>("");
  const [suggestions, setSuggestions] = useState<Fuse>("");
  const [suggestionVisible, setSuggestionsVisible] = useState<boolean>(false);
  const [selectedSuggestionID, setSelelectedSuggestionID] = useState<any>();

  const refToSearchbar = useRef(null);
  const [apiSettings, setApiSettings] = useState({
    searchBy: props.route.params.searchBy,
    audiobookGenre: "*Non-fiction",
    authorLastName: "Hoffmann",
  });

  React.useState(() => {
    try {
      // getAsyncData("apiSettings").then((apiSettingsFromStorage) => {
      // apiSettingsFromStorage
      // ? setApiSettings(apiSettingsFromStorage)
      // : setApiSettings({
      // ["searchBy"]: "recent",
      // ["audiobookGenre"]: "*Non-fiction",
      // ["authorLastName"]: "Hoffmann",
      // });
      // });
      getAsyncData("audiobookAmountRequested").then(
        (audiobookAmountRequestedRetrieved) => {
          audiobookAmountRequestedRetrieved
            ? setAudiobooksAmountRequested(audiobookAmountRequestedRetrieved)
            : setAudiobooksAmountRequested(64);
        }
      );
    } catch (err) {
      console.log(err);
    }
  }, []);

  const storeApiSettings = (tempApiSettings: any) => {
    storeAsyncData("apiSettings", tempApiSettings);
  };

  function setAndStoreAudiobookAmountRequested(amount: number) {
    setAudiobooksAmountRequested(amount);
    storeAsyncData("audiobookAmountRequested", amount);
  }

  const toggleSearchOptionsOverlay = () => {
    NavigationBar.setBackgroundColorAsync(
      Colors[colorScheme].statusBarBackground
    );
    setVisible(!visible);
  };

  function searchBarPlaceholder() {
    switch (apiSettings["searchBy"]) {
      case "recent":
        return "New Releases";
      case "title":
        return "Search by Title:";
      case "author":
        return `Search by Author:`;
      case "genre":
        return `Search by Genre:`;
    }
  }

  useEffect(() => {
    const genreOptions = {
      includeScore: true,
    };
    const authorOptions = {
      includeScore: true,
      keys: ["last_name", "first_name"],
    };
    function makeFuse() {
      switch (props.route.params.searchBy) {
        case "genre":
          return setGenreFuse(new Fuse(genreList, genreOptions));
        case "author":
          return setAuthorFuse(
            new Fuse(authorsListJson["authors"], authorOptions)
          );
        default:
      }
    }
    makeFuse();

    // console.log(fuse);
  }, []);

  const updateSearch = (search: any) => {
    if (
      props.route.params.searchBy !== "title" ||
      props.route.params.searchBy == "author"
    ) {
      setSuggestionsVisible(true);
    }
    setSearch(search);

    function generateFuse() {
      switch (props.route.params.searchBy) {
        case "genre":
          const resultGenreFuse = genreFuse.search(search);
          return setSuggestions(resultGenreFuse);
        case "author":
          const resultAuthorFuse = authorFuse.search(search);
          return setSuggestions(resultAuthorFuse);
        default:
      }
    }
    generateFuse();
  };

  function submitUserInput(item) {
    switch (props.route.params.searchBy) {
      case "genre":
        setSearch(item.item);
        return setUserInputEntered(item.item);
      case "author":
        setSearch(item.item.first_name + " " + item.item.last_name);
        return setUserInputEntered(item.item.last_name);
    }
  }

  function suggestionTimeout() {
    setSuggestionsVisible(false), setSelelectedSuggestionID(null);
  }

  const renderSuggestions = ({ item, index }) => {
    return (
      <>
        <Text
          style={{
            color: selectedSuggestionID === index ? "#2aa198" : "white",
            backgroundColor: "black",
            fontSize: 20,
            paddingLeft: 5,
          }}
          onPress={() => {
            setSelelectedSuggestionID(index);
            submitUserInput(item);
            setTimeout(() => {
              suggestionTimeout();
            }, 1000);
          }}
        >
          {apiSettings.searchBy == "author"
            ? item.item.first_name + " " + item.item.last_name
            : item.item}
        </Text>
        <Divider style={{ backgroundColor: "#2aa198" }} />
      </>
    );
  };

  return (
    <View style={{ display: "flex" }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors[colorScheme].searchBarBackground,
          width: windowWidth,
          height: 80,
          paddingTop: 10,
        }}
      >
        <View style={styles.searchStyle}>
          <SearchBar
            ref={(searchbar) => (refToSearchbar.current = searchbar)}
            placeholder={searchBarPlaceholder()}
            disabled={props.route.params.isSearchDisabled}
            lightTheme={false}
            onChangeText={(val: string) => {
              updateSearch(val);
            }}
            onSubmitEditing={() => setUserInputEntered(search)}
            value={search}
            inputContainerStyle={{
              backgroundColor: Colors[colorScheme].searchBarInputContainerStyle,
              borderWidth: 1,
              borderBottomWidth: 1,
                width:windowWidth-90,
              borderColor: Colors[colorScheme].bookshelfPickerBorderColor,
              height: 55,
            }}
            inputStyle={{
              backgroundColor: Colors[colorScheme].searchBarInputStyle,
              color: Colors[colorScheme].searchBarTextColor,
              height: 55,
            }}
            searchIcon={{ color: Colors[colorScheme].searchBarSearchIcon }}
            clearIcon={{
              color: Colors[colorScheme].searchBarClearIcon,
              size: 25,
            }}
            placeholderTextColor={Colors[colorScheme].searchBarClearIcon}
            onClear={() => setSuggestionsVisible(false)}
            containerStyle={{
              backgroundColor: Colors[colorScheme].searchBarContainerStyle,

              borderTopWidth: 0,
              borderBottomWidth: 0,
            }}
          />
        </View>
        <Button
          accessibilityLabel="Search options"
          accessibilityHint="Opens options for searching by Title, Author, Genre and changing amount of audiobooks requested per search."
          onPress={toggleSearchOptionsOverlay}
          mode={Colors[colorScheme].buttonMode}
          style={{
            backgroundColor: currentColorScheme.buttonBackgroundColor,
          }}
        >
          <MaterialCommunityIcons
            name="cog"
            size={35}
            color={Colors[colorScheme].buttonIconColor}
          />
        </Button>
        <Overlay
          isVisible={visible}
          onBackdropPress={toggleSearchOptionsOverlay}
          fullScreen={false}
          overlayStyle={{
            backgroundColor: Colors[colorScheme].overlayBackgroundColor,
          }}
        >
          <View style={styles.checkboxRow}>
            <Text style={{ fontSize: 15, color: currentColorScheme.text }}>
              Audiobooks requested per search: {audiobookAmountRequested}.
            </Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              accessibilityLabel="Decrease audiobooks requested per search."
              accessibilityHint={`Currently: ${audiobookAmountRequested} requested`}
              onPress={() =>
                audiobookAmountRequested >= 6
                  ? setAndStoreAudiobookAmountRequested(
                      audiobookAmountRequested - 5
                    )
                  : undefined
              }
              mode={Colors[colorScheme].buttonMode}
              style={{
                backgroundColor: Colors[colorScheme].buttonBackgroundColor,
              }}
            >
              <MaterialCommunityIcons
                name="minus"
                size={30}
                color={Colors[colorScheme].buttonIconColor}
              />
            </Button>
            <Slider
              value={audiobookAmountRequested}
              maximumValue={420}
              minimumValue={1}
              onValueChange={setAndStoreAudiobookAmountRequested}
              step={1}
              style={{ width: 180, height: 40, margin: 10 }}
              trackStyle={{
                height: 10,
                backgroundColor: Colors[colorScheme].sliderTrackColor,
              }}
              thumbStyle={{
                height: 12,
                width: 12,
                backgroundColor: Colors[colorScheme].sliderThumbColor,
              }}
            />
            <Button
              accessibilityLabel="Increase audiobooks requested per search."
              accessibilityHint={`Currently ${audiobookAmountRequested} requested`}
              onPress={() =>
                audiobookAmountRequested <= 415
                  ? setAndStoreAudiobookAmountRequested(
                      audiobookAmountRequested + 5
                    )
                  : undefined
              }
              mode={Colors[colorScheme].buttonMode}
              style={{
                backgroundColor: Colors[colorScheme].buttonBackgroundColor,
              }}
            >
              <MaterialCommunityIcons
                name="plus"
                size={30}
                color={Colors[colorScheme].buttonIconColor}
              />
            </Button>
          </View>
        </Overlay>
      </View>
      {suggestionVisible ? (
        <FlatList
          style={{
            position: "absolute",
            top: 80,
            left: 10,
            zIndex: 1000,
            height: 268,
            width: 250,
          }}
          data={suggestions}
          renderItem={renderSuggestions}
          keyExtractor={(item) => item.refIndex}
          initialNumToRender={20}
          extraData={suggestions}
        />
      ) : undefined}
      <View style={styles.scrollStyle}>
        <AudioBooks
          apiSettings={apiSettings}
          searchBarInputSubmitted={userInputEntered}
          searchBarCurrentText={search}
          requestAudiobookAmount={audiobookAmountRequested}
        />
      </View>
    </View>
  );
}

const windowWidth = Dimensions.get("window").width;
// const windowHeight = Dimensions.get("window").height;
export default Search;

const styles = StyleSheet.create({
  searchStyle: {
    right:5,
    width: windowWidth - 80,
    display: "flex",
    justifyContent: "center",
  },
  settingsIcon: {},
  checkboxRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  titleOrAuthorStringFlexbox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  scrollStyle: {
    left:8,
    height: 525,
  },
});
