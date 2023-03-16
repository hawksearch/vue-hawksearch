<template>
    <div class="hawk-autocorrect-suggestion-container" v-if="searchOutput && searchOutput.DidYouMean && searchOutput.DidYouMean.length !== 0">
        <ul class="hawk-autocorrect-suggestion">
            <h3>Did you mean?</h3>
            <li v-for="autocorrectSuggestion in autocorrectSuggestions" :key="autocorrectSuggestion.key"
                v-on:click="selectSuggestion(autocorrectSuggestion)">
                {{autocorrectSuggestion}}
            </li>
        </ul>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex'

    export default {
        name: 'autocorrect-suggestions',
        props: [],
        mounted() {

        },
        data() {
            return {}
        },
        methods: {
            selectSuggestion: function(selectedSuggestion) {
                this.$root.$emit('selectAutocorrectSuggestion', selectedSuggestion)
            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            results: function () {
                return this.searchOutput ? this.searchOutput.Results : null;
            },
            autocorrectSuggestions: function () {
                return this.searchOutput ? this.searchOutput.DidYouMean : null;
            }
        }
    }

</script>

<style scoped lang="scss">
</style>
