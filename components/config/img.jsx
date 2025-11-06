import React from "react";
import { Image, View } from "react-native";

const ServiceImage = ({ name }) => {
  let imageSource;

  switch (name.toLowerCase()) {
    case "carpintero":
      imageSource = require("../../assets/carpintero.jpg");
      break;
    case "electricista":
      imageSource = require("../../assets/electricista.jpg");
      break;
    case "gasfiter":
      imageSource = require("../../assets/gasfiter.jpg");
      break;
  }

  return (
    <View style={{ height: 115, width: 110, alignSelf: "stretch" }}>
      <Image
        source={imageSource}
        style={{ width: "100%", height: "100%", resizeMode: "cover" }}
      />
    </View>
  );
};

export default ServiceImage;
