import 'modern-normalize';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { PixabayApiService } from './js/pixabayApiService.js';
import { createImagesMarkup } from './js/createImagesMarkup.js';

const pixabayApiService = new PixabayApiService;
const galleryRef = document.querySelector('.gallery');
const formRef = document.getElementById('search-form');
formRef.addEventListener('submit', onFormSubmit);

function onFormSubmit(e) {
  e.preventDefault();

  pixabayApiService.searchQuery =
    e.currentTarget.elements.searchQuery.value.trim();
  if (pixabayApiService.searchQuery === '') {
    return Notify.info('Field must not be empty');
  }

  pixabayApiService
    .fetchImages()
    .then(images => {
      if (images.length === 0) {
        throw Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      console.log(images);
      // galleryRef.insertAdjacentHTML('beforeend', createImagesMarkup(images));
      
    })
    .catch(error => {
      Notify.failure(error.message);
    });
  
}