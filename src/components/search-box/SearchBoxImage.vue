<template>
    <div v-if="visible" class="image-search-field">
        <h3>Image Search</h3>
        <button class="close-image-search-btn" @click="closeImageSearch">
            <CloseIconSvg/>
        </button>

        <div class="hawk__uploadImage"
             @dragover.prevent="handleDragOver"
             @drop.prevent="handleDrop"
             @click="triggerFileInput">
            <UploadIconSvg/>
            <input type="file" @change="onImageSelect" ref="fileInput" style="display: none;">
            <p>Drop an Image here</p>

            <label class="custom-file-upload">
                <UploadImageIconSvg />
                Upload Image
                <input class="hawk__searchInput" type="file" @change="onImageSelect" ref="fileInputLabel" @click.stop="onFileInputClick"/>
            </label>
        </div>

        <div class="search-input">
            <SearchIconSvg/>
            <input type="text" :placeholder="$t(placeholder)" v-model="imageKeyword" @keydown="onImageKeywordKeyDown" />
        </div>

        <div v-if="images.length" class="images-preview">
            <div v-for="(image, index) in images" :key="index" class="image-details">
                <button @click="removeImage(index)" class="remove-button" aria-label="Remove image" role="button">
                    <span class="visually-hidden">Remove image</span>
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
import CloseIconSvg from "../svg/CloseIconSvg";
import UploadIconSvg from "../svg/UploadIconSvg";
import UploadImageIconSvg from "../svg/UploadImageIconSvg";
import SearchIconSvg from "../svg/SearchIconSvg";
import SearchSuggestions from "./SearchSuggestions";
import CustomResultsLabel from "../results/tools/CustomResultsLabel";
import ImageSearchIconSvg from "../svg/ImageSearchIconSvg";

export default {
    name: 'SearchBoxImage',
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    },
    components: {
        CloseIconSvg,
        UploadIconSvg,
        UploadImageIconSvg,
        SearchSuggestions,
        CustomResultsLabel,
        SearchIconSvg,
        ImageSearchIconSvg
    },
    data() {
        return {
            imageSearchVisible: false,
            imageKeyword: null,
            images: [],
            notification: "",
            requestType: 'ImageSearch',
            allowedFileTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
            unsupportedFileTypeMessage: "Unsupported file type. Please upload JPG, PNG, GIF, or WEBP images."
        };
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
        onFileInputClick(event) {
            event.preventDefault();
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
                this.$emit('searchImage', {
                    keyword: this.imageKeyword,
                    requestType: 'ImageSearch'
                });
            }
        }
    }
}
</script>

<style scoped lang="scss"></style>
