import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { StyleSheet, Text, View } from "react-native";

import { BORDER_RADIUS, SPACING, TEXT_STYLES } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

/* Re-export provider so app/_layout can mount once. */
export { BottomSheetModalProvider as SheetProvider };

export type SheetHandle = {
  open: () => void;
  close: () => void;
};

type Props = {
  title?: string;
  /** ["50%", "85%"] gibi snap points; varsayılan içeriğe göre */
  snapPoints?: (string | number)[];
  /** İçerik scrollable mı? Default: true */
  scroll?: boolean;
  children: React.ReactNode;
  onClose?: () => void;
};

/**
 * 2026 standardında bottom sheet:
 *   - drag-to-dismiss
 *   - blur backdrop
 *   - snap points
 *   - tema-uyumlu handle ve corner radius
 *
 * Kullanım:
 *   const ref = useRef<SheetHandle>(null);
 *   <Sheet ref={ref} title="Bilgi"><Text>...</Text></Sheet>
 *   ref.current?.open();
 */
export const Sheet = forwardRef<SheetHandle, Props>(function Sheet(
  { title, snapPoints, scroll = true, children, onClose },
  ref,
) {
  const { colors, isDark } = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);

  const points = useMemo(
    () => snapPoints ?? ["55%", "90%"],
    [snapPoints],
  );

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.present(),
    close: () => sheetRef.current?.dismiss(),
  }));

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.55}
        pressBehavior="close"
      />
    ),
    [],
  );

  const Inner = scroll ? BottomSheetScrollView : BottomSheetView;

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={points}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)",
        width: 40,
        height: 4,
      }}
      backgroundStyle={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: BORDER_RADIUS.xl + 6,
        borderTopRightRadius: BORDER_RADIUS.xl + 6,
      }}
    >
      {title && (
        <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>
          <Ionicons
            name="close"
            size={22}
            color={colors.textSecondary}
            onPress={() => sheetRef.current?.dismiss()}
            suppressHighlighting
          />
        </View>
      )}
      <Inner
        contentContainerStyle={scroll ? styles.scrollContent : undefined}
        style={!scroll ? styles.viewContent : undefined}
      >
        {children}
      </Inner>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    ...TEXT_STYLES.titleSmall,
    fontWeight: "700",
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  viewContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
});
