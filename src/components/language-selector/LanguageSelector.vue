<template>
  <div class="language-selector">
    <span>{{ resultsLanguageLabel }}</span>
    <span v-for="(language, index) in languages" :key="language">
      <span @click="updateUrl(language.languageId)" class="language">{{ language.languageName }}</span>
      <span v-if="index < languages.length - 2">, </span>
      <span v-else-if="index == languages.length - 2">{{orLabel}}&nbsp;</span>
    </span>
  </div>
</template>

<script>
import { parseSearchQueryString } from '../../QueryString';
export default {
  name: "language-selector",
  props: ["languageUri", "urlPath", "resultsLanguageLabel", "orLabel"],
  components: {},
  created() {},
  mounted() {
    this.languages = this.convertDictionaryToObject(
      JSON.parse(this.$root.$store.state.config.languages)
    );
   
    this.indexName = this.$root.$store.state.config.indexName;
  },
  data() {
    return {
      languages: null,
      indexName: null,
      urlPath: this.urlPath,
    };
  },
  methods: {
    updateUrl: function (language) {
        this.$root.$store.commit("updateLanguage", language);
        var searchQuery = this.indexName != null && this.indexName !="" ? "?language=" + language : "?language=" + language + "&indexName=" + this.indexName;
        this.$root.dispatchToStore('fetchResults', searchQuery).then(() => {
            HawksearchVue.truncateFacetSelections(this.$root.$store);
            HawksearchVue.applyTabSelection(this.$root);
        });
    },
    convertDictionaryToObject: function (languages) {
      var languagesArray = [];
      for (const [key, value] of Object.entries(languages)) {
        languagesArray.push({ languageId : key,  languageName:value });
      }
      return languagesArray;
    },
  }
};
</script>

<style scoped lang="scss">
</style>
