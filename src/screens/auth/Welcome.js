import React from "react";
import { View, StyleSheet, Image, SafeAreaView } from "react-native";
import { SIZES } from "../../constants/theme";
import GradientBackground from "../../components/common/GradientBackground";
import WelcomeMessage from "../../components/auth/WelcomeMessage";
import Button from "../../components/common/Button";
import useTheme from "../../hooks/useTheme";

const Welcome = ({ navigation }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-between",
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: SIZES.padding,
    },
    logo: {
      width: 80,
      height: 80,
      resizeMode: "contain",
      marginBottom: 20,
    },
    buttonContainer: {
      width: "100%",
      paddingHorizontal: SIZES.padding,
      paddingBottom: SIZES.padding,
    },
    stepIndicator: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 20,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.gray,
      marginHorizontal: 4,
    },
    activeDot: {
      width: 24,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginHorizontal: 4,
    },
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <WelcomeMessage
            title="Hey Human!"
            subtitle="Discover Chat AI about anything you want!"
            showRobot={true}
            robotSize={180}
          />
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.stepIndicator}>
            <View style={styles.activeDot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          <Button
            title="Continue"
            gradient
            onPress={() => navigation.navigate("Login")}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default Welcome;
