import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Craft } from '@/contexts/auth-context';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CRAFT_OPTIONS: { value: Craft; label: string }[] = [
  { value: 'crochet', label: 'Crochet' },
  { value: 'knitting', label: 'Knitting' },
  { value: 'sewing', label: 'Sewing' },
];

type CraftChipsProps = {
  selected: Craft[];
  onChange: (crafts: Craft[]) => void;
};

export function CraftChips({ selected, onChange }: CraftChipsProps) {
  const theme = useTheme();

  const toggle = (craft: Craft) => {
    if (selected.includes(craft)) {
      onChange(selected.filter((item) => item !== craft));
      return;
    }
    onChange([...selected, craft]);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Crafts</Text>
      <View style={styles.row}>
        {CRAFT_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <Pressable
              key={option.value}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              onPress={() => toggle(option.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? theme.backgroundSelected
                    : theme.backgroundElement,
                  borderColor: isSelected ? theme.text : theme.backgroundSelected,
                },
              ]}>
              <Text style={{ color: theme.text, fontWeight: isSelected ? '600' : '500' }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
