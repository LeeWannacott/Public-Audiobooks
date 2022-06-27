import authorsListJson from "../resources/audiobookAuthorsList.json";
import { Picker } from "@react-native-picker/picker";
import React, { memo } from "react";

function ListOfAuthorsRender() {
  authorsListJson["authors"].map((author, i) => {
    return (
      <Picker.Item
        key={`${authorsListJson["authors"][i].id}`}
        label={`${authorsListJson["authors"][i].first_name} ${authorsListJson["authors"][i].last_name}`}
        value={`${authorsListJson["authors"][i].last_name}`}
      />
    );
  });
}

export default ListOfAuthorsRender;
