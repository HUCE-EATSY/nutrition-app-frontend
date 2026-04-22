import { memo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  Line,
  Path,
  Polygon,
} from "react-native-svg";

type WelcomeHeroIllustrationProps = {
  size: number;
};

export const WelcomeHeroIllustration = memo(function WelcomeHeroIllustration({
  size,
}: WelcomeHeroIllustrationProps) {
  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <Svg width="100%" height="100%" viewBox="0 0 400 400">
        <Circle cx="200" cy="200" r="190" fill="#FFF0E6" />

        {/* Left Ear */}
        <Polygon points="100,200 70,80 180,130" fill="#FF8C00" />
        <Polygon points="110,180 85,100 160,140" fill="#FFB6C1" />
        
        {/* Right Ear */}
        <Polygon points="300,200 330,80 220,130" fill="#FF8C00" />
        <Polygon points="290,180 315,100 240,140" fill="#FFB6C1" />

        {/* Face */}
        <Ellipse cx="200" cy="220" rx="140" ry="120" fill="#FFA500" />
        
        {/* Muzzle area */}
        <Ellipse cx="200" cy="250" rx="60" ry="45" fill="#FFE4B5" />

        {/* Left Eye */}
        <Circle cx="140" cy="200" r="18" fill="#1A1A1A" />
        <Circle cx="145" cy="195" r="6" fill="#FFFFFF" />
        
        {/* Right Eye */}
        <Circle cx="260" cy="200" r="18" fill="#1A1A1A" />
        <Circle cx="265" cy="195" r="6" fill="#FFFFFF" />

        {/* Nose */}
        <Ellipse cx="200" cy="235" rx="12" ry="8" fill="#FF69B4" />

        {/* Mouth */}
        <Path 
          d="M 180 255 Q 200 275 200 255 Q 200 275 220 255" 
          fill="none" 
          stroke="#1A1A1A" 
          strokeWidth={6} 
          strokeLinecap="round" 
        />

        {/* Left Whiskers */}
        <Line x1="130" y1="240" x2="50" y2="220" stroke="#1A1A1A" strokeWidth={4} strokeLinecap="round" />
        <Line x1="125" y1="255" x2="40" y2="255" stroke="#1A1A1A" strokeWidth={4} strokeLinecap="round" />
        <Line x1="130" y1="270" x2="50" y2="290" stroke="#1A1A1A" strokeWidth={4} strokeLinecap="round" />
        
        {/* Right Whiskers */}
        <Line x1="270" y1="240" x2="350" y2="220" stroke="#1A1A1A" strokeWidth={4} strokeLinecap="round" />
        <Line x1="275" y1="255" x2="360" y2="255" stroke="#1A1A1A" strokeWidth={4} strokeLinecap="round" />
        <Line x1="270" y1="270" x2="350" y2="290" stroke="#1A1A1A" strokeWidth={4} strokeLinecap="round" />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
  },
});
