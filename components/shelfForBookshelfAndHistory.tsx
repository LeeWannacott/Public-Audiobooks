import React from "react";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { ListItem, LinearProgress } from "@rneui/themed";
import { Rating } from "react-native-ratings";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  FlatList,
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import AudiobookAccordionList from "../components/audiobookAccordionList";
import PickerForHistoryAndBookShelf from "../components/PickerForHistoryAndBookShelf";

import { openDatabase, roundNumberTwoDecimal } from "../db/utils";
import {
  audiobookProgressTableName,
  getAsyncData,
  storeAsyncData,
} from "../db/database_functions";

const db = openDatabase();

function ShelfForBookshelfAndHistory(props: any) {
  const [audioBookInfo, setAudioBookInfo] = useState({});
  const [avatarOnPressEnabled, setAvatarOnPressEnabled] = useState(true);

  const [pickerAndQueryState, setPickerAndQueryState] = useState<any>({
    toggle: 0,
    order: "ASC",
    orderBy: "order by id",
    icon: "sort-ascending",
    pickerIndex: 0,
  });

  function toggleAscOrDescSort() {
    if (pickerAndQueryState.toggle == 0) {
      setPickerAndQueryState({
        ...pickerAndQueryState,
        toggle: 1,
        order: "DESC",
        icon: "sort-descending",
      });
      props.getShelvedBooks({
        ...pickerAndQueryState,
        toggle: 1,
        order: "DESC",
        icon: "sort-descending",
      });
      storeAsyncData(props.asyncDataKeyName, {
        ...pickerAndQueryState,
        toggle: 1,
        order: "DESC",
        icon: "sort-descending",
      });
    } else {
      setPickerAndQueryState({
        ...pickerAndQueryState,
        toggle: 0,
        order: "ASC",
        icon: "sort-ascending",
      });
      props.getShelvedBooks({
        ...pickerAndQueryState,
        toggle: 0,
        order: "ASC",
        icon: "sort-ascending",
      });
      storeAsyncData(props.asyncDataKeyName, {
        ...pickerAndQueryState,
        toggle: 0,
        order: "ASC",
        icon: "sort-ascending",
      });
    }
  }

  const keyExtractor = (item, index) => item.audiobook_id.toString();
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const navigation = useNavigation();
  const resizeCoverImageHeight = windowHeight / 5;
  const resizeCoverImageWidth = windowWidth / 2 - 42;

  function selectAccordionPickerTitle(pickerIndex, item) {
    switch (pickerIndex) {
      case 0:
        return item?.id + ". " + item?.audiobook_title;
      case 1:
        return item?.audiobook_title;
      case 2:
        return audioBookInfo[item?.audiobook_id]?.audiobook_rating;
      case 3:
        return (
          roundNumberTwoDecimal(
            audioBookInfo[item?.audiobook_id]?.listening_progress_percent * 100
          ) + "%"
        );
      case 4:
        return item?.audiobook_author_first_name;
      case 5:
        return item?.audiobook_author_last_name;
      case 6:
        return item?.audiobook_total_time;
      case 7:
        return item?.audiobook_language;
      case 8:
        return JSON.parse(item.audiobook_genres)[0].name;
      case 9:
        return item?.audiobook_copyright_year;
    }
  }

  const renderItem = ({ item, index }: any) => (
    <View>
      <ListItem topDivider containerStyle={styles.AudioBookListView}>
        <View style={styles.ImageContainer}>
          <Pressable
            accessibilityLabel={`${item?.audiobook_title}`}
            style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1.0 }]}
            onPress={() => {
              if (avatarOnPressEnabled) {
                navigation.navigate("Audio", {
                  audioBookId: item?.audiobook_id,
                  urlRss: item?.audiobook_rss_url,
                  coverImage: item?.audiobook_image,
                  title: item?.audiobook_title,
                  authorFirstName: item?.audiobook_author_first_name,
                  authorLastName: item?.audiobook_author_last_name,
                  totalTime: item?.audiobook_total_time,
                  totalTimeSecs: item?.audiobook_total_time_secs,
                  copyrightYear: item?.audiobook_copyright_year,
                  genres: JSON.parse(item?.audiobook_genres),
                  language: item?.audiobook_language,
                  urlReview: item?.audiobook_review_url,
                  numSections: item?.audiobook_num_sections,
                  urlTextSource: item?.audiobook_ebook_url,
                  urlZipFile: item?.audiobook_zip,
                  urlProject: item?.audiobook_project_url,
                  urlLibrivox: item?.audiobook_librivox_url,
                  urlIArchive: item?.audiobook_iarchive_url,
                });
              }
              setAvatarOnPressEnabled(false);
              setTimeout(() => {
                setAvatarOnPressEnabled(true);
              }, 2000);
            }}
          >
            <Image
              source={{ uri: item.audiobook_image }}
              style={{
                width: resizeCoverImageWidth,
                height: resizeCoverImageHeight,
              }}
            />

            <MaterialCommunityIcons
              name={
                audioBookInfo[item.audiobook_id]?.audiobook_shelved
                  ? "star"
                  : undefined
              }
              size={30}
              color={"#DAA520"}
              style={{
                margin: 5,
                position: "absolute",
                top: 0,
                right: 0,
                width: 27,
                height: 55,
              }}
            />
          </Pressable>

          <LinearProgress
            color="#50C878"
            value={audioBookInfo[item.audiobook_id]?.listening_progress_percent}
            variant="determinate"
            trackColor="#DCDCDC"
            animation={false}
          />
        </View>
      </ListItem>
      {audioBookInfo[item.audiobook_id]?.audiobook_id == item.audiobook_id &&
      audioBookInfo[item.audiobook_id]?.audiobook_rating > 0 ? (
        <Rating
          showRating={false}
          imageSize={20}
          ratingCount={5}
          startingValue={audioBookInfo[item.audiobook_id]?.audiobook_rating}
          readonly={true}
          tintColor={"black"}
        />
      ) : undefined}
      <AudiobookAccordionList
        accordionTitle={selectAccordionPickerTitle(
          pickerAndQueryState.pickerIndex,
          item
        )}
        audiobookTitle={item?.audiobook_title}
        audiobookAuthorFirstName={item?.audiobook_author_first_name}
        audiobookAuthorLastName={item?.audiobook_author_last_name}
        audiobookTotalTime={item?.audiobook_total_time}
        audiobookCopyrightYear={item?.audiobook_copyright_year}
        audiobookGenres={item?.audiobook_genres}
        audiobookLanguage={item?.audiobook_language}
      />
    </View>
  );

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // The screen is focused
      // Call any action
      try {
        db.transaction((tx) => {
          tx.executeSql(
            `select * from ${audiobookProgressTableName}`,
            [],
            (_, { rows }) => {
              const audioProgressData = {};
              rows._array.forEach((row) => {
                return (audioProgressData[row.audiobook_id] = row);
              });
              // console.log(audioProgressData);
              setAudioBookInfo(audioProgressData);
            }
          );
        }, null);

        getAsyncData(props.asyncDataKeyName).then(
          (pickerAndQueryDataRetrieved) => {
            if (pickerAndQueryDataRetrieved) {
              props.getShelvedBooks(pickerAndQueryDataRetrieved);
              return setPickerAndQueryState(pickerAndQueryDataRetrieved);
            } else {
              props.getShelvedBooks(pickerAndQueryState);
            }
          }
        );
      } catch (err) {
        console.log(err);
      }
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  if (!props.loadingHistory) {
    return (
      <View>
        <PickerForHistoryAndBookShelf
          pickerAndQueryState={pickerAndQueryState}
          setPickerAndQueryState={setPickerAndQueryState}
          getShelvedBooks={props.getShelvedBooks}
          toggleAscOrDescSort={toggleAscOrDescSort}
          storeAsyncData={storeAsyncData}
          asyncDataKeyName={props.asyncDataKeyName}
        />
        <View style={styles.flatListStyle}>
          <FlatList
            data={props.audiobookHistory}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            numColumns={2}
          />
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.pickerContainer}>
        <PickerForHistoryAndBookShelf
          pickerAndQueryState={pickerAndQueryState}
          setPickerAndQueryState={setPickerAndQueryState}
          getShelvedBooks={props.getShelvedBooks}
          toggleAscOrDescSort={toggleAscOrDescSort}
          storeAsyncData={storeAsyncData}
          asyncDataKeyName={props.asyncDataKeyName}
        />
        <View style={styles.flatListStyle}>
          <View style={styles.ActivityIndicatorStyle}>
            <ActivityIndicator
              size="large"
              color="#50C878"
              accessibilityLabel={"loading"}
            />
          </View>
        </View>
      </View>
    );
  }
}

export default ShelfForBookshelfAndHistory;

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const flatlistHeight = windowHeight / 1.25;
const ImageContainerWidth = windowWidth / 2 - 40;

const styles = StyleSheet.create({
  ImageContainer: {
    flexDirection: "column",
    backgroundColor: "white",
    width: ImageContainerWidth,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 2,
  },
  flatListStyle: {
    padding: 10,
    paddingTop: 2,
    paddingBottom: 0,
    height: flatlistHeight,
    backgroundColor: "#331800",
  },
  AudioBookListView: {
    backgroundColor: "#51361a",
  },
  ActivityIndicatorStyle: {
    top: windowHeight / 3,
    backgroundColor: "#331800",
    color: "#50C878",
  },
  pickerContainer: {
    backgroundColor: "#331800",
  },
});
