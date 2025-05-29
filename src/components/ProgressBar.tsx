import { View, StyleSheet } from "react-native"

interface ProgressBarProps {
  progress: number
  color: string
  height?: number
}

export function ProgressBar({ progress, color, height = 8 }: ProgressBarProps) {
  return (
    <View style={[styles.container, { height }]}>
      <View
        style={[
          styles.progress,
          {
            width: `${progress}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    borderRadius: 4,
  },
})
