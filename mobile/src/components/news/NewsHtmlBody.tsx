import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';
import { htmlToParagraphs } from '../../lib/html-text';
import { spacing, typography } from '../../lib/theme';

type Props = { html: string };

export function NewsHtmlBody({ html }: Props) {
  const { colors } = useTheme();
  const paragraphs = htmlToParagraphs(html);
  if (paragraphs.length === 0) return null;
  return (
    <View style={styles.wrap}>
      {paragraphs.map((paragraph, index) => (
        <Text key={index} style={[styles.body, { color: colors.text }]}>
          {paragraph}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  body: { ...typography.body, lineHeight: 24 },
});
