import { StyleSheet, Dimensions, TextInput, Text, View } from "react-native";
import { Overlay } from "@rneui/themed";
import { Button } from "react-native-paper";
import { Rating } from "react-native-ratings";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

function MakeUserReview(props: any) {
  const {
    reviewInformation,
    setReviewInformation,
    makeReviewOptions,
    sendReviewToAPI,
    toggleWriteReviewOverlay,
    title,
  } = props;
  return (
    <View>
      <Overlay
        isVisible={makeReviewOptions}
        onBackdropPress={toggleWriteReviewOverlay}
        fullScreen={false}
        overlayStyle={{ backgroundColor: "#F9F6EE", width: windowWidth - 20 }}
      >
        <Text style={{ marginBottom: 5, fontSize: 18 }}>Title: {title}</Text>
        <Rating
          accessibilityLabel="Tap to give audiobook a rating out of 5"
          imageSize={40}
          ratingCount={5}
          startingValue={reviewInformation?.reviewRating}
          showRating={false}
          fractions={false}
          tintColor="#F9F6EE"
          type="custom"
          style={{ marginBottom: 5 }}
          ratingBackgroundColor="#E2DFD2"
          onFinishRating={(userRating: number) => {
            setReviewInformation({
              ...reviewInformation,
              reviewRating: userRating,
            });
          }}
        />
        <Text style={{ fontSize: 18 }}>Review Title:</Text>
        <TextInput
          accessibilityLabel="Write your reviews title inside this text input"
          style={styles.reviewerTitleStyle}
          fontSize={18}
          ref={(reviewTitleRef) => {
            reviewTitleRef;
          }}
          value={reviewInformation?.reviewTitle}
          onChangeText={(reviewTitleRef) => {
            setReviewInformation({
              ...reviewInformation,
              reviewTitle: reviewTitleRef,
            });
          }}
        ></TextInput>
        <Text style={{ fontSize: 18 }}>Review Text:</Text>

        <TextInput
          accessibilityLabel="Write your review inside this text input."
          style={styles.reviewTextBodyStyle}
          ref={(reviewTextRef) => {
            reviewTextRef;
          }}
          value={reviewInformation?.reviewText}
          multiline={true}
          textAlignVertical={"top"}
          fontSize={18}
          onChangeText={(reviewTextRef) => {
            setReviewInformation({
              ...reviewInformation,
              reviewText: reviewTextRef,
            });
          }}
        ></TextInput>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18 }}>Post review: </Text>
          <Button
            accessibilityLabel="Posts users review for the audiobook."
            mode={"outlined"}
            onPress={() => sendReviewToAPI()}
          >
            <MaterialIcons name="send" size={30} color="black" />
          </Button>
        </View>
      </Overlay>
    </View>
  );
}

export default MakeUserReview;

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const styles = StyleSheet.create({
  reviewTextBodyStyle: {
    backgroundColor: "white",
    borderColor: "#000000",
    borderWidth: 1,
    height: windowHeight / 3,
    width: windowWidth - 40,
    padding: 5,
    marginBottom: 10,
  },
  reviewerTitleStyle: {
    backgroundColor: "white",
    padding: 5,
    borderColor: "#000000",
    borderWidth: 1,
    marginBottom: 5,
    width: windowWidth - 40,
  },
});
