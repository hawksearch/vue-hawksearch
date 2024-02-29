<template>
    <div class="hawk-facet-rail__facet">
        <div class="hawk-facet-rail__facet-heading">
            <div class="hawk-facet-rail__facet-heading-placeholder" :style="'width: ' + getWidth() + 'px'" />
        </div>
        <div class="hawk-facet-rail__facet-body">
            <div class="hawk-facet-rail__facet-values hawk-facet-rail__facet-values-placeholder">
                <div class="hawk-facet-rail__facet-values-checkbox">
                    <ul class="hawk-facet-rail__facet-list">
                        <li v-for="index in getCount()" :key="index" class="hawk-facet-rail__facet-list-item">
                            <span class="hawk-facet-rail__facet-checkbox hawk-facet-rail__facet-checkbox-placeholder" />

                            <button class="hawk-facet-rail__facet-btn">
                                <span class="hawk-facet-rail__facet-name">
                                    <div class="hawk-facet-rail__facet-name-placeholder" :style="'width: ' + getWidth() + 'px'"></div>
                                </span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

  export default  {
    name: 'placeholder-facet',
    methods: {
        getWidth: function () {
            return Math.round(Math.random() * (250 - 125) + 125);
        },
        getCount: function () {
            return Math.round(Math.random() * (8 - 1) + 1);
        }
    }
}


</script>

<style scoped lang="scss">
  .placeholder-facet {

  }
</style>
