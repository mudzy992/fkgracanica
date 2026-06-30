import { motion, useReducedMotion } from 'framer-motion';
import { WidgetSectionHeader } from './WidgetSectionHeader';

interface Props {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

export function WidgetSectionHeaderBlock({ title, subtitle, eyebrow }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <WidgetSectionHeader title={title} subtitle={subtitle} eyebrow={eyebrow} />
    </motion.div>
  );
}
