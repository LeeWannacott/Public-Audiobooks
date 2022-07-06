import React, { useState, useRef } from "react";
import { SearchBar, Overlay } from "@rneui/themed";
import Slider from "@react-native-community/slider";
import AudioBooks from "../components/Audiobooks";
import { View, Dimensions, Text } from "react-native";
import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import authorsListJson from "../assets/resources/audiobookAuthorsList.json";
import { genreList } from "../assets/resources/audiobookGenreList";
import { getAsyncData, storeAsyncData } from "../db/database_functions";
import { Button } from "react-native-paper";
import useColorScheme from "../hooks/useColorScheme";
import Colors from "../constants/Colors";
import * as NavigationBar from "expo-navigation-bar";

function Search() {
  const colorScheme = useColorScheme();
  const currentColorScheme = Colors[colorScheme];
  const [search, updateSearch] = useState("");
  const [userInputEntered, setUserInputEntered] = useState("");
  const [requestAudiobookAmount] = useState(26);
  const [visible, setVisible] = useState(false);

  const [statusOfPickers, setStatusOfPickers] = useState({
    authorSelected: false,
    genreSelected: false,
    isSearchDisabled: true,
  });

  const refToSearchbar = useRef(null);
  const [apiSettings, setApiSettings] = useState({
    searchBy: "",
    audiobookGenre: "*Non-fiction",
    authorLastName: "Hoffmann",
    audiobookAmountRequested: 64,
  });

  React.useState(() => {
    try {
      getAsyncData("apiSettings").then((apiSettingsFromStorage) => {
        apiSettingsFromStorage
          ? setApiSettings(apiSettingsFromStorage)
          : setApiSettings({
              ["searchBy"]: "recent",
              ["audiobookGenre"]: "*Non-fiction",
              ["authorLastName"]: "Hoffmann",
              ["audiobookAmountRequested"]: 64,
            });
      });
      getAsyncData("author&GenrePickerSearchbarDisableBools").then(
        (authorGenreSearchbar) => {
          authorGenreSearchbar
            ? setStatusOfPickers(authorGenreSearchbar)
            : setStatusOfPickers({
                authorSelected: false,
                genreSelected: false,
                isSearchDisabled: true,
              });
        }
      );
    } catch (err) {
      console.log(err);
    }
  }, []);

  const storeApiSettings = (tempApiSettings: any) => {
    storeAsyncData("apiSettings", tempApiSettings);
  };

  const storeAuthorGenreEnablePickers = (dropdownPickers: object) => {
    storeAsyncData("author&GenrePickerSearchbarDisableBools", dropdownPickers);
  };

  function changeAudiobookAmountRequested(amount: number) {
    setApiSettings((prevState) => ({
      ...prevState,
      ["audiobookAmountRequested"]: amount,
    }));
    storeApiSettings({
      ...apiSettings,
      ["audiobookAmountRequested"]: amount,
    });
  }

  const toggleOverlay = () => {
    NavigationBar.setBackgroundColorAsync(
      Colors[colorScheme].statusBarBackground
    );
    setVisible(!visible);
  };

  const genreListRender = React.useCallback(
    genreList.map((genre) => {
      return (
        <Picker.Item
          key={`${genre}`}
          label={`${genre}`}
          value={`${genre}`}
          style={{ fontSize: 18 }}
        />
      );
    }),
    [genreList]
  );

  const AuthorsListRender = React.useCallback(
    authorsListJson["authors"].map((author, i: number) => {
      return (
        <Picker.Item
          key={`${authorsListJson["authors"][i].id}`}
          label={`${authorsListJson["authors"][i].first_name} ${authorsListJson["authors"][i].last_name}`}
          value={`${authorsListJson["authors"][i].last_name}`}
          style={{ fontSize: 18 }}
        />
      );
    }),
    [authorsListJson]
  );

  function searchBarPlaceholder() {
    switch (apiSettings["searchBy"]) {
      case "recent":
        return "New Releases";
      case "title":
        return "Enter title:";
      case "author":
        return `Author: ${apiSettings["authorLastName"]}`;
      case "genre":
        return `Genre: ${apiSettings["audiobookGenre"]}`;
    }
  }

  return (
    <View style={styles.test}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors[colorScheme].searchBarBackground,
          width: windowWidth,
          height: 80,
          paddingLeft: 0,
          paddingTop: 10,
          left: -10,
        }}
      >
        <View style={styles.searchStyle}>
          <SearchBar
            ref={(searchbar) => (refToSearchbar.current = searchbar)}
            placeholder={searchBarPlaceholder()}
            disabled={statusOfPickers.isSearchDisabled}
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
              height: 55,
            }}
            inputStyle={{
              backgroundColor: Colors[colorScheme].searchBarInputStyle,
              color: Colors[colorScheme].searchBarTextColor,
              height: 55,
            }}
            searchIcon={{ color: Colors[colorScheme].searchBarSearchIcon }}
            clearIcon={{ color: Colors[colorScheme].searchBarClearIcon }}
            placeholderTextColor={Colors[colorScheme].searchBarClearIcon}
            containerStyle={{
              backgroundColor: Colors[colorScheme].searchBarContainerStyle,
              height: 70,
              borderTopWidth: 0,
              borderBottomWidth: 0,
            }}
          />
        </View>
        <Button
          accessibilityLabel="Search options"
          accessibilityHint="Opens options for searching by Title, Author, Genre and changing amount of audiobooks requested per search."
          onPress={toggleOverlay}
          mode={Colors[colorScheme].buttonMode}
          theme={{
            colors: {
              primary: Colors[colorScheme].buttonBackgroundColor,
            },
          }}
          style={{
            left: -5,
            justifyContent: "center",
            alignItems: "center",
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
          onBackdropPress={toggleOverlay}
          fullScreen={false}
          overlayStyle={{
            backgroundColor: Colors[colorScheme].overlayBackgroundColor,
          }}
        >
          <View style={styles.titleOrAuthorStringFlexbox}>
            <Text
              style={{ color: currentColorScheme.text }}
            >{`Searching by:`}</Text>
          </View>
          <Picker
            mode="dropdown"
            dropdownIconColor={currentColorScheme.pickerDropdownColor}
            style={{
              color: Colors[colorScheme].pickerTextColor,
              backgroundColor: Colors[colorScheme].pickerBackgroundColor,
            }}
            selectedValue={apiSettings["searchBy"]}
            onValueChange={(titleOrGenreOrAuthor, itemIndex) => {
              setApiSettings((prevState) => ({
                ...prevState,
                ["searchBy"]: titleOrGenreOrAuthor,
              }));
              storeApiSettings({
                ...apiSettings,
                ["searchBy"]: titleOrGenreOrAuthor,
              });
              switch (titleOrGenreOrAuthor) {
                case "recent":
                  refToSearchbar.current.clear();
                  setStatusOfPickers({
                    ...statusOfPickers,
                    authorSelected: false,
                    genreSelected: false,
                    isSearchDisabled: true,
                  });
                  storeAuthorGenreEnablePickers({
                    authorSelected: false,
                    genreSelected: false,
                    isSearchDisabled: true,
                  });
                  break;
                case "title":
                  setStatusOfPickers({
                    ...statusOfPickers,
                    authorSelected: false,
                    genreSelected: false,
                    isSearchDisabled: false,
                  });
                  storeAuthorGenreEnablePickers({
                    authorSelected: false,
                    genreSelected: false,
                    isSearchDisabled: false,
                  });
                  break;
                case "genre":
                  refToSearchbar.current.clear();
                  setStatusOfPickers({
                    ...statusOfPickers,
                    authorSelected: false,
                    genreSelected: true,
                    isSearchDisabled: true,
                  });
                  storeAuthorGenreEnablePickers({
                    authorSelected: false,
                    genreSelected: true,
                    isSearchDisabled: true,
                  });
                  break;
                case "author":
                  refToSearchbar.current.clear();
                  setStatusOfPickers({
                    ...statusOfPickers,
                    authorSelected: true,
                    genreSelected: false,
                    isSearchDisabled: true,
                  });
                  storeAuthorGenreEnablePickers({
                    authorSelected: true,
                    genreSelected: false,
                    isSearchDisabled: true,
                  });
                  break;
              }
            }}
          >
            <Picker.Item
              label="New Releases"
              value="recent"
              style={{ fontSize: 18 }}
            />
            <Picker.Item label="Title" value="title" style={{ fontSize: 18 }} />
            <Picker.Item
              label="Author"
              value="author"
              style={{ fontSize: 18 }}
            />
            <Picker.Item label="Genre" value="genre" style={{ fontSize: 18 }} />
          </Picker>
          <View style={styles.titleOrAuthorStringFlexbox}>
            <Text
              style={{ color: currentColorScheme.text }}
            >{`Select Author:`}</Text>
          </View>
          <Picker
            dropdownIconColor={statusOfPickers.authorSelected ? currentColorScheme.pickerDropdownColor : currentColorScheme.overlayBackgroundColor}
            selectedValue={apiSettings["authorLastName"]}
            prompt={"Search by author:"}
            // mode={"dropdown"}
            enabled={statusOfPickers.authorSelected}
            style={{
              color: Colors[colorScheme].pickerTextColor,
              backgroundColor: Colors[colorScheme].pickerBackgroundColor,
            }}
            onValueChange={(author, itemIndex) => {
              setApiSettings((prevState) => ({
                ...prevState,
                ["authorLastName"]: author,
              }));
              storeApiSettings({
                ...apiSettings,
                ["authorLastName"]: author,
              });
            }}
          >
            {AuthorsListRender}
          </Picker>
          <View style={styles.titleOrAuthorStringFlexbox}>
            <Text
              style={{ color: currentColorScheme.text }}
            >{`Select Genre:`}</Text>
          </View>
          <Picker
            dropdownIconColor={statusOfPickers.genreSelected ? currentColorScheme.pickerDropdownColor : currentColorScheme.overlayBackgroundColor}
            style={{
              color: Colors[colorScheme].pickerTextColor,
              backgroundColor: Colors[colorScheme].pickerBackgroundColor,
            }}
            selectedValue={apiSettings["audiobookGenre"]}
            prompt={"Search by genre:"}
            enabled={statusOfPickers.genreSelected}
            onValueChange={(genre, itemIndex) => {
              setApiSettings((prevState) => ({
                ...prevState,
                ["audiobookGenre"]: genre,
              }));
              storeApiSettings({
                ...apiSettings,
                ["audiobookGenre"]: genre,
              });
            }}
          >
            {genreListRender}
          </Picker>
          <View style={styles.checkboxRow}>
            <Text style={{ fontSize: 15 ,color:currentColorScheme.text}}>
              Audiobooks requested per search:{" "}
              {apiSettings["audiobookAmountRequested"]}.
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
              accessibilityHint={`Currently: ${apiSettings.audiobookAmountRequested} requested`}
              onPress={() =>
                apiSettings.audiobookAmountRequested >= 6
                  ? (setApiSettings({
                      ...apiSettings,
                      audiobookAmountRequested:
                        apiSettings.audiobookAmountRequested - 5,
                    }),
                    changeAudiobookAmountRequested(
                      apiSettings.audiobookAmountRequested - 5
                    ))
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
              value={apiSettings["audiobookAmountRequested"]}
              maximumValue={420}
              minimumValue={1}
              onValueChange={changeAudiobookAmountRequested}
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
              accessibilityHint={`Currently ${apiSettings.audiobookAmountRequested} requested`}
              onPress={() =>
                apiSettings.audiobookAmountRequested <= 415
                  ? (setApiSettings({
                      ...apiSettings,
                      audiobookAmountRequested:
                        apiSettings.audiobookAmountRequested + 5,
                    }),
                    changeAudiobookAmountRequested(
                      apiSettings.audiobookAmountRequested + 5
                    ))
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
      <View style={styles.scrollStyle}>
        <AudioBooks
          apiSettings={apiSettings}
          searchBarInputSubmitted={userInputEntered}
          searchBarCurrentText={search}
          requestAudiobookAmount={requestAudiobookAmount}
        />
      </View>
    </View>
  );
}

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
export default Search;

const styles = StyleSheet.create({
  searchStyle: {
    width: windowWidth - 80,
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
    height: windowHeight / 1.225,
  },
});
