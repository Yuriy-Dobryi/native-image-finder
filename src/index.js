import 'modern-normalize';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Debounce from 'lodash.debounce';

import { PixabayApiService } from './js/pixabayApiService.js';
import { createImagesMarkup } from './js/createImagesMarkup.js';

const pixabayApiService = new PixabayApiService;
const simplelightbox = new SimpleLightbox('.gallery a');

const galleryRef = document.querySelector('.gallery');
const formRef = document.getElementById('search-form');
formRef.addEventListener('submit', onFormSubmit); 

const loadMoreBtnRef = document.querySelector('.load-more');
changeBtnDisplay(loadMoreBtnRef, 'none');
loadMoreBtnRef.addEventListener('click', onLoadMoreBtnRef);

const moveTopBtnRef = document.querySelector('.move-top');
changeBtnDisplay(moveTopBtnRef, 'none');

moveTopBtnRef.addEventListener('click', onMoveTopBtnRef);

async function onFormSubmit(e) {
  e.preventDefault();
  pixabayApiService.searchQuery =
    e.currentTarget.elements.searchQuery.value.trim();

  if (pixabayApiService.searchQuery === '') {
    return Notify.info('Field must not be empty');
  }

  galleryRef.innerHTML = '';
  changeBtnDisplay(loadMoreBtnRef, 'none');
  pixabayApiService.resetPage();

  try {
    const { totalHits, hits } = await pixabayApiService.getData();
    if (totalHits === 0) {
      throw Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    Notify.success(`Hooray! We found ${totalHits} images.`);
    galleryRef.insertAdjacentHTML('beforeend', createImagesMarkup(hits));
    simplelightbox.refresh();
    changeBtnDisplay(loadMoreBtnRef, 'block');
  } catch (error) {
    Notify.failure(error.message);
  }
}

function changeBtnDisplay(btn, value) {
  btn.style.display = `${value}`;
}

async function onLoadMoreBtnRef() {
  try {
    const { hits } = await pixabayApiService.getData();
    if (hits.length === 0) {
      changeBtnDisplay(loadMoreBtnRef, 'none');
      throw Error(`We're sorry, but you've reached the end of search results.`);
    }

    galleryRef.insertAdjacentHTML('beforeend', createImagesMarkup(hits));
    smoothScrolling();
    simplelightbox.refresh();
  } catch (error) {
    Notify.failure(error.message);
  }
}

function onMoveTopBtnRef() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

function smoothScrolling() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

const MIN_DELAY_DEBOUNCE = 500;
const MIN_SCROLL_POSITION = 3000;
window.addEventListener(
  'scroll',
  Debounce(() => {
    const currentPosition = window.pageYOffset;

    changeBtnDisplay(moveTopBtnRef,
      currentPosition > MIN_SCROLL_POSITION
        ? 'block'
        : 'none')
  }, MIN_DELAY_DEBOUNCE)
);