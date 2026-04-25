<template>
    <div v-if="visible" class="image-search-field">
        <h3>{{ $t('Image Search') }}</h3>
        <button type="button" class="close-image-search-btn" @click="closeImageSearch" :aria-label="$t('Close image search')">
            <CloseIconSvg/>
        </button>

        <div class="hawk__uploadImage"
             @dragover.prevent="handleDragOver"
             @drop.prevent="handleDrop"
             @click="triggerFileInput">
            <UploadIconSvg/>
            <input type="file" @change="onImageSelect" ref="fileInput" style="display: none;">
            <p>{{ $t('Drop an Image here') }}</p>

            <label class="custom-file-upload">
                <UploadImageIconSvg />
                <span>{{ $t('Upload Image') }}</span>
                <input class="hawk__searchInput" type="file" @change="onImageSelect" ref="fileInputLabel" @click.prevent.stop/>
            </label>
        </div>

        <div class="search-input">
            <SearchIconSvg/>
            <input type="text" v-model="imageKeyword" @keydown="onImageKeywordKeyDown" />
        </div>

        <div v-if="images.length" class="images-preview">
            <div v-for="(image, index) in images" :key="index" class="image-details">
                <button @click="removeImage(index)" class="remove-button" aria-label="Remove image" role="button">
                    <span class="visually-hidden">{{ $t('Remove image') }}</span>
                </button>
                <img :src="image.dataUrl" :alt="image.name" class="image-thumbnail"/>
                <div class="image-info">
                    <p class="image-name">{{ image.name }}</p>
                </div>
            </div>
        </div>

        <div v-if="notification" class="notification">
            {{ notification }}
        </div>
    </div>
</template>

<script>
import CloseIconSvg from "../svg/CloseIconSvg.vue";
import UploadIconSvg from "../svg/UploadIconSvg.vue";
import UploadImageIconSvg from "../svg/UploadImageIconSvg.vue";
import SearchIconSvg from "../svg/SearchIconSvg.vue";

export default {
    name: 'SearchBoxImage',
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:visible', 'searchImage'],
    components: {
        CloseIconSvg,
        UploadIconSvg,
        UploadImageIconSvg,
        SearchIconSvg
    },
    data() {
        return {
            imageSearchVisible: false,
            imageKeyword: null,
            images: [],
            notification: "",
            requestType: 'ImageSearch',
            allowedFileTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"]
        };
    },
    computed: {
        unsupportedFileTypeMessage() {
            return this.$t("Unsupported file type. Please upload JPG, PNG, GIF, or WEBP images.");
        },
        readFileFailureMessage() {
            return this.$t("Failed to read the image file. Please try again.");
        }
    },
    methods: {
        handleDragOver(event) {
            event.dataTransfer.dropEffect = 'copy';
        },
        handleDrop(event) {
            const files = Array.from(event.dataTransfer.files);
            this.addImage(files[0]);
        },
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        onImageSelect(event) {
            const files = Array.from(event.target.files);
            this.addImage(files[0]);
        },
        addImage(file) {
            if (file && this.allowedFileTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageDataUrl = e.target.result;
                    this.images = [{
                        name: file.name,
                        size: file.size,
                        dataUrl: imageDataUrl
                    }];
                    this.imageKeyword = null;
                    this.$root.dispatchToStore('fetchResults', {
                        RequestType: 'ImageSearch',
                        ImageData: imageDataUrl
                    }).then(() => {
                        this.$emit('searchImage', {
                            requestType: 'ImageSearch',
                            imageData: imageDataUrl
                        });
                    });
                };
                reader.onerror = () => {
                    this.notification = this.readFileFailureMessage;
                    setTimeout(() => {
                        this.notification = "";
                        }, 5000);
                    };
                reader.readAsDataURL(file);
            } else {
                this.notification = this.unsupportedFileTypeMessage;
                setTimeout(() => {
                    this.notification = "";
                }, 5000);
            }
        },
        removeImage(index) {
            this.images.splice(index, 1);
        },
        clearImageData() {
            this.images = [];
            this.imageKeyword = null;
            this.notification = "";
        },
        closeImageSearch() {
            this.$emit('update:visible', false);
        },
        onImageKeywordKeyDown(event) {
            if (event.key === 'Enter') {
                this.searchImage();
                event.stopPropagation();
                event.preventDefault();
            }
        },
        searchImage() {
            if (this.imageKeyword) {
                this.$root.dispatchToStore('fetchResults', {
                    Keyword: this.imageKeyword,
                    RequestType: 'ImageSearch'
                }).then(() => {
                    this.$emit('searchImage', {
                        keyword: this.imageKeyword,
                        requestType: 'ImageSearch'
                    });
                });
            }
        }
    }
}
</script>

<style scoped lang="scss"></style>
