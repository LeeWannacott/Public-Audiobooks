import React, { useState, useRef } from "react";
import { SearchBar, Overlay, Slider } from "@rneui/themed";
import AudioBooks from "../components/Audiobooks";
import { View, Dimensions, Text } from "react-native";
import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import authorsListJson from "../assets/resources/audiobookAuthorsList.json";
import { genreList } from "../assets/resources/audiobookGenreList";
import { getAsyncData, storeAsyncData } from "../db/database_functions";
import { Button } from "react-native-paper";

function Search() {
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
      <View style={styles.searchBarAndSettingsIcon}>
        <View style={styles.searchStyle}>
          <SearchBar
            ref={(searchbar) => (refToSearchbar.current = searchbar)}
            placeholder={searchBarPlaceholder()}
            disabled={statusOfPickers.isSearchDisabled}
            onChangeText={(val: string) => {
              updateSearch(val);
            }}
            onSubmitEditing={() => setUserInputEntered(search)}
            value={search}
            inputContainerStyle={{ backgroundColor: "#F9F6EE", height: 55 }}
            inputStyle={{ backgroundColor: "#F9F6EE", height: 55 }}
            containerStyle={{ backgroundColor: "black", height: 70 }}
          />
        </View>
        <Button
          accessibilityLabel="Search options"
          accessibilityHint="Opens options for searching by Title, Author, Genre and changing amount of audiobooks requested per search."
          onPress={toggleOverlay}
          mode="contained"
          style={styles.settingsIcon}
        >
          <MaterialCommunityIcons name="cog" size={40} color="#F9F6EE" />
        </Button>
        <Overlay
          isVisible={visible}
          onBackdropPress={toggleOverlay}
          fullScreen={false}
          overlayStyle={{ backgroundColor: "#F9F6EE" }}
        >
          <View style={styles.titleOrAuthorStringFlexbox}>
            <Text>{`Searching by:`}</Text>
          </View>
          <Picker
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
            <Text>{`Select Author:`}</Text>
          </View>

          <Picker
            selectedValue={apiSettings["authorLastName"]}
            prompt={"Search by author:"}
            // mode={"dropdown"}
            enabled={statusOfPickers.authorSelected}
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
            <Text>{`Select Genre:`}</Text>
          </View>

          <Picker
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
            <Text style={{ fontSize: 15 }}>
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
              mode="contained"
              style={{ backgroundColor: "#F9F6EE" }}
            >
              <MaterialCommunityIcons name="minus" size={30} color="black" />
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
                backgroundColor: "transparent",
              }}
              thumbStyle={{
                height: 12,
                width: 12,
                backgroundColor: "black",
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
              mode="contained"
              style={{ backgroundColor: "#F9F6EE" }}
            >
              <MaterialCommunityIcons name="plus" size={30} color="black" />
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
  searchBarAndSettingsIcon: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    width: windowWidth,
    height: 80,
    backgroundColor: "black",
    paddingLeft: 0,
    paddingTop: 10,
    left: -10,
  },
  searchStyle: {
    backgroundColor: "orange",
    width: windowWidth - 80,
  },
  settingsIcon: {
    backgroundColor: "black",
    left: -5,
    height: 62,
    borderWidth: 1,
    top: 5,
    borderRadius: 2,
  },
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
  test: {},
});
