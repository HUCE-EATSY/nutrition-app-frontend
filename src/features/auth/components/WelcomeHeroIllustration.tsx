import { memo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

type WelcomeHeroIllustrationProps = {
  size: number;
};




const leftEarPath = "M142 118 C138 92 147 66 166 58 C170 83 166 104 154 124 Z";
const rightEarPath = "M218 118 C222 92 213 66 194 58 C190 83 194 104 206 124 Z";
const bodyPath = "M149 228 C154 217 206 217 211 228 L211 284 C211 299 200 310 187 310 L173 310 C160 310 149 299 149 284 Z";
const leftLegPath = "M171 286 C162 307 157 326 163 340 C169 348 177 344 179 332 L181 286 Z";
const rightLegPath = "M189 286 C198 307 203 326 197 340 C191 348 183 344 181 332 L179 286 Z";
const muzzlePath =
  "M122 186 C133 175 150 170 180 170 C210 170 227 175 238 186 C237 219 214 243 180 243 C146 243 123 219 122 186 Z";
const leftEyePath = "M145 190 C153 176 171 173 181 183 C176 197 162 206 146 202 Z";
const rightEyePath = "M215 190 C207 176 189 173 179 183 C184 197 198 206 214 202 Z";


export const WelcomeHeroIllustration = memo(function WelcomeHeroIllustration({
  size,
}: WelcomeHeroIllustrationProps) {
  return (
    <View style={[styles.frame, { width: size, height: size * 1.02 }]}>
      <View
        style={[
          styles.heroGlow,
          {
            width: size * 0.54,
            height: size * 0.54,
            borderRadius: size,
            top: size * 0.17,
          },
        ]}
      />

      <Svg width="100%" height="100%" viewBox="0 0 360 360">
        <Defs>
          <SvgLinearGradient id="beamGradient" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#FAF4FF" stopOpacity="0.78" />
            <Stop offset="0.55" stopColor="#B892FF" stopOpacity="0.42" />
            <Stop offset="1" stopColor="#A56CFF" stopOpacity="0" />
          </SvgLinearGradient>
          <SvgLinearGradient id="mascotGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#9F66F8" />
            <Stop offset="1" stopColor="#7C46E6" />
          </SvgLinearGradient>
          <SvgLinearGradient id="mistGradient" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#E7DBFF" stopOpacity="0.72" />
            <Stop offset="1" stopColor="#A56CFF" stopOpacity="0.04" />
          </SvgLinearGradient>
        </Defs>







        <Path d="M128 320 C148 288 157 262 165 232 L195 232 C203 262 212 288 232 320 Z" fill="url(#beamGradient)" />

        <Ellipse cx={180} cy={314} rx={68} ry={18} fill="url(#mistGradient)" />
        <Ellipse cx={94} cy={322} rx={48} ry={10} fill="url(#mistGradient)" opacity={0.65} />
        <Ellipse cx={266} cy={322} rx={48} ry={10} fill="url(#mistGradient)" opacity={0.65} />
        <Ellipse cx={50} cy={326} rx={34} ry={7} fill="url(#mistGradient)" opacity={0.42} />
        <Ellipse cx={310} cy={326} rx={34} ry={7} fill="url(#mistGradient)" opacity={0.42} />

        <G
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={20}
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <Path d={leftEarPath} />
          <Path d={rightEarPath} />
          <Circle cx={180} cy={166} r={76} />
          <Path d={bodyPath} />
          <Path d={leftLegPath} />
          <Path d={rightLegPath} />
        </G>

        <G stroke="#F7ECFF" strokeWidth={10} strokeLinejoin="round" strokeLinecap="round">
          <Path d={leftEarPath} fill="url(#mascotGradient)" />
          <Path d={rightEarPath} fill="url(#mascotGradient)" />
          <Circle cx={180} cy={166} r={76} fill="url(#mascotGradient)" />
          <Path d={bodyPath} fill="url(#mascotGradient)" />
          <Path d={leftLegPath} fill="url(#mascotGradient)" />
          <Path d={rightLegPath} fill="url(#mascotGradient)" />
          <Path d="M148 232 C140 245 138 260 140 280" fill="none" />
          <Path d="M212 232 C220 245 222 260 220 280" fill="none" />
        </G>

        <Path d={muzzlePath} fill="#FFFFFF" />
        <Path d="M152 111 C156 97 162 87 171 80" stroke="#2A173F" strokeOpacity={0.88} strokeWidth={3.5} fill="none" />
        <Path d="M208 111 C204 97 198 87 189 80" stroke="#2A173F" strokeOpacity={0.88} strokeWidth={3.5} fill="none" />
        <Path d={leftEyePath} fill="#171320" />
        <Path d={rightEyePath} fill="#171320" />
        <Path d="M165 158 L176 166" stroke="#1C1422" strokeWidth={4.2} strokeLinecap="round" />
        <Path d="M195 158 L184 166" stroke="#1C1422" strokeWidth={4.2} strokeLinecap="round" />
        <Circle cx={180} cy={200} r={5.8} fill="#1B1522" />
        <Path d="M180 206 Q171 211 167 220" stroke="#1B1522" strokeWidth={3.6} fill="none" strokeLinecap="round" />
        <Path d="M180 206 Q189 211 193 220" stroke="#1B1522" strokeWidth={3.6} fill="none" strokeLinecap="round" />

        <Line x1={122} y1={206} x2={96} y2={201} stroke="#1B1522" strokeWidth={3.2} strokeLinecap="round" />
        <Line x1={122} y1={218} x2={92} y2={220} stroke="#1B1522" strokeWidth={3.2} strokeLinecap="round" />
        <Line x1={238} y1={206} x2={264} y2={201} stroke="#1B1522" strokeWidth={3.2} strokeLinecap="round" />
        <Line x1={238} y1={218} x2={268} y2={220} stroke="#1B1522" strokeWidth={3.2} strokeLinecap="round" />

        <Circle cx={144} cy={282} r={4} fill="#1B1522" opacity={0.88} />
        <Circle cx={216} cy={282} r={4} fill="#1B1522" opacity={0.88} />

      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroGlow: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "rgba(161, 108, 255, 0.18)",
    shadowColor: "#A56CFF",
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
});
