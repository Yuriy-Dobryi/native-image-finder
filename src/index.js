import 'modern-normalize';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Debounce from 'lodash.debounce';

import { PixabayApiService } from './js/pixabayApiService.js';
import { createImagesMarkup } from './js/createImagesMarkup.js';

const MIN_SCROLL_POSITION = 3000;
const MIN_DELAY_DEBOUNCE = 500;
let galleryHalfHeight;
let isFirstSubmit = true;
const pixabayApiService = new PixabayApiService;
const simplelightbox = new SimpleLightbox('.gallery a');

const REF = {
  form: document.getElementById('search-form'),
  gallery: document.querySelector('.gallery'),
  moveTopBtn: document.querySelector('.move-top'),
  loadMoreBtn: document.querySelector('.load-more'),
};

async function onFormSubmit(e) {
  e.preventDefault();
  pixabayApiService.searchQuery =
    e.currentTarget.elements.searchQuery.value.trim();
  if (pixabayApiService.searchQuery === '') {
    return Notify.info('Field must not be empty');
  }

  REF.gallery.innerHTML = '';
  changeBtnDisplay(REF.loadMoreBtn, 'none');
  pixabayApiService.resetPage();

  try {
    const { totalHits, hits } = await pixabayApiService.getData();
    if (totalHits === 0) {
      throw Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    REF.gallery.insertAdjacentHTML('beforeend', createImagesMarkup(hits));
    Notify.success(`Hooray! We found ${totalHits} images.`);
    simplelightbox.refresh();
    
    if (canLoadNextImages(totalHits)) {
      changeBtnDisplay(REF.loadMoreBtn, 'block');
    } else {
      changeBtnDisplay(REF.loadMoreBtn, 'none');
    }
    if (isFirstSubmit) {
      galleryHalfHeight = Math.floor(REF.gallery.offsetHeight / 2);
      isFirstSubmit = false;
    }
  } catch (error) {
    Notify.failure(error.message);
  }
}

function changeBtnDisplay(btn, value) {
  btn.style.display = value;
}

async function onLoadMoreBtn() {
  try {
    const { hits, totalHits } = await pixabayApiService.getData();

    REF.gallery.insertAdjacentHTML('beforeend', createImagesMarkup(hits));
    smoothScrolling();
    simplelightbox.refresh();

    if (canLoadNextImages(totalHits)) {
      changeBtnDisplay(REF.loadMoreBtn, 'block');
    } else {
      changeBtnDisplay(REF.loadMoreBtn, 'none');
      throw Error(`We're sorry, but you've reached the end of search results.`);
    }
  } catch (error) {
    Notify.warning(error.message);
  }
}

function canLoadNextImages(totalHits) {
  const galleryImagesCount = REF.gallery.children.length;
  return totalHits - galleryImagesCount > 0;
}

function onMoveTopBtn() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

function smoothScrolling() {
  const { height: cardHeight } = REF.gallery
    .firstElementChild
    .getBoundingClientRect();
  
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function updateMoveTopBtnDisplayByScroll() {
  // хочу щоб current брався саме від позиції скролу у галереї, а не від всієї сторінки
  const currentPosition = window.pageYOffset;

  changeBtnDisplay(
    REF.moveTopBtn,
    currentPosition > galleryHalfHeight ? 'block' : 'none'
  );
}

window.addEventListener(
  'scroll',
  Debounce(updateMoveTopBtnDisplayByScroll, MIN_DELAY_DEBOUNCE)
);

REF.form.addEventListener('submit', onFormSubmit);
REF.loadMoreBtn.addEventListener('click', onLoadMoreBtn);
REF.moveTopBtn.addEventListener('click', onMoveTopBtn);