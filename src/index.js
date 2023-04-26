import 'modern-normalize';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Debounce from 'lodash.debounce';

import { PixabayApiService } from './js/pixabayApiService.js';
import { createImagesMarkup } from './js/createImagesMarkup.js';

const pixabayApiService = new PixabayApiService;
const simplelightbox = new SimpleLightbox('.gallery a');
const MIN_DEBOUNCE_DELAY = 500;
const MIN_CURSOR_POSITION = 3000;

const REF = {
  form: document.getElementById('search-form'),
  gallery: document.querySelector('.gallery'),
  moveTopBtn: document.querySelector('.move-top'),
};

const pageObserver = new IntersectionObserver(loadNextImages);

async function onFormSubmit(e) {
  e.preventDefault();
  pixabayApiService.searchQuery =
    e.currentTarget.elements.searchQuery.value.trim();
  if (pixabayApiService.searchQuery === '') {
    return Notify.info('Field must not be empty');
  }

  REF.gallery.innerHTML = '';
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
    pageObserver.observe(REF.gallery.lastElementChild);

  } catch (error) {
    Notify.failure(error.message);
  }
}

function changeBtnDisplay(btn, value) {
  btn.style.display = value;
}

function loadNextImages(entries) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      pageObserver.disconnect();
      try {
        const { hits, totalHits } = await pixabayApiService.getData();
        if (thereIsNoImagesMore(totalHits)) {
          throw Error(
            `We're sorry, but you've reached the end of search results.`
          );
        }

        REF.gallery.insertAdjacentHTML('beforeend', createImagesMarkup(hits));
        smoothScrolling();
        simplelightbox.refresh();
        pageObserver.observe(REF.gallery.lastElementChild);
      } catch (error) {
        Notify.warning(error.message);
      }
    }
  });
}

function thereIsNoImagesMore(totalHits) {
  const galleryImagesCount = REF.gallery.children.length;
  return totalHits - galleryImagesCount <= 0;
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
  const currentCursorPosition = window.pageYOffset;

  changeBtnDisplay(
    REF.moveTopBtn,
    currentCursorPosition > MIN_CURSOR_POSITION ? 'block' : 'none'
  );
}

window.addEventListener(
  'scroll',
  Debounce(updateMoveTopBtnDisplayByScroll, MIN_DEBOUNCE_DELAY)
);

REF.form.addEventListener('submit', onFormSubmit);
REF.moveTopBtn.addEventListener('click', onMoveTopBtn);