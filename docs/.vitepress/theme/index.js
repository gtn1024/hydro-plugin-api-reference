import DefaultTheme from 'vitepress/theme';
import MetaCard from './MetaCard.vue';
import { h } from 'vue';

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(MetaCard),
    });
  },
};
