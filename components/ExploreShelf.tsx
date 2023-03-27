import {
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
  Dimensions,
  Text,
} from "react-native";
import { Rating } from "react-native-ratings";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Audiobook, Review } from "../types.js";

import AudiobookAccordionList from "../components/audiobookAccordionList";
import AudiobookCover from "./AudiobookCover";

import { openDatabase } from "../db/utils";
import {
  createHistoryTableDB,
  createAudioBookDataTable,
  addAudiobookToHistoryDB,
  audiobookProgressTableName,
  initialAudioBookProgressStoreDB,
} from "../db/database_functions";
import useColorScheme from "../hooks/useColorScheme";
import Colors from "../constants/Colors";
import { Pressable } from "react-native";
const db = openDatabase();

export default function ExploreShelf(props: any) {
  const colorScheme = useColorScheme();
  const [loadingAudioBooks, setLoadingAudioBooks] = useState(true);
  const [data, setAudiobooks] = useState<any>([]);
  const [bookCovers, setBookCovers] = useState<any[]>([]);
  const [reviewURLS, setReviewsUrlList] = useState<any[]>([]);
  const [audiobooksProgress, setAudiobooksProgress] = useState({});
  const {
    apiSettings,
    requestAudiobookAmount,
    loadingAudiobookAmount,
    setLoadingAudiobookAmount,
    searchBarCurrentText,
    searchBarInputSubmitted,
    searchBy,
    setGettingAverageReview,
  } = props;

  useEffect(() => {
    try {
      createAudioBookDataTable(db);
      createHistoryTableDB(db);
    } catch (err) {
      console.log(err);
    }
  }, []);

  function addAudiobookToHistory(index: number, item: Audiobook): void {
    addAudiobookToHistoryDB(db, {
      audiobook_rss_url: item?.url_rss,
      audiobook_id: item?.id,
      audiobook_image: bookCovers[index],
      audiobook_num_sections: item?.num_sections,
      audiobook_ebook_url: item?.url_text_source,
      audiobook_zip: item?.url_zip_file,
      audiobook_title: item?.title,
      audiobook_author_first_name: item?.authors[0]?.first_name,
      audiobook_author_last_name: item?.authors[0]?.last_name,
      audiobook_total_time: item?.totaltime,
      audiobook_total_time_secs: item?.totaltimesecs,
      audiobook_copyright_year: item?.copyright_year,
      audiobook_genres: JSON.stringify(item?.genres),
      audiobook_review_url: reviewURLS[index],
      audiobook_language: item?.language,
      audiobook_project_url: item?.url_project,
      audiobook_librivox_url: item?.url_librivox,
      audiobook_iarchive_url: item?.url_iarchive,
    });
  }

  function getAverageAudiobookReview(index: number) {
    if (reviewURLS[index]) {
      let initialValue = 0;
      const averageReview = fetch(reviewURLS[index])
        .then((response) => response.json())
        .then((json) => {
          if (json?.result !== undefined) {
            let stars = json?.result
              .map((review: Review) => Number(review?.stars))
              .reduce(
                (accumulator: number, currentValue: number) =>
                  accumulator + currentValue,
                initialValue
              );
            const averageReview = stars / json?.result.length;
            if (!isNaN(averageReview)) {
              return averageReview;
            } else {
              return undefined;
            }
          }
        })
        .catch((err) => console.error(err));
      return averageReview;
    }
  }

  const requestAudiobooksFromAPI = () => {
    let searchQuery;
    if (searchBarInputSubmitted === "defaultTitleSearch") {
      searchQuery = "";
    } else {
      searchQuery = encodeURIComponent(searchBarInputSubmitted);
    }
    const amountOfAudiobooks = encodeURIComponent(requestAudiobookAmount);
    const librivoxAudiobooksAPI = encodeURI(
      "https://librivox.org/api/feed/audiobooks"
    );
    const carot = encodeURIComponent("^");
    // fields removed: sections(adds to loading time), description(not url decoded),translators.
    const fields =
      "id,title,url_text_source,language,copyright_year,num_sections,url_rss,url_zip_file,url_project,url_librivox,url_iarchive,url_other,totaltime,totaltimesecs,authors,genres";
    let apiFetchQuery;
    switch (searchBy) {
      case "recent":
        const oneMonthsAgoInUnixTime =
          // TODO: Add a range slider for period of time; currently is for past month...
          (new Date().getTime() - 30 * 24 * 60 * 60 * 1000) / 1000;
        apiFetchQuery = encodeURI(
          `${librivoxAudiobooksAPI}/?since=${oneMonthsAgoInUnixTime}&fields={${fields}}&extended=1&format=json&limit=${amountOfAudiobooks}`
        );
        break;
      case "title":
        apiFetchQuery = encodeURI(
          `${librivoxAudiobooksAPI}/?title=${carot}${searchQuery}&fields={${fields}}&extended=1&format=json&limit=${amountOfAudiobooks}`
        );
        break;
      case "author":
        apiFetchQuery = encodeURI(
          `${librivoxAudiobooksAPI}/?author=${searchQuery}&fields={${fields}}&extended=1&format=json&limit=${amountOfAudiobooks}`
        );
        break;
      case "genre":
        apiFetchQuery = encodeURI(
          `${librivoxAudiobooksAPI}/?genre=${searchQuery}&fields={${fields}}&extended=1&format=json&limit=${amountOfAudiobooks}`
        );
        break;
      default:
        break;
    }
    if (searchBy) {
      fetch(apiFetchQuery)
        .then((response) => response.json())
        .then((json) => setAudiobooks(json))
        .catch((error) => console.error(error))
        .finally(() => {
          setLoadingAudioBooks(false);
          setLoadingAudiobookAmount(false);
        });
    }
  };

  const timesAudiobookAmountSet = useRef(0);

  useEffect(() => {
    if (timesAudiobookAmountSet.current < 2) {
      timesAudiobookAmountSet.current += 1;
    } else {
      setLoadingAudiobookAmount(true);
      requestAudiobooksFromAPI();
    }
  }, [requestAudiobookAmount]);

  const timesSearchBarSet = useRef(0);
  useEffect(() => {
    switch (searchBy) {
      case "recent":
        setLoadingAudioBooks(true);
        requestAudiobooksFromAPI();
        break;
      case "genre":
      case "author":
      case "title":
        if (timesSearchBarSet.current < 1) {
          timesSearchBarSet.current += 1;
        } else {
          setLoadingAudioBooks(true);
          requestAudiobooksFromAPI();
        }
        break;
    }
  }, [searchBarInputSubmitted]);

  const bookCoverURL: string[] = [];
  const reviewsURL: string[] = [];
  useEffect(() => {
    if (data.books) {
      const dataKeys = Object.values(data.books);
      let bookCoverImagePath;
      dataKeys.forEach((bookCoverURLPath: any) => {
        bookCoverImagePath = bookCoverURLPath.url_zip_file.split("/");
        bookCoverImagePath = bookCoverImagePath[bookCoverImagePath.length - 2];
        const reviewUrl = encodeURI(
          `https://archive.org/metadata/${bookCoverImagePath}/reviews/`
        );
        bookCoverImagePath = encodeURI(
          `https://archive.org/services/get-item-image.php?identifier=${bookCoverImagePath}`
        );
        bookCoverURL.push(bookCoverImagePath);
        reviewsURL.push(reviewUrl);
      });
      setBookCovers(bookCoverURL);
      setReviewsUrlList(reviewsURL);
    }
  }, [data.books]);

  const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const query = `select * from ${audiobookProgressTableName}`;
      db.transaction((tx) => {
        tx.executeSql(`${query}`, [], (_, { rows }) => {
          const audioProgressData = {};
          rows._array.forEach((row) => {
            return (audioProgressData[row.audiobook_id] = row);
          });
          setAudiobooksProgress(audioProgressData);
        });
      }, undefined);
    });
    return unsubscribe;
  }, [navigation]);

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const resizeCoverImageHeight = windowHeight / 5;
  const resizeCoverImageWidth = windowWidth / 2 - 42;
  const keyExtractor = (item: any, index: number) => item?.id;
  const renderItem = ({ item, index }) => (
    <View>
      <AudiobookCover
        item={item}
        index={index}
        db={db}
        audiobooksProgress={audiobooksProgress}
        setAudiobooksProgress={setAudiobooksProgress}
        addAudiobookToHistory={addAudiobookToHistory}
        getAverageAudiobookReview={getAverageAudiobookReview}
        bookCovers={bookCovers}
        reviewURLS={reviewURLS}
        resizeCoverImageWidth={resizeCoverImageWidth}
        resizeCoverImageHeight={resizeCoverImageHeight}
        windowWidth={windowWidth}
        windowHeight={windowHeight}
      />
      {audiobooksProgress[item?.id]?.audiobook_id == item?.id &&
      audiobooksProgress[item?.id]?.audiobook_rating > 0 ? (
        <Rating
          showRating={false}
          imageSize={20}
          ratingCount={5}
          startingValue={audiobooksProgress[item?.id]?.audiobook_rating}
          readonly={true}
          tintColor={Colors[colorScheme].ratingBackgroundColor}
        />
      ) : (
        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1.0 }]}
          onPress={() => {
            let initialAudioBookSections = new Array(item?.num_sections).fill(
              0
            );
            let shelvedStatus: boolean;
            if (audiobooksProgress[item?.id]) {
              shelvedStatus = audiobooksProgress[item?.id]?.audiobook_shelved;
            } else {
              shelvedStatus = false;
            }
            setGettingAverageReview(true);
            getAverageAudiobookReview(index)
              .then((avgReview) => {
                if (avgReview) {
                  const initAudioBookData = {
                    audiobook_id: item?.id,
                    audiotrack_progress_bars: JSON.stringify(
                      initialAudioBookSections
                    ),
                    current_audiotrack_positions: JSON.stringify(
                      initialAudioBookSections
                    ),
                    audiobook_shelved: shelvedStatus,
                    audiobook_rating: avgReview,
                  };
                  audiobooksProgress[item?.id] = initAudioBookData;
                  setAudiobooksProgress((audiobooksProgress) => ({
                    ...audiobooksProgress,
                    audiobook_id: {
                      initAudioBookData,
                    },
                  }));
                  initialAudioBookProgressStoreDB(db, initAudioBookData);
                } else {
                  console.log("no review found")
                  // no review found logic
                }
              })
              .catch((err) => console.log("ERROR: ", err))
              .finally(() => setGettingAverageReview(false));
          }}
        >
          {/* todo: find appropiate color for get rating text */}
          <Text
            style={{
              color: Colors[colorScheme].shelveAudiobookIconColor,
              textAlign: "center",
            }}
          >
            Get rating
          </Text>
        </Pressable>
      )}
      <AudiobookAccordionList
        accordionTitle={item?.title}
        audiobookTitle={item?.title}
        audiobookAuthorFirstName={item?.authors[0]?.first_name}
        audiobookAuthorLastName={item?.authors[0]?.last_name}
        audiobookTotalTime={item?.totaltime}
        audiobookCopyrightYear={item?.copyright_year}
        audiobookGenres={JSON.stringify(item?.genres)}
        audiobookLanguage={item?.language}
      />
    </View>
  );

  if (!loadingAudioBooks) {
    return (
      <View style={styles.audiobookContainer}>
        <FlatList
          data={data.books}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={2}
        />
      </View>
    );
  } else {
    return (
      <View>
        <ActivityIndicator
          accessibilityLabel={"loading"}
          size="large"
          color={Colors[colorScheme].activityIndicatorColor}
          style={styles.ActivityIndicatorStyle}
        />
      </View>
    );
  }
}

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  ImageContainer: {
    flexDirection: "column",
    width: windowWidth / 2 - 40,
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 2,
  },
  audiobookContainer: {
    marginTop: 2,
    borderRadius: 2,
  },
  ActivityIndicatorStyle: {
    top: windowHeight / 2 - 90,
  },
});
