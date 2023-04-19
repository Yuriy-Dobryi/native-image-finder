import 'modern-normalize';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { PixabayApiService } from './js/pixabayApiService.js';
import { createImagesMarkup } from './js/createImagesMarkup.js';

const pixabayApiService = new PixabayApiService;
const simplelightbox = new SimpleLightbox('.gallery a');

const galleryRef = document.querySelector('.gallery');
const formRef = document.getElementById('search-form');
formRef.addEventListener('submit', onFormSubmit); 

const loadMoreBtn = document.querySelector('.load-more');
changeLoadMoreBtnDisplay('none');
loadMoreBtn.addEventListener('click', onLoadMoreBtn);

function onFormSubmit(e) {
  e.preventDefault();
  pixabayApiService.searchQuery =
    e.currentTarget.elements.searchQuery.value.trim();
  
  if (pixabayApiService.searchQuery === '') {
    return Notify.info('Field must not be empty');
  }

  galleryRef.innerHTML = '';
  changeLoadMoreBtnDisplay('none');
  pixabayApiService.resetPage();
  
  pixabayApiService.getData()
    .then(({ totalHits, hits }) => {
      if (totalHits === 0) {
        throw Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }

      Notify.success(`Hooray! We found ${totalHits} images.`);
      galleryRef.insertAdjacentHTML('beforeend', createImagesMarkup(hits));
      simplelightbox.refresh();
      changeLoadMoreBtnDisplay('block');
    })

    .catch(error => {
      Notify.failure(error.message);
    });
}

function changeLoadMoreBtnDisplay(value) {
  loadMoreBtn.style.display = `${value}`;
}

function onLoadMoreBtn() {
  pixabayApiService.getData()
    .then(({ hits }) => {
      galleryRef.insertAdjacentHTML('beforeend', createImagesMarkup(hits));
      simplelightbox.refresh();
    })
    .catch(error => {
      Notify.failure(error.message);
    });
}