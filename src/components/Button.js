import React from "react"
import { StyleSheet, Text, TouchableOpacity } from "react-native"
import { colors, radius, spacing } from "../theme"

export default function Button({ title, onPress, variant = "primary", style, disabled }) {
  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "danger"
      ? colors.danger
      : variant === "success"
      ? colors.success
      : colors.surfaceAlt
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[ui.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Text style={ui.btnText}>{title}</Text>
    </TouchableOpacity>
  )
}

const ui = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: colors.onPrimary, fontSize: 16, fontWeight: "600" },
})

