import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Dimensions, Image } from "react-native";
import { ListItem, LinearProgress, Card } from "@rneui/themed";
import { Rating } from "react-native-ratings";
import * as rssParser from "react-native-rss-parser";
import { Audio } from "expo-av";
import { StyleSheet, Text, View, SectionList } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

import { Button } from "react-native-paper";
import AudioTrackControls from "../components/audioTrackControls";
import AudioTrackSettings from "../components/audioTrackSettings";
import AudiotrackSliderWithCurrentPlaying from "../components/AudiotrackSliderWithCurrentPlaying";
import MakeUserReview from "../components/audioTrackMakeReview";

import { openDatabase, roundNumberTwoDecimal } from "../db/utils";
import { useNavigation } from "@react-navigation/native";

const db = openDatabase();
import {
  createAudioBookDataTable,
  updateAudioTrackPositionsDB,
  updateIfBookShelvedDB,
  initialAudioBookStoreDB,
  updateAudiobookRatingDB,
  updateAudioTrackIndexDB,
  audiobookProgressTableName,
  updateUsersAudiobookReviewDB,
} from "../db/database_functions";

import { getAsyncData, storeAsyncData } from "../db/database_functions";

function Audiotracks(props: any) {
  const [reviewInformation, setReviewInformation] = useState({
    reviewTitle: "",
    reviewText: "",
    reviewRating: 0,
  });
  const [userChangedReview, setUserChangedReview] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [dataRSS, setDataRSS] = useState<any[]>([]);
  const [URLSToPlayAudiotracks, setURLSToPlayAudiotracks] = useState<any[]>([]);
  const [reviews, setAudiobookReviews] = useState([]);
  const [AudioBookDescription, setAudioBookDescription] = useState("");
  const currentAudioTrackIndex = useRef(0);
  const [loadingAudiobookData, setLoadingAudioBookData] = useState(true);
  const [loadingAudioListeningLinks, setLoadingAudioListeningLinks] =
    useState(true);
  const [audiotrackLoadingStatuses, setAudiotrackLoadingStatuses] = useState({
    loadedCurrentAudiotrack: false,
    loadingCurrentAudiotrack: false,
  });
  const [audioPaused, setAudioPaused] = useState(false);
  const [Playing, setPlaying] = useState(false);
  const [currentAudiotrackPlayingInfo, setCurrentPlayingInformation] = useState(
    {
      audioTrackChapterPlayingTitle: "",
      audioTrackReader: "",
      Duration: 0,
    }
  );

  const [currentSliderPosition, setCurrentSliderPosition] = React.useState(0.0);
  const [visible, setVisible] = useState(false);
  const [makeReviewOptions, setMakeReviewOptions] = useState(false);
  const [audioPlayerSettings, setAudioPlayerSettings] = useState({
    rate: 1.0,
    shouldCorrectPitch: true,
    volume: 1.0,
    isMuted: false,
    isLooping: false,
    shouldPlay: false,
  });
  const [audiotracksData, setAudiotracksData] = useState<any>({
    linearProgessBars: [],
    currentAudiotrackPositionsMs: [],
    shelveIconToggle: 0,
    audiobookRating: 0,
    totalAudioBookListeningProgress: 0,
    totalAudioBookListeningTimeMS: 0,
  });
  const [audioModeSettings, setAudioModeSettings] = useState<any>({
    staysActiveInBackground: true,
    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: true,
  });

  const {
    urlRss,
    audioBookId,
    coverImage,
    numSections,
    urlTextSource,
    urlZipFile,
    title,
    authorFirstName,
    authorLastName,
    totalTime,
    totalTimeSecs,
    copyrightYear,
    genres,
    urlReview,
    language,
    urlProject,
    urlLibrivox,
    urlIArchive,
  } = props.route.params;
  // console.log(props.route.params)

  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    try {
      navigation.setOptions({
        headerStyle: {
          backgroundColor: "#F9F6EE",
        },
        headerTitleStyle:{fontWeight:"bold"},
        headerTintColor:"black",
        headerTitle: title,
        headerRight: () => (
          <Button
            accessibilityLabel="Audiotack player settings"
            accessibilityHint="Contains options such as changing speed of audiotrack."
            mode={"outlined"}
            onPress={() => toggleSettingsOverlay()}
          >
            <MaterialCommunityIcons name="cog" size={30} color="black" />
          </Button>
        ),
      });
    } catch (err) {
      console.log(err);
    }
  }, [title]);

  React.useEffect(() => {
    try {
      getAsyncData("audioModeSettings").then((audioModeSettingsRetrieved) => {
        audioModeSettingsRetrieved;
        if (audioModeSettingsRetrieved) {
          return setAudioModeSettings(audioModeSettingsRetrieved);
        }
      });
      getAsyncData("audioTrackSettingsTest").then(
        (audioTrackSettingsRetrieved) => {
          if (audioTrackSettingsRetrieved) {
            return setAudioPlayerSettings(audioTrackSettingsRetrieved);
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
  }, []);

  const storeAudioTrackSettings = async (settings: object) => {
    await storeAsyncData("audioTrackSettingsTest", settings);
  };

  useEffect(() => {
    try {
      createAudioBookDataTable(db);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const updateAudioBookPosition = async (
    audiobook_id: any,
    audiotrack_progress_bars: any,
    current_audiotrack_positions: any
  ) => {
    try {
      const initialValue = 0;
      const current_listening_time = current_audiotrack_positions.reduce(
        (previousValue: any, currentValue: any) =>
          previousValue + Number(currentValue),
        initialValue
      );
      const listening_progress_percent =
        current_listening_time / 1000 / totalTimeSecs;
      audiotrack_progress_bars = JSON.stringify(audiotrack_progress_bars);
      current_audiotrack_positions = JSON.stringify(
        current_audiotrack_positions
      );
      updateAudioTrackPositionsDB(db, {
        audiotrack_progress_bars,
        listening_progress_percent,
        current_listening_time,
        current_audiotrack_positions,
        audiobook_id,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const updateBookShelve = (
    audiobook_id: number | string,
    audiobook_shelved: boolean
  ) => {
    updateIfBookShelvedDB(db, audiobook_id, audiobook_shelved);
  };
  const initialAudioBookStore = (initAudioBookData: any) => {
    initAudioBookData.audiotrack_progress_bars = JSON.stringify(
      initAudioBookData.audiotrack_progress_bars
    );
    initAudioBookData.current_audiotrack_positions = JSON.stringify(
      initAudioBookData.current_audiotrack_positions
    );
    initialAudioBookStoreDB(db, initAudioBookData);
    // initial load of audiotrack data from DB.
    db.transaction((tx) => {
      try {
        tx.executeSql(
          `select * from ${audiobookProgressTableName}`,
          [],
          (_, { rows }) => {
            rows["_array"].forEach((element) => {
              if (initAudioBookData.audiobook_id === element.audiobook_id) {
                if (element?.current_audiotrack_index) {
                  currentAudioTrackIndex.current =
                    element?.current_audiotrack_index;
                }
                const TotalListenTimeAndProgress = updateCoverBookProgress(
                  element?.current_audiotrack_positions
                );
                setAudiotracksData({
                  ...audiotracksData,
                  linearProgessBars: JSON.parse(
                    element?.audiotrack_progress_bars
                  ),
                  currentAudiotrackPositionsMs: JSON.parse(
                    element?.current_audiotrack_positions
                  ),
                  shelveIconToggle: element?.audiobook_shelved,
                  audiobookRating: element?.audiobook_rating,
                  totalAudioBookListeningTimeMS: TotalListenTimeAndProgress[0],
                  totalAudioBookListeningProgress:
                    TotalListenTimeAndProgress[1],
                });
                if (element?.users_audiobook_review !== undefined) {
                  setReviewInformation(
                    JSON.parse(element?.users_audiobook_review)
                  );
                }
              }
            });
          }
        );
      } catch (err) {
        console.log(err);
      }
    }, null);
  };


  useEffect(() => {
    async function setAudioMode() {
      // InterruptionModeAndroid[InterruptionModeAndroid["DoNotMix"] = 1] = "DoNotMix";
      // InterruptionModeAndroid[InterruptionModeAndroid["DuckOthers"] = 2] = "DuckOthers";
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: 0,
          playsInSilentModeIOS: true,
          staysActiveInBackground: audioModeSettings.staysActiveInBackground,
          interruptionModeAndroid: 2,
          shouldDuckAndroid: audioModeSettings.shouldDuckAndroid,
          playThroughEarpieceAndroid:
            audioModeSettings.playThroughEarpieceAndroid,
        });
      } catch (e) {
        console.log(e);
      }
    }
    setAudioMode();
  }, [audioModeSettings]);
  const sound = React.useRef(new Audio.Sound());

  useEffect(() => {
    fetch(urlRss)
      .then((response) => response.text())
      .then((responseData) => rssParser.parse(responseData))
      .then((rss) => {
        if (rss?.description !== undefined) {
          setAudioBookDescription(rss?.description);
        }
        if (rss?.items !== undefined) {
          setDataRSS(rss?.items);
        }
      })
      .catch((error) => console.log("Error: ", error))
      .finally(() => {
        setLoadingAudioListeningLinks(false);
      });
  }, []);

  useEffect(() => {
    fetch(
      `https://librivox.org/api/feed/audiobooks/?id=${audioBookId}&fields={sections}&extended=1&format=json`
    )
      .then((response) => response.json())
      .then((json) => {
        return setChapters(json?.books?.[0]?.sections);
      })
      .catch((error) => console.log("Error: ", error))
      .finally(() => setLoadingAudioBookData(false));
  }, []);

  useEffect(() => {
    fetch(urlReview)
      .then((response) => response.json())
      .then((json) => {
        if (json?.result !== undefined) {
          setAudiobookReviews(json.result);
        }
      })
      .catch((error) => console.log("Error: ", error));
  }, [urlReview, userChangedReview]);

  function updateCoverBookProgress(current_audiotrack_positions: any) {
    const initialValue = 0;
    const currentTimeReadInBook = JSON.parse(
      current_audiotrack_positions
    ).reduce(
      (previousValue: any, currentValue: any) =>
        previousValue + Number(currentValue),
      initialValue
    );
    const currentListeningProgress =
      currentTimeReadInBook / 1000 / totalTimeSecs;
    return [currentTimeReadInBook, currentListeningProgress];
  }

  useEffect(() => {
    try {
      if (reviews.length > 0 && reviews) {
        const initialValue = 0;
        let starsFromReviews = reviews?.map((review: any) =>
          Number(review?.stars)
        );
        const sumOfStarsFromReviews = starsFromReviews?.reduce(
          (previousValue, currentValue) => previousValue + currentValue,
          initialValue
        );
        let averageAudiobookRating = 0;
        if (reviews.length == 1) {
          averageAudiobookRating = sumOfStarsFromReviews;
        } else {
          averageAudiobookRating =
            sumOfStarsFromReviews / starsFromReviews.length;
        }
        setAudiotracksData({
          ...audiotracksData,
          audiobookRating: averageAudiobookRating,
        });
        updateAudiobookRatingDB(
          db,
          audioBookId,
          roundNumberTwoDecimal(averageAudiobookRating)
        );
      }
    } catch (e) {
      console.log(e);
    }
  }, [reviews]);

  useEffect(() => {
    try {
      let initialAudioBookSections = new Array(numSections).fill(0);
      setAudiotracksData({
        ...audiotracksData,
        linearProgessBars: initialAudioBookSections,
        currentAudiotrackPositionsMs: initialAudioBookSections,
      });
      // will only happen if no entry in db already.

      initialAudioBookStore({
        audiobook_id: audioBookId,
        audiotrack_progress_bars: initialAudioBookSections,
        current_audiotrack_positions: initialAudioBookSections,
        audiobook_shelved: audiotracksData.shelveIconToggle,
        audiotrack_rating: audiotracksData.audiobookRating,
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    try {
      return sound
        ? () => {
            sound.current.unloadAsync();
          }
        : undefined;
    } catch (err) {
      console.log(err);
    }
  }, [sound.current]);

  function sliderPositionCalculation(progress: number) {
    let sliderPositionCalculate = progress * 100;
    return sliderPositionCalculate;
  }
  async function updateLinearProgressBars(progress: number) {
    let updatedLinearProgessBarPositions = [
      ...audiotracksData.linearProgessBars,
    ];
    updatedLinearProgessBarPositions[currentAudioTrackIndex.current] =
      audiotracksData.linearProgessBars[currentAudioTrackIndex.current] =
        progress;
  }
  async function updateAudiotrackPositions(dataPosition: number) {
    let updatedCurrentAudiotrackPositions = [
      ...audiotracksData.currentAudiotrackPositionsMs,
    ];
    updatedCurrentAudiotrackPositions[currentAudioTrackIndex.current] =
      audiotracksData.currentAudiotrackPositionsMs[
        currentAudioTrackIndex.current
      ] = dataPosition;
  }

  async function updateAndStoreAudiobookPositions(data: any) {
    try {
      const currentAudiotrackProgress =
        data.positionMillis / data.durationMillis;
      updateLinearProgressBars(currentAudiotrackProgress);
      updateAudiotrackPositions(data.positionMillis);
      const sliderPositionCalculated = sliderPositionCalculation(
        currentAudiotrackProgress
      );

      setCurrentSliderPosition(sliderPositionCalculated);
      updateAudioBookPosition(
        audioBookId,
        audiotracksData.linearProgessBars,
        audiotracksData.currentAudiotrackPositionsMs
      );
    } catch (err) {
      console.log(err);
    }
  }

  const UpdateStatus = async (data: any) => {
    try {
      if (data.didJustFinish) {
        updateAndStoreAudiobookPositions(data);
        if (
          currentAudioTrackIndex.current >=
          URLSToPlayAudiotracks.length - 1
        ) {
          setPlaying(false);
          setAudioPaused(true);
        } else {
          return HandleNext();
        }
      } else if (data.positionMillis && data.durationMillis) {
        updateAndStoreAudiobookPositions(data);
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const updateAudiotrackSlider = async (data: any) => {
    try {
      const result = await sound.current.getStatusAsync();
      if (result.isLoaded === true) {
        const result = (data / 100) * currentAudiotrackPlayingInfo.Duration;
        await sound.current.setPositionAsync(roundNumberTwoDecimal(result));
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const forwardTenSeconds = async () => {
    try {
      const result = await sound.current.getStatusAsync();
      if (result.isLoaded === true) {
        const result =
          audiotracksData.currentAudiotrackPositionsMs[
            currentAudioTrackIndex.current
          ];
        await sound.current.setPositionAsync(result + 10000);
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const rewindTenSeconds = async () => {
    try {
      const result = await sound.current.getStatusAsync();
      if (result.isLoaded === true) {
        const result =
          audiotracksData.currentAudiotrackPositionsMs[
            currentAudioTrackIndex.current
          ];
        await sound.current.setPositionAsync(result - 10000);
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const ResetPlayer = async () => {
    try {
      const checkLoading = await sound.current.getStatusAsync();
      if (checkLoading.isLoaded === true) {
        setPlaying(false);
        await sound.current.setPositionAsync(0);
        await sound.current.stopAsync();
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const LoadAudio = async (index: number, audiotrackPositions = 0) => {
    currentAudioTrackIndex.current = index;
    updateAudioTrackIndexDB(db, currentAudioTrackIndex.current, audioBookId);
    setAudiotrackLoadingStatuses({
      ...audiotrackLoadingStatuses,
      loadingCurrentAudiotrack: true,
    });
    const checkLoading = await sound.current.getStatusAsync();
    if (checkLoading.isLoaded === false) {
      try {
        const result = await sound.current.loadAsync(
          { uri: URLSToPlayAudiotracks[index] },
          {
            progressUpdateIntervalMillis: 1000,
            positionMillis: audiotrackPositions,
            shouldPlay: audioPlayerSettings.shouldPlay,
            rate: audioPlayerSettings.rate,
            shouldCorrectPitch: audioPlayerSettings.shouldCorrectPitch,
            volume: audioPlayerSettings.volume,
            isMuted: audioPlayerSettings.isMuted,
            isLooping: audioPlayerSettings.isLooping,
          },
          true
        );
        if (result.isLoaded === false) {
          setAudiotrackLoadingStatuses({
            ...audiotrackLoadingStatuses,
            loadingCurrentAudiotrack: false,
            loadedCurrentAudiotrack: false,
          });
        } else {
          setCurrentPlayingInformation({
            ...currentAudiotrackPlayingInfo,
            audioTrackReader: chapters[index]?.readers[0]?.display_name,
            audioTrackChapterPlayingTitle:
              chapters[index]?.section_number + ". " + chapters[index]?.title,
            Duration: result?.durationMillis,
          });
          setAudiotrackLoadingStatuses({
            ...audiotrackLoadingStatuses,
            loadingCurrentAudiotrack: false,
            loadedCurrentAudiotrack: true,
          });
          sound.current.setOnPlaybackStatusUpdate(UpdateStatus);
          await PlayAudio();
        }
      } catch (error) {
        setAudiotrackLoadingStatuses({
          ...audiotrackLoadingStatuses,
          loadingCurrentAudiotrack: false,
          loadedCurrentAudiotrack: false,
        });
        console.log("Error: ", error);
      }
    } else {
      setAudiotrackLoadingStatuses({
        ...audiotrackLoadingStatuses,
        loadingCurrentAudiotrack: false,
        loadedCurrentAudiotrack: true,
      });
    }
  };

  const PlayAudio = async () => {
    try {
      const result = await sound.current.getStatusAsync();
      if (result.isLoaded) {
        if (result.isPlaying === false) {
          await sound.current.playAsync();
          setPlaying(true);
        }
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const PauseAudio = async () => {
    try {
      setAudioPaused(false);
      const result = await sound.current.getStatusAsync();
      if (result.isLoaded) {
        if (result.isPlaying === true) {
          await sound.current.pauseAsync();
          setAudioPaused(true);
          setPlaying(false);
        }
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const HandleNext = async () => {
    try {
      if (currentAudioTrackIndex.current < URLSToPlayAudiotracks.length - 1) {
        const unloadSound = await sound.current.unloadAsync();
        if (unloadSound.isLoaded === false) {
          currentAudioTrackIndex.current += 1;
          setCurrentSliderPosition(0.0);
          // ResetPlayer();

          await LoadAudio(
            currentAudioTrackIndex.current,
            audiotracksData.currentAudiotrackPositionsMs[
              currentAudioTrackIndex.current
            ]
          );
        }
      } else if (
        currentAudioTrackIndex.current >=
        URLSToPlayAudiotracks.length - 1
      ) {
        const unloadSound = await sound.current.unloadAsync();
        if (unloadSound.isLoaded === false) {
          currentAudioTrackIndex.current = 0;
          setCurrentSliderPosition(0.0);
          await ResetPlayer();
          await LoadAudio(
            currentAudioTrackIndex.current,
            audiotracksData.currentAudiotrackPositionsMs[
              currentAudioTrackIndex.current
            ]
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const HandlePrev = async () => {
    try {
      if (currentAudioTrackIndex.current - 1 >= 0) {
        const unloadSound = await sound.current.unloadAsync();
        if (unloadSound.isLoaded === false) {
          await LoadAudio(
            currentAudioTrackIndex.current - 1,
            audiotracksData.currentAudiotrackPositionsMs[
              currentAudioTrackIndex.current - 1
            ]
          );
          currentAudioTrackIndex.current -= 1;
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  function msToTime(duration: number) {
    let seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
  }

  const GetDurationFormat = (currentDuration: number) => {
    try {
      if (typeof currentDuration === "number") {
        const time = currentDuration / 1000;
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time - minutes * 60);
        const secondsFormatted = seconds > 9 ? seconds : `0${seconds}`;
        return `${minutes}:${secondsFormatted}`;
      } else {
        return `00:00`;
      }
    } catch (err) {
      console.log(err);
    }
  };

  const FormatChapterDurations = (chapterTimeInSeconds: number) => {
    try {
      if (chapterTimeInSeconds !== undefined) {
        if (chapterTimeInSeconds < 3600) {
          return new Date(chapterTimeInSeconds * 1000)
            .toISOString()
            .substr(14, 5);
        } else {
          return new Date(chapterTimeInSeconds * 1000)
            .toISOString()
            .substr(11, 8);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const PlayFromListenButton = async (index: number) => {
    try {
      const unloadSound = await sound.current.unloadAsync();
      if (unloadSound.isLoaded === false) {
        setCurrentSliderPosition(0.0);
        await ResetPlayer();
        await LoadAudio(
          index,
          audiotracksData.currentAudiotrackPositionsMs[index]
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const PlayFromStartOfTrack = async (index: number) => {
    try {
      const unloadSound = await sound.current.unloadAsync();
      if (unloadSound.isLoaded === false) {
        setCurrentSliderPosition(0.0);
        await ResetPlayer();
        await LoadAudio(index, 0);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const renderAudiotracks = ({ item, index }: any) => (
    <ListItem bottomDivider containerStyle={{ backgroundColor: "#F9F6EE" }}>
      <Button
        mode="outlined"
        accessibilityLabel={`Play from start of Audiotrack ${item?.section_number}: ${item?.title}`}
        onPress={() => PlayFromStartOfTrack(index)}
        style={{ margin: 0, padding: 0 }}
      >
        <MaterialCommunityIcons
          name="book-arrow-left"
          size={30}
          color="black"
        />
      </Button>
      <ListItem.Content style={{ alignItems: "stretch", flex: 1 }}>
        <ListItem.Title numberOfLines={1} ellipsizeMode="tail">
          {item?.section_number}: {item?.title}
        </ListItem.Title>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons name="timer" size={15} color="black" />
          <Text>
            {": "}
            {GetDurationFormat(
              audiotracksData.currentAudiotrackPositionsMs[index]
            )}
          </Text>
          <Text>{" | "}</Text>
          <Text>{FormatChapterDurations(chapters[index]?.playtime)}</Text>
        </View>

        <LinearProgress
          color="#50C878"
          value={audiotracksData.linearProgessBars[index]}
          variant="determinate"
          trackColor="#DCDCDC"
          animation={false}
        />

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name="account-tie-voice"
            size={15}
            color="black"
          />
          <Text>{": "}</Text>
          <ListItem.Subtitle numberOfLines={1} ellipsizeMode="clip">
            {item?.readers[0]?.display_name}
          </ListItem.Subtitle>
        </View>
      </ListItem.Content>
      <Button
        mode="outlined"
        accessibilityLabel={`Resume playing ${item?.section_number}: ${
          item?.title
        } ${GetDurationFormat(
          audiotracksData.currentAudiotrackPositionsMs[index]
        )} out of ${FormatChapterDurations(chapters[index]?.playtime)}`}
        onPress={() => {
          PlayFromListenButton(index);
        }}
        style={{}}
      >
        <MaterialCommunityIcons name="book-play" size={30} color="black" />
      </Button>
    </ListItem>
  );

  const renderReviews = ({ item, index }: any) => (
    <Card
      containerStyle={{ backgroundColor: "#F9F6EE" }}
      wrapperStyle={{ backgroundColor: "#F9F6EE" }}
    >
      <ListItem.Title style={{ backgroundColor: "#F9F6EE" }}>
        {item?.reviewtitle}
      </ListItem.Title>
      <Card.Divider />
      <Rating
        imageSize={20}
        ratingCount={5}
        startingValue={item?.stars}
        showRating={false}
        readonly={true}
        tintColor="#F9F6EE"
        type="custom"
        ratingBackgroundColor="#E2DFD2"
      />
      <ListItem containerStyle={{ backgroundColor: "#F9F6EE" }}>
        <ListItem.Subtitle style={{ backgroundColor: "#F9F6EE" }}>
          {item?.reviewbody}
        </ListItem.Subtitle>
      </ListItem>

      <View style={styles.reviewFooter}>
        <ListItem containerStyle={{ backgroundColor: "#F9F6EE" }}>
          <ListItem.Subtitle style={{ backgroundColor: "#F9F6EE" }}>
            By: {item?.reviewer}
          </ListItem.Subtitle>
        </ListItem>
        <ListItem containerStyle={{ backgroundColor: "#F9F6EE" }}>
          <ListItem.Subtitle style={{ backgroundColor: "#F9F6EE" }}>
            {item?.reviewdate}
          </ListItem.Subtitle>
        </ListItem>
      </View>
    </Card>
  );

  useEffect(() => {
    if (dataRSS.length > 0) {
      const RSSDict = Object.entries(dataRSS);
      const RSSURLS = RSSDict.map(([key, value]) => {
        return value?.enclosures[0]?.url;
      });
      setURLSToPlayAudiotracks(RSSURLS);
    }
  }, [dataRSS]);

  function pressedToShelveBook(audiobook_id: any) {
    switch (audiotracksData.shelveIconToggle) {
      case 0:
        setAudiotracksData({ ...audiotracksData, shelveIconToggle: 1 });
        updateBookShelve(audiobook_id, !audiotracksData.shelveIconToggle);
        break;
      case 1:
        // remove from db
        setAudiotracksData({ ...audiotracksData, shelveIconToggle: 0 });
        updateBookShelve(audiobook_id, !audiotracksData.shelveIconToggle);
        break;
    }
  }

  const toggleSettingsOverlay = () => {
    setVisible(!visible);
  };
  const toggleWriteReviewOverlay = () => {
    setMakeReviewOptions(!makeReviewOptions);
  };

  if (!loadingAudioListeningLinks && !loadingAudiobookData) {
    const getHeader = () => {
      return (
        <View style={styles.bookHeader}>
          <Card
            containerStyle={{ backgroundColor: "#F9F6EE" }}
            wrapperStyle={{ backgroundColor: "#F9F6EE" }}
          >
            <Card.Title style={styles.bookTitle}>{title}</Card.Title>
            <Card.Divider />

            <View
              style={{
                width: 200,
                height: 200,
                marginLeft: 35,
              }}
            >
              <Image
                accessibilityLabel={`Audiobook image With button to shelve in top right corner`}
                resizeMode="cover"
                source={{ uri: coverImage }}
                style={{ flex: 1, borderRadius: 5 }}
              />
              <Button
                accessibilityLabel={`Shelve audiobook: ${title} currently ${
                  audiotracksData.shelveIconToggle ? "shelved" : "not shelved"
                }`}
                mode="text"
                onPress={() => {
                  pressedToShelveBook(audioBookId);
                }}
                style={{
                  margin: 5,
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 25,
                  height: 55,
                }}
              >
                <MaterialCommunityIcons
                  name={
                    audiotracksData.shelveIconToggle ? "star" : "star-outline"
                  }
                  size={30}
                  color={
                    audiotracksData.shelveIconToggle ? "#DAA520" : "#DAA520"
                  }
                  style={{ borderColor: "black", borderWidth: 2 }}
                />
              </Button>
            </View>

            <LinearProgress
              color="#50C878"
              value={audiotracksData?.totalAudioBookListeningProgress}
              variant="determinate"
              trackColor="#DCDCDC"
              animation={false}
              style={{
                width: 200,
                marginLeft: 35,
              }}
            />
            <View style={styles.coverImageTimeListened}>
              <Text>
                {msToTime(audiotracksData.totalAudioBookListeningTimeMS)}
              </Text>
              <Text> {totalTime}</Text>
            </View>

            <Text style={styles.bookAuthor}>
              {" "}
              Author: {authorFirstName} {authorLastName}
            </Text>
            <Text style={styles.bookDescription}>{AudioBookDescription}</Text>
            <Rating
              showRating
              ratingCount={5}
              startingValue={audiotracksData?.audiobookRating}
              fractions={1}
              readonly={true}
              style={{
                paddingVertical: 10,
              }}
              tintColor="#F9F6EE"
              type="custom"
              ratingBackgroundColor="#E2DFD2"
            />
            <View style={styles.shelveButtons}></View>
          </Card>
        </View>
      );
    };

    const makeReviewIcon = () => {
      return (
        <Button
          accessibilityLabel="Opens overlay for writing a review on the audiobook."
          mode={"outlined"}
          onPress={() => toggleWriteReviewOverlay()}
          style={{
            backgroundColor: "#F9F6EE",
            height: 45,
          }}
        >
          <MaterialIcons
            name="rate-review"
            size={30}
            color="black"
            backgroundColor="white"
          />
        </Button>
      );
    };

    function sendReviewToAPI() {
      // https://archive.org/services/docs/api/reviews.html
      // https://archive.org/account/s3.php
      try {
        let audiobookIdentifier = urlIArchive.split("/");
        audiobookIdentifier =
          audiobookIdentifier[audiobookIdentifier.length - 1];
        fetch(
          `https://archive.org/services/reviews.php?identifier=${audiobookIdentifier}`,
          {
            method: "POST",
            headers: new Headers({
              Authorization: "LOW lgBAqvb3gHMagWyz:ibWdQdBtBeJM4wj0",
              Accept: "application/json",
              "Content-Type": "application/json",
            }),
            body: JSON.stringify({
              title: reviewInformation.reviewTitle,
              body: reviewInformation.reviewText,
              stars: reviewInformation.reviewRating,
            }),
          }
        )
          .then((response) => response.json())
          .then((data) => {
            /*console.log(data)*/
          })
          .finally(() => {
            setUserChangedReview(!userChangedReview);
            const reviewInformationStringified =
              JSON.stringify(reviewInformation);
            updateUsersAudiobookReviewDB(
              db,
              reviewInformationStringified,
              audioBookId
            );
          });
      } catch (err) {
        console.log(err);
      }
    }

    const audiotracksKeyExtractor = (item: any) => {
      return item?.id;
    };
    const reviewsKeyExtractor = (item: any) => {
      return item?.createdate;
    };

    const AudioTracksScreenData = [
      {
        title: "No. Audiotracks: " + numSections,
        renderItem: renderAudiotracks,
        data: chapters,
        keyExtractor: audiotracksKeyExtractor,
      },
      {
        title:
          "Average of reviews: " +
          roundNumberTwoDecimal(audiotracksData?.audiobookRating),
        reviewIcon: makeReviewIcon(),
        renderItem: renderReviews,
        data: reviews,
        keyExtractor: reviewsKeyExtractor,
      },
    ];

    return (
      <View style={styles.container}>
        <AudioTrackSettings
          visible={visible}
          toggleOverlay={toggleSettingsOverlay}
          audioPlayerSettings={audioPlayerSettings}
          storeAudioTrackSettings={storeAudioTrackSettings}
          setAudioPlayerSettings={setAudioPlayerSettings}
          sound={sound}
        />

        <MakeUserReview
          reviewInformation={reviewInformation}
          sendReviewToAPI={sendReviewToAPI}
          setReviewInformation={setReviewInformation}
          urlIArchive={urlIArchive}
          makeReviewOptions={makeReviewOptions}
          toggleWriteReviewOverlay={toggleWriteReviewOverlay}
          title={title}
        />

        <View style={styles.AudioTracksStyle}>
          <View style={styles.listItemHeaderStyle}>
            <SectionList
              sections={AudioTracksScreenData}
              keyExtractor={({ section: { keyExtractor } }) => {
                keyExtractor;
              }}
              renderItem={({ section: { renderItem } }) => renderItem}
              ListHeaderComponent={getHeader()}
              renderSectionHeader={({
                section: { title },
                section: { reviewIcon },
              }) => (
                <View style={styles.sectionTitles}>
                  <Text View style={styles.sectionStyle}>
                    {title}
                    {"   "}
                  </Text>
                  <View style={{ alignSelf: "center" }}>{reviewIcon}</View>
                </View>
              )}
            />
          </View>
        </View>

        <AudiotrackSliderWithCurrentPlaying
          currentSliderPosition={currentSliderPosition}
          SeekUpdate={updateAudiotrackSlider}
          GetDurationFormat={GetDurationFormat}
          Duration={currentAudiotrackPlayingInfo.Duration}
          coverImage={coverImage}
          audioTrackChapterPlayingTitle={
            currentAudiotrackPlayingInfo.audioTrackChapterPlayingTitle
          }
          audioTrackReader={currentAudiotrackPlayingInfo.audioTrackReader}
        />

        <AudioTrackControls
          HandlePrev={HandlePrev}
          HandleNext={HandleNext}
          LoadAudio={LoadAudio}
          PlayAudio={PlayAudio}
          Playing={Playing}
          PauseAudio={PauseAudio}
          audioPaused={audioPaused}
          loadingCurrentAudiotrack={
            audiotrackLoadingStatuses.loadingCurrentAudiotrack
          }
          loadedCurrentAudiotrack={
            audiotrackLoadingStatuses.loadedCurrentAudiotrack
          }
          currentAudioTrackIndex={currentAudioTrackIndex}
          forwardTenSeconds={forwardTenSeconds}
          rewindTenSeconds={rewindTenSeconds}
          trackPositions={audiotracksData}
        ></AudioTrackControls>
      </View>
    );
  } else {
    return (
      <View style={{ backgroundColor: "#F9F6EE", flex: 1 }}>
        <ActivityIndicator
          accessibilityLabel={"loading"}
          size="large"
          color="#50C878"
          style={styles.ActivityIndicatorStyle}
        />
      </View>
    );
  }
}

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 10,
    paddingTop: 2,
  },
  AudioTracksStyle: {
    flex: 7,
    paddingBottom: 2,
  },
  listItemHeaderStyle: {
    fontSize: 20,
    backgroundColor: "black",
  },
  ActivityIndicatorStyle: {
    top: windowHeight / 2.5,
  },
  bookTitle: {
    fontSize: 30,
  },
  bookAuthor: {
    fontWeight: "bold",
  },
  bookDescription: {
    fontSize: 16,
    padding: 2,
  },
  bookHeader: {
    display: "flex",
    paddingBottom: 0,
    padding: 2,
  },
  shelveButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  reviewFooter: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  sectionTitles: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    height: 70,
  },
  sectionStyle: {
    alignSelf: "center",
    color: "#F9F6EE",
    fontSize: 16,
  },
  coverImageTimeListened: {
    width: 200,
    marginBottom: 10,
    marginLeft: 35,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reviewTextBodyStyle: {
    backgroundColor: "white",
    borderColor: "#000000",
    borderWidth: 1,
    height: windowHeight / 3,
    width: windowWidth - 40,
  },
  reviewerNameStyle: {
    backgroundColor: "white",
    borderColor: "#000000",
    borderWidth: 1,
    marginBottom: 5,
    width: windowWidth - 40,
  },
});

export default Audiotracks;
