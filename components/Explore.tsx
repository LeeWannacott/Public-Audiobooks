import React, { useState, useRef, useEffect } from "react";

import { SearchBar, Overlay } from "@rneui/themed";
import Slider from "@react-native-community/slider";
import AudioBooks from "../components/Audiobooks";
import { View, Dimensions, Text, FlatList } from "react-native";
import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getAsyncData, storeAsyncData } from "../db/database_functions";
import { Divider, Button } from "react-native-paper";
import useColorScheme from "../hooks/useColorScheme";
import Colors from "../constants/Colors";
import * as NavigationBar from "expo-navigation-bar";
import { useNavigation } from "@react-navigation/native";
import { Suggestion } from "../types";
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
  const [suggestions, setSuggestions] = useState("");
  const [suggestionVisible, setSuggestionsVisible] = useState<boolean>(false);
  const [selectedSuggestionID, setSelelectedSuggestionID] = useState<any>();
  const refToSearchbar = useRef(null);
  const searchBy = props.route.params.searchBy;
  const navigation = useNavigation();

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getAsyncData("audiobookAmountRequested").then(
        (audiobookAmountRequestedRetrieved) => {
          audiobookAmountRequestedRetrieved
            ? setAudiobooksAmountRequested(audiobookAmountRequestedRetrieved)
            : undefined;
        }
      );
      switch (searchBy) {
        case "genre":
          getAsyncData("userSearchGenre").then((userSearchGenreRetrieved) => {
            userSearchGenreRetrieved
              ? (setSearch(userSearchGenreRetrieved),
                setUserInputEntered(userSearchGenreRetrieved))
              : undefined;
          });
          break;
        case "author":
          getAsyncData("userSearchAuthor").then((userSearchAuthorRetrieved) => {
            userSearchAuthorRetrieved
              ? setSearch(userSearchAuthorRetrieved)
              : undefined;
          });
          getAsyncData("userInputAuthorSubmitted").then(
            (userInputAuthorRetrieved) => {
              userInputAuthorRetrieved
                ? setUserInputEntered(userInputAuthorRetrieved)
                : undefined;
            }
          );
          break;
      }
    });
    return unsubscribe;
  }, [navigation]);

  function setAndStoreAudiobookAmountRequested(amount: number) {
    setAudiobooksAmountRequested(amount);
    storeAsyncData("audiobookAmountRequested", amount);
  }

  const storeSearchText = (searchType: string, userInput: string) => {
    storeAsyncData(searchType, userInput);
  };
  const storeSearchBarSubmitted = (searchType: string, userInput: string) => {
    storeAsyncData(searchType, userInput);
  };

  const toggleSearchOptionsOverlay = () => {
    NavigationBar.setBackgroundColorAsync(
      Colors[colorScheme].statusBarBackground
    );
    setVisible(!visible);
  };

  function searchBarPlaceholder() {
    switch (searchBy) {
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
      switch (searchBy) {
        case "genre":
          return setGenreFuse(
            new Fuse(props.route.params.genreList, genreOptions)
          );
        case "author":
          return setAuthorFuse(
            new Fuse(
              props.route.params.authorsListJSON["authors"],
              authorOptions
            )
          );
        default:
      }
    }
    makeFuse();

    // console.log(fuse);
  }, []);

  const updateSearch = (search: string) => {
    if (searchBy !== "title" || searchBy === "author") {
      setSuggestionsVisible(true);
    }
    setSearch(search);

    function generateFuse() {
      switch (searchBy) {
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

  function submitUserInput(item: Suggestion) {
    switch (searchBy) {
      case "genre":
        setSearch(item?.item);
        storeSearchText("userSearchGenre", item?.item);
        setUserInputEntered(item?.item);
        break;
      case "author":
        setSearch(item?.item?.first_name + " " + item?.item?.last_name);
        storeSearchText(
          "userSearchAuthor",
          item?.item?.first_name + " " + item?.item?.last_name
        );
        storeSearchBarSubmitted(
          "userInputAuthorSubmitted",
          item?.item?.last_name
        );
        setUserInputEntered(item?.item?.last_name);
        break;
    }
  }

  function suggestionTimeout() {
    setSuggestionsVisible(false), setSelelectedSuggestionID(null);
  }

  const renderSuggestions = ({ item, index }: Suggestion) => {
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
          {searchBy == "author"
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
            onSubmitEditing={() => (
              setUserInputEntered(search), setSuggestionsVisible(false)
            )}
            value={search}
            inputContainerStyle={{
              backgroundColor: Colors[colorScheme].searchBarInputContainerStyle,
              borderWidth: 1,
              borderBottomWidth: 1,
              width: windowWidth - 90,
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
          searchBy={searchBy}
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
    right: 5,
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
    left: 8,
    height: 525,
  },
});
